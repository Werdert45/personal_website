#!/usr/bin/env python3
"""
Publish seed_content markdown to the site through the content API.

The files in backend/seed_content/ stay the versioned source of truth;
this script is the delivery mechanism (replacing the startup seeder for
day-to-day content ops). It upserts by slug: PATCH when the row exists,
POST when it does not.

Auth is the X-API-Key service key (CONTENT_API_KEY on the host). The API
is not publicly exposed; run against a tunnel or from the host:

    ssh -L 18001:<backend-container-ip>:8001 root@<host>
    CONTENT_API_KEY=... python backend/scripts/publish_content_api.py \
        --base-url http://localhost:18001 --all

Options:
    --all                 upsert every file under seed_content/
    --only slug [slug..]  upsert selected slugs only
    --publish slug [..]   force status=published for these slugs (overrides frontmatter)
    --delete slug [..]    delete these slugs (blog tried first, then research)
    --dry-run             print the plan, send nothing

Geodata mode (mutually exclusive with the content options above):
    --geojson FILE --slug SLUG [--value-field NAME] [--name NAME]
                          upsert FILE as the geodata dataset SLUG. The file
                          must be a GeoJSON FeatureCollection under ~1.5 MB
                          (simplify geometries first). --value-field is a
                          pre-upload check that the property exists on the
                          features (map fences read value_field from their
                          own config, not from the dataset row). Upsert is
                          by slug: PATCH api/geodata/<slug>/ when the row
                          exists, POST api/geodata/ when it does not.

Frontmatter parsing mirrors seed_beta_content: `key: value` scalars,
quoted strings, JSON inline lists, booleans, and `key: |` blocks indented
by two spaces. Unknown keys are sent as-is; DRF ignores what it doesn't
model.
"""

import argparse
import datetime
import json
import math
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

SEED_ROOT = Path(__file__).resolve().parent.parent / "seed_content"
KIND_ENDPOINT = {"blog": "blog", "research": "research"}
GEOJSON_MAX_BYTES = int(1.5 * 1024 * 1024)  # spec's ~1.5 MB dataset budget


def parse_frontmatter(text, path):
    if not text.startswith("---"):
        raise ValueError(f"{path}: no frontmatter")
    end = text.index("\n---", 3)
    raw, body = text[3:end].strip("\n"), text[end + 4 :].lstrip("\n")
    meta, lines, i = {}, raw.split("\n"), 0
    while i < len(lines):
        line = lines[i]
        i += 1
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        key, _, value = line.partition(":")
        key, value = key.strip(), value.strip()
        if value == "|":
            block = []
            while i < len(lines) and (lines[i].startswith("  ") or not lines[i].strip()):
                block.append(lines[i][2:])
                i += 1
            meta[key] = "\n".join(block).rstrip("\n")
        else:
            meta[key] = _scalar(value)
    return meta, body


def _scalar(value):
    if value.startswith("[") or value in ("true", "false"):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
        return value[1:-1]
    return value


def request(method, url, api_key, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("X-API-Key", api_key)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:500]
    except urllib.error.URLError as e:
        return None, str(e)


def upsert(base, api_key, kind, meta, body, force_publish, dry_run):
    slug = meta["slug"]
    endpoint = f"{base}/api/{KIND_ENDPOINT[kind]}/"
    payload = dict(meta)
    payload["content"] = body
    if force_publish:
        payload["status"] = "published"
    if not payload.get("read_time"):
        payload["read_time"] = math.ceil(len(body.split()) / 200)
    payload = {k: v for k, v in payload.items() if v not in ("", None)}

    exists, _ = request("GET", f"{endpoint}{slug}/", api_key)
    verb, url = ("PATCH", f"{endpoint}{slug}/") if exists == 200 else ("POST", endpoint)
    if dry_run:
        print(f"  DRY {verb} {url} status={payload.get('status', 'draft')}")
        return True
    status, out = request(verb, url, api_key, payload)
    ok = status in (200, 201)
    print(f"  {verb} {slug} -> {status}{'' if ok else f' {out}'}")
    return ok


