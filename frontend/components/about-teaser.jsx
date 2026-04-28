"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function AboutTeaser() {
  const t = useTranslations("AboutTeaser");
  const locale = useLocale();

  return (
    <section className="section-pad about-teaser">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 02</span>
        <span>{t("kicker")}</span>
      </div>

      <div className="about-top">
        <div>
          <h2>
            {t("titleLine1")} <i>{t("titleLine1Italic")}</i>
            <br />
            {t("titleLine2")} <span className="u">{t("titleLine2Underline")}</span>
          </h2>
          <p className="lede">{t("bio1")}</p>
          <p className="lede" style={{ marginTop: 18 }}>{t("bio2")}</p>

          <Link
            href={`/${locale}/about`}
            className="btn primary about-teaser-cta"
            onClick={() => trackEvent("cta_click", { cta: "about_full_bio", location: "home_about_teaser", source: "home_about_teaser" })}
            style={{ marginTop: 36 }}
          >
            <span>{t("cta")}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="portrait">
          <Image src="/profile.jpg" alt="Ian Ronk" width={600} height={800} priority={false} />
          <span className="cap">{t("portraitCaption")}</span>
        </div>
      </div>

      <div className="about-facts about-facts-teaser">
        <div className="fact">
          <span className="k">{t("factRoleK")}</span>
          <span className="v">{t("factRoleV")}</span>
        </div>
        <div className="fact">
          <span className="k">{t("factBasisK")}</span>
          <span className="v">{t("factBasisV")}</span>
        </div>
        <div className="fact">
          <span className="k">{t("factEduK")}</span>
          <span className="v">{t("factEduV")}</span>
        </div>
        <div className="fact">
          <span className="k">{t("factStackK")}</span>
          <span className="v">{t("factStackV")}</span>
        </div>
      </div>
    </section>
  );
}
