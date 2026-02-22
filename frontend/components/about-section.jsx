"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Database, Brain, Briefcase, GraduationCap, Pickaxe } from "lucide-react";

const expertiseIcons = [Brain, Database, Map, Pickaxe];

export function AboutSection() {
  const [showEducation, setShowEducation] = useState(false);
  const t = useTranslations("About");

  const expertise = t.raw("expertise");
  const experience = t.raw("experience");
  const education = t.raw("education");

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container px-4 md:px-6">
        {/* Expertise Section */}
        <div className="mb-16 md:mb-20">
          <Badge variant="outline" className="mb-4">{t("expertiseBadge")}</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            {t("coreCompetencies")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mb-8 md:mb-12">
            {t("expertiseSubtitle")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {expertise.map((item, index) => {
              const Icon = expertiseIcons[index] || Brain;
              return (
                <Card key={index} className="bg-muted/50 border-border">
                  <CardContent className="p-6">
                    <Icon className="w-8 h-8 text-primary mb-3" />
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Experience / Education Toggle Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <Badge variant="outline" className="mb-4">
                {showEducation ? <GraduationCap className="w-3 h-3 mr-1" /> : <Briefcase className="w-3 h-3 mr-1" />}
                {showEducation ? t("educationBadge") : t("experienceBadge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                {showEducation ? t("academicTitle") : t("professionalTitle")}
              </h2>
            </div>

            <div className="flex items-center gap-3 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setShowEducation(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !showEducation
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">{t("professional")}</span>
              </button>
              <button
                onClick={() => setShowEducation(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  showEducation
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">{t("academic")}</span>
              </button>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl mb-8 md:mb-12">
            {showEducation ? t("educationSubtitle") : t("experienceSubtitle")}
          </p>

          {!showEducation && (
            <div className="space-y-4 md:space-y-6">
              {experience.map((job, index) => (
                <Card key={index} className="border-border">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-base md:text-lg">{job.role}</h3>
                        <p className="text-sm text-primary">{job.company}</p>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground mt-2 md:mt-0 font-medium whitespace-nowrap">
                        {job.year}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {job.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {showEducation && (
            <div className="space-y-4 md:space-y-6">
              {education.map((edu, index) => (
                <Card key={index} className="border-border bg-muted/30">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-base md:text-lg">{edu.degree}</h3>
                        <p className="text-sm text-primary">{edu.institution}</p>
                      </div>
                      <span className="text-xs md:text-sm text-muted-foreground mt-2 md:mt-0 font-medium whitespace-nowrap">
                        {edu.year}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {edu.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