def load_feature_collection(path, value_field):
    """Validate the file is a parseable FeatureCollection within budget."""
    p = Path(path)
    if not p.is_file():
        sys.exit(f"{path}: file not found")
    size = p.stat().st_size
    if size > GEOJSON_MAX_BYTES:
        sys.exit(
            f"{path}: {size:,} bytes exceeds the {GEOJSON_MAX_BYTES:,} byte "
            "budget (~1.5 MB) — simplify geometries before uploading"
        )
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        sys.exit(f"{path}: not valid JSON ({e})")
    if (
        not isinstance(data, dict)
        or data.get("type") != "FeatureCollection"
        or not isinstance(data.get("features"), list)
    ):
        sys.exit(f"{path}: not a GeoJSON FeatureCollection")
    if not data["features"]:
        sys.exit(f"{path}: FeatureCollection has no features")
    if value_field:
        missing = sum(
            1
            for f in data["features"]
            if not isinstance(f.get("properties"), dict)
            or value_field not in f["properties"]
        )
        total = len(data["features"])
        if missing == total:
            sys.exit(f"{path}: no feature carries property '{value_field}'")
        if missing:
            print(f"  warning: {missing}/{total} features lack property '{value_field}'")
    return data


def upsert_geojson(base, api_key, args):
    data = load_feature_collection(args.geojson, args.value_field)
    slug = args.slug
    endpoint = f"{base}/api/geodata/"
    payload = {
        "name": args.name or slug.replace("-", " ").replace("_", " ").title(),
        "slug": slug,
        "geojson": data,
        "last_updated": datetime.date.today().isoformat(),
    }

    exists, _ = request("GET", f"{endpoint}{slug}/", api_key)
    verb, url = ("PATCH", f"{endpoint}{slug}/") if exists == 200 else ("POST", endpoint)
    if args.dry_run:
        print(f"  DRY {verb} {url} features={len(data['features'])}")
        return True
    status, out = request(verb, url, api_key, payload)
    ok = status in (200, 201)
    print(f"  {verb} geodata/{slug} -> {status}{'' if ok else f' {out}'}")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", required=True)
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--only", nargs="*", default=[])
    ap.add_argument("--publish", nargs="*", default=[])
    ap.add_argument("--delete", nargs="*", default=[])
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--geojson", help="path to a GeoJSON FeatureCollection to upsert as a geodata dataset")
    ap.add_argument("--slug", help="geodata dataset slug (required with --geojson)")
    ap.add_argument("--value-field", help="feature property validated to exist before upload")
    ap.add_argument("--name", help="geodata dataset display name (default: derived from slug)")
    args = ap.parse_args()

    api_key = os.environ.get("CONTENT_API_KEY", "")
    if not api_key:
        sys.exit("CONTENT_API_KEY env var is required")
    base = args.base_url.rstrip("/")

    if args.geojson:
        if not args.slug:
            sys.exit("--slug is required with --geojson")
        if args.all or args.only or args.publish or args.delete:
            sys.exit("--geojson mode does not combine with content options")
        print(f"geodata/{args.slug}:")
        sys.exit(0 if upsert_geojson(base, api_key, args) else 1)

    failures = 0
    for slug in args.delete:
        for kind in KIND_ENDPOINT.values():
            url = f"{base}/api/{kind}/{slug}/"
            if args.dry_run:
                print(f"  DRY DELETE {url}")
                continue
            status, _ = request("DELETE", url, api_key)
            if status in (200, 202, 204):
                print(f"  DELETE {slug} ({kind}) -> {status}")
                break
        else:
            if not args.dry_run:
                print(f"  DELETE {slug}: not found in blog or research")

    targets = []
    for kind in ("blog", "research"):
        for path in sorted((SEED_ROOT / kind).glob("*.md")):
            meta, body = parse_frontmatter(path.read_text(encoding="utf-8"), path)
            if meta.get("slug") != path.stem:
                sys.exit(f"{path}: frontmatter slug != filename stem")
            if args.all or meta["slug"] in args.only or meta["slug"] in args.publish:
                targets.append((kind, meta, body))

    for kind, meta, body in targets:
        print(f"{kind}/{meta['slug']}:")
        if not upsert(base, api_key, kind, meta, body, meta["slug"] in args.publish, args.dry_run):
            failures += 1

    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
