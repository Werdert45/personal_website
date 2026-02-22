"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";

function getTranslated(item, field, locale) {
  if (locale === "en") return item[field];
  const trans = item.translations?.find((t) => t.language === locale);
  return trans?.[field] || item[field];
}

export function ResearchPreview() {
  const [articles, setArticles] = useState([]);
  const t = useTranslations("Research");
  const locale = useLocale();

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/django?endpoint=research");
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          setArticles(results.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching research:", err);
      }
    }
    fetchArticles();
  }, []);

  if (articles.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 md:mb-12 gap-4">
          <div>
            <Badge variant="outline" className="mb-4">{t("previewBadge")}</Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-balance">
              {t("previewTitle")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
              {t("previewSubtitle")}
            </p>
          </div>
          <Button variant="outline" asChild className="w-full md:w-auto md:ml-4 md:mt-2 bg-transparent">
            <Link href={`/${locale}/research`} className="flex items-center justify-center md:justify-start gap-2">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 md:gap-4">
          {articles.map((item) => (
            <Link key={item.id} href={`/${locale}/research/${item.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2 md:gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                      {item.date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </span>
                      )}
                      {item.read_time && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.read_time}
                        </span>
                      )}
                    </div>
                    <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {getTranslated(item, "title", locale)}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm line-clamp-2">
                    {getTranslated(item, "abstract", locale)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
