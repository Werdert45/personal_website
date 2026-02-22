"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Building2,
  Calendar,
  GraduationCap,
  Briefcase,
  Brain,
  Database,
  Map,
  Pickaxe,
  ArrowRight,
  Mail,
  Linkedin,
  Bot,
  Users,
} from "lucide-react";

const expertiseIcons = [Brain, Database, Map, Pickaxe];

const projects = [
  {
    slug: "languagebuddy",
    icon: Bot,
    color: "from-yellow-500/20 to-amber-500/20",
    borderColor: "border-yellow-500/30",
    accentColor: "text-yellow-500",
  },
  {
    slug: "abm-gentrification",
    icon: Users,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    accentColor: "text-purple-500",
  },
];

const projectContent = {
  en: {
    languagebuddy: {
      title: "LanguageBuddy",
      description:
        "An AI-powered language learning chatbot that helps users practice conversations in multiple languages with real-time corrections and adaptive difficulty.",
      tags: ["AI", "NLP", "React", "Python"],
    },
    "abm-gentrification": {
      title: "ABM Gentrification Thesis",
      description:
        "Master's thesis building an Agent-Based Model to explain and predict gentrification patterns in European cities. Grade: 8/8 at Bocconi University.",
      tags: ["Agent-Based Modeling", "Python", "Geospatial", "Research"],
    },
  },
  nl: {
    languagebuddy: {
      title: "LanguageBuddy",
      description:
        "Een AI-aangedreven taalleerchatbot die gebruikers helpt gesprekken te oefenen in meerdere talen met real-time correcties en adaptieve moeilijkheidsgraad.",
      tags: ["AI", "NLP", "React", "Python"],
    },
    "abm-gentrification": {
      title: "ABM Gentrificatie Scriptie",
      description:
        "Masterscriptie over het bouwen van een Agent-Based Model om gentrificatiepatronen in Europese steden te verklaren en voorspellen. Cijfer: 8/8 aan Bocconi Universiteit.",
      tags: ["Agent-Based Modeling", "Python", "Geospatiaal", "Onderzoek"],
    },
  },
  it: {
    languagebuddy: {
      title: "LanguageBuddy",
      description:
        "Un chatbot di apprendimento linguistico basato sull'AI che aiuta gli utenti a praticare conversazioni in più lingue con correzioni in tempo reale e difficoltà adattiva.",
      tags: ["AI", "NLP", "React", "Python"],
    },
    "abm-gentrification": {
      title: "Tesi ABM Gentrificazione",
      description:
        "Tesi di laurea magistrale sulla costruzione di un Modello Agent-Based per spiegare e prevedere i pattern di gentrificazione nelle città europee. Voto: 8/8 all'Università Bocconi.",
      tags: ["Agent-Based Modeling", "Python", "Geospaziale", "Ricerca"],
    },
  },
  de: {
    languagebuddy: {
      title: "LanguageBuddy",
      description:
        "Ein KI-gestützter Sprachlern-Chatbot, der Nutzern hilft, Gespräche in mehreren Sprachen mit Echtzeit-Korrekturen und adaptivem Schwierigkeitsgrad zu üben.",
      tags: ["AI", "NLP", "React", "Python"],
    },
    "abm-gentrification": {
      title: "ABM Gentrifizierung Abschlussarbeit",
      description:
        "Masterarbeit über den Aufbau eines Agentenbasierten Modells zur Erklärung und Vorhersage von Gentrifizierungsmustern in europäischen Städten. Note: 8/8 an der Bocconi Universität.",
      tags: ["Agent-Based Modeling", "Python", "Geodaten", "Forschung"],
    },
  },
};

export function AboutContent() {
  const t = useTranslations("About");
  const ct = useTranslations("Contact");
  const pt = useTranslations("AboutPage");
  const locale = useLocale();

  const expertise = t.raw("expertise");
  const experience = t.raw("experience");
  const education = t.raw("education");

  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
          <div className="lg:w-1/3">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-muted border border-border shadow-lg mx-auto lg:mx-0">
              <Image
                src="/profile.jpg"
                alt="Ian Ronk"
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
          <div className="lg:w-2/3">
            <Badge variant="secondary" className="mb-4">
              {ct("aboutBadge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Ian Ronk</h1>
            <p className="text-lg md:text-xl text-primary font-medium mb-4">
              {ct("roleTitle")}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {ct("bio")}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {ct("location")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4 text-primary" />
                {ct("company")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                {ct("yearsExperience")}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://www.linkedin.com/in/ian-ronk-7b054a120"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${locale}/contact`} className="gap-2">
                  <Mail className="w-4 h-4" />
                  Contact
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Core Competencies */}
        <div className="mb-16">
          <Badge variant="outline" className="mb-4">
            {t("expertiseBadge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("coreCompetencies")}
          </h2>
          <p className="text-muted-foreground mb-8">{t("expertiseSubtitle")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertise.map((item, i) => {
              const Icon = expertiseIcons[i];
              return (
                <Card key={i} className="border-border">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-16">
          <Badge variant="outline" className="mb-4">
            <Briefcase className="w-3 h-3 mr-1" />
            {t("experienceBadge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("professionalTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("experienceSubtitle")}
          </p>

          <div className="space-y-5">
            {experience.map((item, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.role}</h3>
                      <p className="text-primary text-sm font-medium">
                        {item.company}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap self-start">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-16">
          <Badge variant="outline" className="mb-4">
            <GraduationCap className="w-3 h-3 mr-1" />
            {t("educationBadge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("academicTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("educationSubtitle")}
          </p>

          <div className="space-y-5">
            {education.map((item, i) => (
              <Card key={i} className="border-border bg-primary/5">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.degree}</h3>
                      <p className="text-primary text-sm font-medium">
                        {item.institution}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full whitespace-nowrap self-start">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Projects */}
        <div>
          <Badge variant="outline" className="mb-4">
            {pt("projectsBadge")}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {pt("projectsTitle")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {pt("projectsSubtitle")}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => {
              const Icon = project.icon;
              const content =
                projectContent[locale]?.[project.slug] ||
                projectContent.en[project.slug];
              return (
                <Link
                  key={project.slug}
                  href={`/${locale}/about/projects/${project.slug}`}
                >
                  <Card
                    className={`border ${project.borderColor} hover:shadow-lg transition-all duration-300 group h-full`}
                  >
                    <CardContent className="p-6 md:p-8">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className={`w-6 h-6 ${project.accentColor}`} />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {content.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {content.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {content.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {pt("readMore")} <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
