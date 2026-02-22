"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownEditor } from "./markdown-editor";
import { GeodatasetSelector } from "./geodataset-selector";
import { ChevronDown, Save, Loader2 } from "lucide-react";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function estimateReadTime(content) {
  if (!content) return "";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

export function ResearchForm({ item, onSave, onCancel }) {
  const isEditing = !!item;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    abstract: "",
    content: "",
    category: "research",
    status: "draft",
    tags: "",
    read_time: "",
    date: "",
    has_map: false,
    map_config: { center: [4.9041, 52.3676], zoom: 10, style: "mapbox://styles/mapbox/light-v11" },
    geojson_endpoint: "",
    geodataset: null,
    value_field: "",
    is_premium: false,
  });

  const [translations, setTranslations] = useState({ nl: null, it: null });
  const [activeTab, setActiveTab] = useState("en");
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [sections, setSections] = useState({
    basic: true,
    content: true,
    map: false,
    premium: false,
    translations: false,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        slug: item.slug || "",
        abstract: item.abstract || "",
        content: item.content || "",
        category: item.category || "research",
        status: item.status || "draft",
        tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
        read_time: item.read_time || "",
        date: item.date || "",
        has_map: item.has_map || false,
        map_config: item.map_config || { center: [4.9041, 52.3676], zoom: 10, style: "mapbox://styles/mapbox/light-v11" },
        geojson_endpoint: item.geojson_endpoint || "",
        geodataset: item.geodataset || null,
        value_field: item.value_field || "",
        is_premium: item.is_premium || false,
      });
      if (item.has_map) setSections((s) => ({ ...s, map: true }));
      if (item.is_premium) setSections((s) => ({ ...s, premium: true }));

      // Load translations if available
      if (item.translations) {
        const nlTrans = item.translations.find((t) => t.language === "nl");
        const itTrans = item.translations.find((t) => t.language === "it");
        setTranslations({
          nl: nlTrans || null,
          it: itTrans || null,
        });
      }
    }
  }, [item]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [formData.title, autoSlug]);

  // Auto-calculate read time from content
  useEffect(() => {
    if (formData.content) {
      setFormData((prev) => ({ ...prev, read_time: estimateReadTime(prev.content) }));
    }
  }, [formData.content]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateMapConfig = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      map_config: { ...prev.map_config, [field]: value },
    }));
  };

  const updateTranslation = (lang, field, value) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...(prev[lang] || { language: lang }), [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = isEditing
        ? `research&id=${item.slug}`
        : "research";
      const method = isEditing ? "PUT" : "POST";

      const body = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/django?endpoint=${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to save");
      }

      const savedItem = await res.json();

      // Save translations
      for (const lang of ["nl", "it"]) {
        const trans = translations[lang];
        if (trans && (trans.title || trans.abstract || trans.content)) {
          const slug = savedItem.slug || formData.slug;
          await fetch(
            `/api/django?endpoint=research/${slug}/translations`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ ...trans, language: lang }),
            }
          );
        }
      }

      onSave();
    } catch (error) {
      console.error("Save failed:", error);
      alert(`Save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const SectionToggle = ({ id, title, children }) => (
    <Collapsible
      open={sections[id]}
      onOpenChange={(open) => setSections((s) => ({ ...s, [id]: open }))}
      className="border border-border rounded-lg"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            sections[id] ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <SectionToggle id="basic" title="Basic Information">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Article title"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Slug</Label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded"
                />
                Auto-generate
              </label>
            </div>
            <Input
              value={formData.slug}
              onChange={(e) => {
                setAutoSlug(false);
                updateField("slug", e.target.value);
              }}
              placeholder="article-slug"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Abstract</Label>
            <Textarea
              value={formData.abstract}
              onChange={(e) => updateField("abstract", e.target.value)}
              placeholder="Brief summary of the article"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => updateField("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="methodology">Methodology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => updateField("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                value={formData.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                placeholder="GIS, real estate, analysis"
              />
            </div>

            <div className="space-y-2">
              <Label>Display Date</Label>
              <Input
                value={formData.date}
                onChange={(e) => updateField("date", e.target.value)}
                placeholder="January 2025"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Read Time (auto-calculated)</Label>
            <Input
              value={formData.read_time}
              onChange={(e) => updateField("read_time", e.target.value)}
              placeholder="15 min"
              readOnly
            />
          </div>
        </div>
      </SectionToggle>

      {/* Content */}
      <SectionToggle id="content" title="Content (Markdown)">
        <MarkdownEditor
          value={formData.content}
          onChange={(v) => updateField("content", v)}
        />
      </SectionToggle>

      {/* Map Config */}
      <SectionToggle id="map" title="Map Configuration">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.has_map}
              onCheckedChange={(v) => updateField("has_map", v)}
            />
            <Label>Article includes an interactive map</Label>
          </div>

          {formData.has_map && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Center Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.map_config.center?.[0] ?? ""}
                    onChange={(e) =>
                      updateMapConfig("center", [
                        parseFloat(e.target.value),
                        formData.map_config.center?.[1] ?? 0,
                      ])
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Center Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.map_config.center?.[1] ?? ""}
                    onChange={(e) =>
                      updateMapConfig("center", [
                        formData.map_config.center?.[0] ?? 0,
                        parseFloat(e.target.value),
                      ])
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zoom Level</Label>
                  <Input
                    type="number"
                    min="0"
                    max="22"
                    value={formData.map_config.zoom ?? 10}
                    onChange={(e) =>
                      updateMapConfig("zoom", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Map Style</Label>
                <Select
                  value={formData.map_config.style || "mapbox://styles/mapbox/light-v11"}
                  onValueChange={(v) => updateMapConfig("style", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mapbox://styles/mapbox/light-v11">Light</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/dark-v11">Dark</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/streets-v12">Streets</SelectItem>
                    <SelectItem value="mapbox://styles/mapbox/satellite-v9">Satellite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>GeoJSON Endpoint</Label>
                <Input
                  value={formData.geojson_endpoint}
                  onChange={(e) => updateField("geojson_endpoint", e.target.value)}
                  placeholder="geodata/amsterdam-properties"
                />
              </div>

              <div className="space-y-2">
                <Label>Geodataset (PostGIS)</Label>
                <GeodatasetSelector
                  value={formData.geodataset}
                  onChange={(v) => updateField("geodataset", v)}
                />
              </div>

              <div className="space-y-2">
                <Label>Value Field</Label>
                <Input
                  value={formData.value_field}
                  onChange={(e) => updateField("value_field", e.target.value)}
                  placeholder="Field name for visualization values"
                />
              </div>
            </>
          )}
        </div>
      </SectionToggle>

      {/* Premium */}
      <SectionToggle id="premium" title="Premium Settings">
        <div className="flex items-center gap-3">
          <Switch
            checked={formData.is_premium}
            onCheckedChange={(v) => updateField("is_premium", v)}
          />
          <Label>Premium content (requires subscription)</Label>
        </div>
      </SectionToggle>

      {/* Translations */}
      <SectionToggle id="translations" title="Translations (NL / IT)">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="en">English (main)</TabsTrigger>
            <TabsTrigger value="nl">Nederlands</TabsTrigger>
            <TabsTrigger value="it">Italiano</TabsTrigger>
          </TabsList>

          <TabsContent value="en">
            <p className="text-sm text-muted-foreground">
              English content is managed in the Basic Info and Content sections above.
            </p>
          </TabsContent>

          {["nl", "it"].map((lang) => (
            <TabsContent key={lang} value={lang}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title ({lang.toUpperCase()})</Label>
                  <Input
                    value={translations[lang]?.title || ""}
                    onChange={(e) => updateTranslation(lang, "title", e.target.value)}
                    placeholder={`Title in ${lang === "nl" ? "Dutch" : "Italian"}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug ({lang.toUpperCase()})</Label>
                  <Input
                    value={translations[lang]?.slug || ""}
                    onChange={(e) => updateTranslation(lang, "slug", e.target.value)}
                    placeholder={`slug-in-${lang}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abstract ({lang.toUpperCase()})</Label>
                  <Textarea
                    value={translations[lang]?.abstract || ""}
                    onChange={(e) => updateTranslation(lang, "abstract", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content ({lang.toUpperCase()})</Label>
                  <MarkdownEditor
                    value={translations[lang]?.content || ""}
                    onChange={(v) => updateTranslation(lang, "content", v)}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SectionToggle>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEditing ? "Save Changes" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
