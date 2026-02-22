"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Search,
  ArrowRight,
  FileText,
  BookOpen,
  Lightbulb,
  Loader2,
  Map,
} from "lucide-react";

function getTranslated(item, field, locale) {
  if (locale === "en") return item[field];
  const trans = item.translations?.find((t) => t.language === locale);
  return trans?.[field] || item[field];
}

export function ResearchList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [researchItems, setResearchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Research");
  const locale = useLocale();

  const categories = [
    { value: "all", label: t("all"), icon: FileText },
    { value: "research", label: t("research"), icon: BookOpen },
    { value: "case-study", label: t("caseStudies"), icon: Lightbulb },
    { value: "methodology", label: t("methodology"), icon: FileText },
  ];

  useEffect(() => {
    async function fetchResearch() {
      try {
        setLoading(true);
        const response = await fetch("/api/django?endpoint=research");
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          setResearchItems(results);
        }
      } catch (err) {
        console.error("Error fetching research:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResearch();
  }, []);

  const filteredItems = researchItems.filter((item) => {
    const title = getTranslated(item, "title", locale);
    const abstract = getTranslated(item, "abstract", locale);
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags || []).some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <section className="pt-32 pb-24">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("loading")}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-24">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            {t("badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="gap-2"
              >
                <cat.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/${locale}/research/${item.slug}`}>
              <Card className="bg-card border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group overflow-hidden">
                {/* Preview image or placeholder */}
                {item.preview_image ? (
                  <img
                    src={item.preview_image}
                    alt=""
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.has_map && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Map className="w-3 h-3" />
                          {t("interactiveMap")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {getTranslated(item, "title", locale)}
                  </h2>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
                    {getTranslated(item, "abstract", locale)}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </span>
                      )}
                      {item.read_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.read_time}
                        </span>
                      )}
                    </div>
                    <span className="text-primary flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t("readMore")} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("noResults")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
