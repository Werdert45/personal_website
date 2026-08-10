"""
Management command to seed beta blog/research content as DRAFTS.

Scans backend/seed_content/blog/*.md and backend/seed_content/research/*.md.
Each file is YAML frontmatter (--- delimited) + a markdown body. The body
becomes BlogPost.content / Research.content; Research additionally takes
`abstract` from the frontmatter.

Rules:
- Upsert by slug. The frontmatter slug must equal the filename stem.
- status is ALWAYS forced to 'draft' on create; any status key in the
  frontmatter is ignored with a warning.
- An existing row whose status is still 'draft' is updated in place.
- An existing row whose status was manually changed (published/archived)
  is SKIPPED entirely — the command never overwrites it and never flips
  published back to draft.
- read_time: computed as ceil(wordcount/200) when blank in frontmatter.
- `date` is never invented — it stays blank until set by hand.

Opt-in only: this command runs solely when invoked manually —
    python manage.py seed_beta_content [--dry-run] [--only <slug>]
It is wired into no entrypoint, migration, CI step, or startup hook.

The frontmatter is hand-parsed (no PyYAML dependency): it supports
`key: value` scalars, quoted strings, JSON-style inline lists, booleans,
and `key: |` literal blocks indented by two spaces.
"""

import json
import math
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.blog.models import BlogPost
from apps.research.models import Research


CONTENT_ROOT = Path(settings.BASE_DIR) / "seed_content"

# Frontmatter keys that map directly onto model fields, per app.
BLOG_FIELDS = {
    "title", "excerpt", "category", "tags", "read_time", "date",
    "author", "featured", "is_premium", "cover_image", "meta",
}
RESEARCH_FIELDS = {
    "title", "abstract", "category", "tags", "read_time", "date",
    "publication_status", "doi", "arxiv_id", "repo_url", "cite_as",
    "preview_image", "is_premium",
}

# Keys handled specially (never copied verbatim onto the model).
CONTROL_KEYS = {"slug", "status"}


def _parse_scalar(value):
    """Parse a single-line frontmatter value."""
    if value.startswith("[") or value.startswith("{"):
        return json.loads(value)
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    if value.lower() == "true":
        return True
    if value.lower() == "false":
        return False
    return value


def parse_frontmatter(text, path):
    """Split a file into (frontmatter dict, markdown body)."""
    if not text.startswith("---\n"):
        raise CommandError(f"{path}: file must start with '---' frontmatter")
    end = text.find("\n---\n", 3)
    if end == -1:
        raise CommandError(f"{path}: unterminated frontmatter block")
    raw = text[4:end]
    body = text[end + len("\n---\n"):].lstrip("\n")

    meta = {}
    lines = raw.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            raise CommandError(f"{path}: cannot parse frontmatter line: {line!r}")
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if value == "|":
            block = []
            while i < len(lines) and (lines[i].startswith("  ") or not lines[i].strip()):
                block.append(lines[i][2:] if lines[i].startswith("  ") else "")
                i += 1
            meta[key] = "\n".join(block).strip()
        else:
            meta[key] = _parse_scalar(value)
    return meta, body


def compute_read_time(body):
    """ceil(wordcount / 200), formatted like '7 min' (matches model help text)."""
    words = len(body.split())
    return f"{max(1, math.ceil(words / 200))} min"


class Command(BaseCommand):
    help = (
        "Seed beta blog/research content from backend/seed_content/ as drafts. "
        "Never overwrites rows whose status was manually changed."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report create/update/skip decisions without writing anything",
        )
        parser.add_argument(
            "--only",
            metavar="SLUG",
            help="Seed only the item with this slug",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        only = options["only"]

        if not CONTENT_ROOT.is_dir():
            raise CommandError(f"Content directory not found: {CONTENT_ROOT}")

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run — no writes will happen."))

        created, updated, skipped = [], [], []
        matched_any = False

        for subdir, model, allowed in (
            ("blog", BlogPost, BLOG_FIELDS),
            ("research", Research, RESEARCH_FIELDS),
        ):
            directory = CONTENT_ROOT / subdir
            if not directory.is_dir():
                continue
            for path in sorted(directory.glob("*.md")):
                slug = path.stem
                if only and slug != only:
                    continue
                matched_any = True
                action = self.seed_file(path, slug, model, allowed, dry_run)
                {"created": created, "updated": updated, "skipped": skipped}[action].append(slug)

        if only and not matched_any:
            raise CommandError(f"--only {only}: no content file with that slug found")

        prefix = "Would " if dry_run else ""
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(
            f"Summary: {prefix.lower() or ''}created {len(created)}, "
            f"updated {len(updated)}, skipped {len(skipped)}."
        ))
        for label, slugs in (("created", created), ("updated", updated), ("skipped", skipped)):
            if slugs:
                self.stdout.write(f"  {prefix}{label}: {', '.join(slugs)}")

    def seed_file(self, path, slug, model, allowed, dry_run):
        """Upsert a single content file. Returns 'created' | 'updated' | 'skipped'."""
        meta, body = parse_frontmatter(path.read_text(encoding="utf-8"), path)

        # Slug drift guard: frontmatter slug must equal the filename stem.
        fm_slug = meta.get("slug")
        if fm_slug != slug:
            raise CommandError(
                f"{path}: frontmatter slug {fm_slug!r} does not match filename stem {slug!r}"
            )

        if "status" in meta:
            self.stdout.write(self.style.WARNING(
                f"  [{slug}] frontmatter 'status' key ignored — "
                f"status is managed by this command (draft on create, never downgraded)"
            ))

        for key in meta:
            if key not in allowed and key not in CONTROL_KEYS:
                self.stdout.write(self.style.WARNING(
                    f"  [{slug}] ignoring unknown frontmatter key {key!r}"
                ))

        fields = {key: meta[key] for key in allowed if key in meta}
        fields["content"] = body
        if not fields.get("read_time"):
            fields["read_time"] = compute_read_time(body)
        # `date` is never invented: only set if explicitly present in frontmatter.

        existing = model.objects.filter(slug=slug).first()

        if existing is None:
            # status is ALWAYS forced to 'draft' on create.
            if not dry_run:
                model.objects.create(slug=slug, status="draft", **fields)
            self.stdout.write(f"  Created (draft): {slug} [{model.__name__}]")
            return "created"

        if existing.status != "draft":
            # Manually published/archived — never overwrite, never flip back.
            self.stdout.write(self.style.WARNING(
                f"  SKIPPED {slug}: status is {existing.status!r} "
                f"(manually changed) — this command never overwrites it"
            ))
            return "skipped"

        if not dry_run:
            for key, value in fields.items():
                setattr(existing, key, value)
            existing.status = "draft"  # explicit: updates keep draft status
            existing.save()
        self.stdout.write(f"  Updated (draft): {slug} [{model.__name__}]")
        return "updated"
