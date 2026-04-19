"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function AboutContent() {
  const t = useTranslations("About");
  const [tab, setTab] = useState("pro");

  const experience = t.raw("experience") || [];
  const education = t.raw("education") || [];

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 160 }}>
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 02</span>
          <span>{t("sectionKicker")}</span>
        </div>

        <div className="about-top">
          <div>
            <h2>
              {t("heroTitleLine1a")} <i>{t("heroTitleLine1aItalic")}</i> —<br />
              {t("heroTitleLine2")} <span className="u">{t("heroTitleLine2Underline")}</span>
              <br />
              {t("heroTitleLine3")}
            </h2>
            <p className="lede">
              {t("lede1")}
            </p>
            <p className="lede">
              {t("lede2")}
            </p>
          </div>
          <div className="portrait">
            <Image src="/profile.jpg" alt="Ian Ronk" width={600} height={800} priority />
            <span className="cap">{t("portraitCaption")}</span>
          </div>
        </div>

        <div className="about-facts">
          <div className="fact">
            <span className="k">{t("factRole")}</span>
            <span className="v"><b>{t("factRoleValueHighlight")}</b> {t("factRoleValueRest")}</span>
          </div>
          <div className="fact">
            <span className="k">{t("factBasis")}</span>
            <span className="v">{t("factBasisValue")}</span>
          </div>
          <div className="fact">
            <span className="k">{t("factExperience")}</span>
            <span className="v"><b>{t("factExperienceValueHighlight")}</b> {t("factExperienceValueRest")}</span>
          </div>
          <div className="fact">
            <span className="k">{t("factMarkets")}</span>
            <span className="v"><b>{t("factMarketsValueHighlight")}</b> {t("factMarketsValueRest")}</span>
          </div>
          <div className="fact">
            <span className="k">{t("factClients")}</span>
            <span className="v">{t("factClientsValue")}</span>
          </div>
          <div className="fact">
            <span className="k">{t("factStack")}</span>
            <span className="v">{t("factStackValue")}</span>
          </div>
        </div>
      </section>

      <section className="xp">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 03</span>
          <span>{t("journeyKicker")}</span>
        </div>
        <h2>
          <i>{t("journeyTitlePrefixItalic")}</i> {t("journeyTitleRest")}<br />
          {t("journeyTitleLine2")}
        </h2>
        <p className="lede">{t("experienceSubtitle")}</p>

        <div className="xp-toggle">
          <button className={tab === "pro" ? "sel" : ""} onClick={() => setTab("pro")}>{t("professional")}</button>
          <button className={tab === "aca" ? "sel" : ""} onClick={() => setTab("aca")}>{t("academic")}</button>
        </div>

        {tab === "pro" && (
          <div className="xp-list">
            {experience.map((job, i) => (
              <div className="xp-item" key={i}>
                <div className="y">{job.year}</div>
                <div className="n">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="r">{renderRole(job.role)}</div>
                  <div className="c">{job.company}</div>
                </div>
                <div className="d">{job.description}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "aca" && (
          <div className="xp-list">
            {education.map((edu, i) => (
              <div className="xp-item" key={i}>
                <div className="y">{edu.year}</div>
                <div className="n">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div className="r">{renderRole(edu.degree)}</div>
                  <div className="c">{edu.institution}</div>
                </div>
                <div className="d">{edu.description}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function renderRole(role) {
  if (!role) return null;
  // Italicize last word by convention
  const parts = role.split(" ");
  if (parts.length === 1) return <i>{role}</i>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <i>{last}</i>
    </>
  );
}
