"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function AuthorTrailer({ location = "post_author" }) {
  const locale = useLocale();
  const t = useTranslations("Author");

  return (
    <aside className="mt-12 flex items-start gap-4 border-t pt-6">
      <Image
        src="/ianronk.jpeg"
        alt="Ian Ronk"
        width={56}
        height={56}
        className="rounded-full object-cover"
      />
      <div>
        <p className="font-medium">Ian Ronk</p>
        <p className="text-sm opacity-70">{t("roleLine")}</p>
        <p className="text-sm mt-1 max-w-prose">{t("bio")}</p>
        <Link
          href={`/${locale}/about`}
          className="btn ghost mt-3"
          onClick={() =>
            trackEvent("cta_click", {
              cta: "about_me",
              location,
              source: "author_trailer",
            })
          }
        >
          {t("cta")}
        </Link>
      </div>
    </aside>
  );
}
