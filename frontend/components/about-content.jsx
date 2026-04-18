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
          <span>About — who, where, how</span>
        </div>

        <div className="about-top">
          <div>
            <h2>
              Head of <i>Data</i> —<br />
              Real Estate <span className="u">AI</span>
              <br />
              &amp; Analytics.
            </h2>
            <p className="lede">
              Based in Amsterdam, I lead data initiatives at KR&amp;A, delivering AI-powered insights for European real estate funds, REITs and institutional investors. With expertise in machine learning, geospatial analysis, and alternative data, I help transform complex data into investment decisions.
            </p>
            <p className="lede">
              My bias: opinionated internal tools beat big platforms; a tested pipeline beats a clever one; and a map should answer a question, not perform complexity.
            </p>
          </div>
          <div className="portrait">
            <Image src="/profile.jpg" alt="Ian Ronk" width={600} height={800} priority />
            <span className="cap">IAN · AMS · 2026</span>
          </div>
        </div>

        <div className="about-facts">
          <div className="fact">
            <span className="k">Role</span>
            <span className="v"><b>Head of Data</b> · KR&amp;A, Europe · FinTech</span>
          </div>
          <div className="fact">
            <span className="k">Basis</span>
            <span className="v">Amsterdam, Netherlands · working EU-wide</span>
          </div>
          <div className="fact">
            <span className="k">Experience</span>
            <span className="v"><b>4+ years</b> in Real Estate Data Science</span>
          </div>
          <div className="fact">
            <span className="k">Markets</span>
            <span className="v"><b>15+</b> European markets mapped</span>
          </div>
          <div className="fact">
            <span className="k">Clients</span>
            <span className="v">REITs · funds · Eurostat · leading real-estate companies</span>
          </div>
          <div className="fact">
            <span className="k">Stack</span>
            <span className="v">Python · PostGIS · Airflow · Docker · PyTorch · React</span>
          </div>
        </div>
      </section>

      <section className="xp">
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 03</span>
          <span>Professional journey</span>
        </div>
        <h2>
          <i>Four</i> years delivering<br />
          data-driven insights.
        </h2>
        <p className="lede">{t("experienceSubtitle")}</p>

        <div className="xp-toggle">
          <button className={tab === "pro" ? "sel" : ""} onClick={() => setTab("pro")}>Professional</button>
          <button className={tab === "aca" ? "sel" : ""} onClick={() => setTab("aca")}>Academic</button>
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
