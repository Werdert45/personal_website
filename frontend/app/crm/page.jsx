"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Map,
  BarChart3,
  Calendar,
  User,
  Loader2,
  RefreshCw,
  AlertCircle,
  Database,
  ArrowLeft,
  Save,
  FileUp,
  ImagePlus,
  X,
  Languages,
} from "lucide-react";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { GeoFileUpload, GeoFieldSelector, GeoDatasetSelector } from "@/components/crm";

export default function CRMPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [research, setResearch] = useState([]);
  const [visualizations, setVisualizations] = useState([]);
  const [loadingResearch, setLoadingResearch] = useState(true);
  const [loadingVisualizations, setLoadingVisualizations] = useState(true);
  const [token, setToken] = useState(null);

  // Inline form state
  const [formMode, setFormMode] = useState(null); // null | "research" | "visualization"
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [geoDataMode, setGeoDataMode] = useState("paste");
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [uploadedDataset, setUploadedDataset] = useState(null);

  // Inline translations state
  const [translatingItem, setTranslatingItem] = useState(null); // { type, item }
  const [translationData, setTranslationData] = useState({});
  const [savingTranslation, setSavingTranslation] = useState(false);

  // Website translations state
  const [siteTranslations, setSiteTranslations] = useState(null);
  const [loadingSiteTranslations, setLoadingSiteTranslations] = useState(false);
  const [savingSiteTranslations, setSavingSiteTranslations] = useState(false);
  const [siteTranslationSection, setSiteTranslationSection] = useState(null); // which section is being edited
  const [siteTranslationDraft, setSiteTranslationDraft] = useState(""); // yaml draft

  useEffect(() => {
    const auth = localStorage.getItem("crm_authenticated");
    const storedToken = localStorage.getItem("crm_token");
    if (!auth) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      setToken(storedToken);
      fetchResearch();
      fetchVisualizations();
    }
  }, [router]);

  const fetchResearch = async () => {
    try {
      setLoadingResearch(true);
      const storedToken = localStorage.getItem("crm_token");
      const response = await fetch("/api/django?endpoint=research", {
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setResearch(data.results || data);
      }
    } catch (err) {
      console.error("Error fetching research:", err);
    } finally {
      setLoadingResearch(false);
    }
  };

  const fetchVisualizations = async () => {
    try {
      setLoadingVisualizations(true);
      const storedToken = localStorage.getItem("crm_token");
      const response = await fetch("/api/django?endpoint=research/visualizations", {
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setVisualizations(data.results || data);
      }
    } catch (err) {
      console.error("Error fetching visualizations:", err);
    } finally {
      setLoadingVisualizations(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("crm_authenticated");
    localStorage.removeItem("crm_user");
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_refresh");
    router.push("/login");
  };

  const openResearchForm = (item = null) => {
    setEditingItem(item);
    setError(null);
    setGeoDataMode(item?.geodataset_id ? "existing" : "paste");
    setSelectedDataset(item?.geodataset_id ? { id: item.geodataset_id, available_fields: item.available_fields || [], field_types: item.field_types || {} } : null);
    setUploadedDataset(null);
    setFormData({
      title: item?.title || "",
      category: item?.category || "research",
      author: item?.author || "Ian Ronk",
      abstract: item?.abstract || "",
      content: item?.content || "",
      tags: item ? (item.tags || []).join(", ") : "",
      status: item?.status || "draft",
      geojson_data: item?.geojson_data ? JSON.stringify(item.geojson_data, null, 2) : "",
      geodataset_id: item?.geodataset_id || null,
      value_field: item?.value_field || null,
      has_map: item?.has_map || false,
      map_config: item?.map_config || { center: [10, 50], zoom: 4 },
      pdf_file: null,
      preview_image: null,
      preview_image_url: item?.preview_image || null,
      title_en: item?.translations?.title?.en || item?.title || "",
      title_nl: item?.translations?.title?.nl || "",
      title_it: item?.translations?.title?.it || "",
      title_de: item?.translations?.title?.de || "",
      abstract_en: item?.translations?.abstract?.en || item?.abstract || "",
      abstract_nl: item?.translations?.abstract?.nl || "",
      abstract_it: item?.translations?.abstract?.it || "",
      abstract_de: item?.translations?.abstract?.de || "",
    });
    setFormMode("research");
  };

  const openVisualizationForm = (item = null) => {
    setEditingItem(item);
    setError(null);
    setGeoDataMode(item?.geodataset_id ? "existing" : "paste");
    setSelectedDataset(item?.geodataset_id ? { id: item.geodataset_id, available_fields: item.available_fields || [], field_types: item.field_types || {} } : null);
    setUploadedDataset(null);
    setFormData({
      title: item?.title || "",
      category: item?.category || "heatmap",
      description: item?.description || "",
      content: item?.content || "",
      region: item?.region || "",
      data_points: item?.data_points || "",
      status: item?.status || "draft",
      technologies: item ? (item.technologies || []).join(", ") : "",
      metrics: item?.metrics ? JSON.stringify(item.metrics, null, 2) : "",
      geojson_data: item?.geojson_data ? JSON.stringify(item.geojson_data, null, 2) : "",
      geodataset_id: item?.geodataset_id || null,
      value_field: item?.value_field || null,
      map_config: item?.map_config || { center: [10, 50], zoom: 4 },
      preview_image: null,
      preview_image_url: item?.preview_image || null,
      title_en: item?.translations?.title?.en || item?.title || "",
      title_nl: item?.translations?.title?.nl || "",
      title_it: item?.translations?.title?.it || "",
      title_de: item?.translations?.title?.de || "",
      description_en: item?.translations?.description?.en || item?.description || "",
      description_nl: item?.translations?.description?.nl || "",
      description_it: item?.translations?.description?.it || "",
      description_de: item?.translations?.description?.de || "",
    });
    setFormMode("visualization");
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Upload preview image if a new file was selected
      let previewImageUrl = formData.preview_image_url || null;
      if (formData.preview_image) {
        const imgFormData = new FormData();
        imgFormData.append("image", formData.preview_image);
        const storedToken = localStorage.getItem("crm_token");
        const imgResponse = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            ...(storedToken && { Authorization: `Bearer ${storedToken}` }),
          },
          body: imgFormData,
        });
        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          previewImageUrl = imgData.url;
        } else {
          setError("Failed to upload preview image");
          setSaving(false);
          return;
        }
      }

      let payload;
      let endpoint;
      let method;

      if (formMode === "research") {
        payload = {
          title: formData.title,
          slug: slug,
          category: formData.category,
          status: formData.status,
          author: formData.author,
          abstract: formData.abstract,
          content: formData.content,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          has_map: formData.has_map,
          map_config: formData.map_config,
          geodataset: geoDataMode !== "paste" ? formData.geodataset_id : null,
          value_field: geoDataMode !== "paste" ? formData.value_field : null,
          geojson_data: geoDataMode === "paste" && formData.geojson_data ? JSON.parse(formData.geojson_data) : null,
          preview_image: previewImageUrl,
          translations: {
            title: { en: formData.title_en, nl: formData.title_nl, it: formData.title_it, de: formData.title_de },
            abstract: { en: formData.abstract_en, nl: formData.abstract_nl, it: formData.abstract_it, de: formData.abstract_de },
          },
        };
        endpoint = editingItem ? `research/${editingItem.slug}` : "research";
        method = editingItem ? "PUT" : "POST";
      } else {
        let metricsData = null;
        if (formData.metrics) {
          try { metricsData = JSON.parse(formData.metrics); } catch { setError("Invalid JSON for metrics"); setSaving(false); return; }
        }
        let geojsonData = null;
        if (geoDataMode === "paste" && formData.geojson_data) {
          try { geojsonData = JSON.parse(formData.geojson_data); } catch { setError("Invalid JSON for GeoJSON data"); setSaving(false); return; }
        }

        payload = {
          title: formData.title,
          slug: slug,
          category: formData.category,
          status: formData.status,
          description: formData.description,
          content: formData.content,
          region: formData.region,
          data_points: formData.data_points,
          technologies: formData.technologies ? formData.technologies.split(",").map((t) => t.trim()).filter(Boolean) : [],
          metrics: metricsData,
          map_config: formData.map_config,
          geojson_data: geojsonData,
          geodataset: geoDataMode !== "paste" ? formData.geodataset_id : null,
          value_field: geoDataMode !== "paste" ? formData.value_field : null,
          preview_image: previewImageUrl,
          translations: {
            title: { en: formData.title_en, nl: formData.title_nl, it: formData.title_it, de: formData.title_de },
            description: { en: formData.description_en, nl: formData.description_nl, it: formData.description_it, de: formData.description_de },
          },
        };
        endpoint = editingItem ? `research/visualizations/${editingItem.slug}` : "research/visualizations";
        method = editingItem ? "PUT" : "POST";
      }

      const storedToken = localStorage.getItem("crm_token");
      const response = await fetch(`/api/django?endpoint=${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(storedToken && { Authorization: `Bearer ${storedToken}` }),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormMode(null);
        setEditingItem(null);
        if (formMode === "research") fetchResearch();
        else fetchVisualizations();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || errorData.message || "Failed to save");
      }
    } catch (err) {
      console.error("Error saving:", err);
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, item) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const endpoint = type === "research" ? `research/${item.slug}` : `research/visualizations/${item.slug}`;
      const storedToken = localStorage.getItem("crm_token");
      const response = await fetch(`/api/django?endpoint=${endpoint}`, {
        method: "DELETE",
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });

      if (response.ok || response.status === 204) {
        if (type === "research") fetchResearch();
        else fetchVisualizations();
      } else {
        alert("Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("Failed to delete item");
    }
  };

  const openTranslation = (type, item) => {
    const descKey = type === "research" ? "abstract" : "description";
    const existing = item.translations || {};
    setTranslatingItem({ type, item });
    setTranslationData({
      title_en: existing.title?.en || item.title || "",
      title_nl: existing.title?.nl || "",
      title_it: existing.title?.it || "",
      title_de: existing.title?.de || "",
      [`${descKey}_en`]: existing[descKey]?.en || item[descKey] || "",
      [`${descKey}_nl`]: existing[descKey]?.nl || "",
      [`${descKey}_it`]: existing[descKey]?.it || "",
      [`${descKey}_de`]: existing[descKey]?.de || "",
    });
  };

  const toYaml = (fieldKey) =>
    ["en", "nl", "it", "de"]
      .map((lang) => `${lang}: ${translationData[`${fieldKey}_${lang}`] || ""}`)
      .join("\n");

  const parseYaml = (text, fieldKey) => {
    const updates = {};
    for (const line of text.split("\n")) {
      const match = line.match(/^(en|nl|it|de):\s*(.*)/);
      if (match) updates[`${fieldKey}_${match[1]}`] = match[2];
    }
    return updates;
  };

  const saveTranslation = async () => {
    if (!translatingItem) return;
    setSavingTranslation(true);
    const { type, item } = translatingItem;
    const descKey = type === "research" ? "abstract" : "description";
    const translations = {
      title: { en: translationData.title_en, nl: translationData.title_nl, it: translationData.title_it, de: translationData.title_de },
      [descKey]: { en: translationData[`${descKey}_en`], nl: translationData[`${descKey}_nl`], it: translationData[`${descKey}_it`], de: translationData[`${descKey}_de`] },
    };

    try {
      const endpoint = type === "research" ? `research/${item.slug}` : `research/visualizations/${item.slug}`;
      const storedToken = localStorage.getItem("crm_token");
      const response = await fetch(`/api/django?endpoint=${endpoint}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(storedToken && { Authorization: `Bearer ${storedToken}` }),
        },
        body: JSON.stringify({ translations }),
      });

      if (response.ok) {
        setTranslatingItem(null);
        if (type === "research") fetchResearch();
        else fetchVisualizations();
      } else {
        alert("Failed to save translations");
      }
    } catch (err) {
      console.error("Error saving translations:", err);
      alert("Failed to save translations");
    } finally {
      setSavingTranslation(false);
    }
  };

  const fetchSiteTranslations = async () => {
    setLoadingSiteTranslations(true);
    try {
      const res = await fetch("/api/translations");
      if (res.ok) {
        const data = await res.json();
        setSiteTranslations(data);
      }
    } catch (err) {
      console.error("Error fetching site translations:", err);
    } finally {
      setLoadingSiteTranslations(false);
    }
  };

  const openSiteSection = (section) => {
    if (!siteTranslations) return;
    setSiteTranslationSection(section);
    // Build YAML representation: each key shows all 4 languages
    const enSection = siteTranslations.en?.[section] || {};
    const lines = [];
    const buildLines = (obj, prefix = "") => {
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
          // For arrays (like expertise items), serialize each item
          value.forEach((item, i) => {
            if (typeof item === "object") {
              for (const [subKey, subVal] of Object.entries(item)) {
                const fullKey = `${prefix}${key}[${i}].${subKey}`;
                lines.push(`${fullKey}:`);
                for (const lang of ["en", "nl", "it", "de"]) {
                  const langArr = siteTranslations[lang]?.[section]?.[key];
                  const langVal = langArr?.[i]?.[subKey] || "";
                  lines.push(`  ${lang}: ${langVal}`);
                }
                lines.push("");
              }
            } else {
              const fullKey = `${prefix}${key}[${i}]`;
              lines.push(`${fullKey}:`);
              for (const lang of ["en", "nl", "it", "de"]) {
                const langArr = siteTranslations[lang]?.[section]?.[key];
                const langVal = langArr?.[i] || "";
                lines.push(`  ${lang}: ${langVal}`);
              }
              lines.push("");
            }
          });
        } else if (typeof value === "object" && value !== null) {
          // Nested object
          for (const [subKey, subVal] of Object.entries(value)) {
            const fullKey = `${prefix}${key}.${subKey}`;
            lines.push(`${fullKey}:`);
            for (const lang of ["en", "nl", "it", "de"]) {
              const langVal = siteTranslations[lang]?.[section]?.[key]?.[subKey] || "";
              lines.push(`  ${lang}: ${langVal}`);
            }
            lines.push("");
          }
        } else {
          lines.push(`${prefix}${key}:`);
          for (const lang of ["en", "nl", "it", "de"]) {
            const langVal = siteTranslations[lang]?.[section]?.[key] || "";
            lines.push(`  ${lang}: ${langVal}`);
          }
          lines.push("");
        }
      }
    };
    buildLines(enSection);
    setSiteTranslationDraft(lines.join("\n").trimEnd());
  };

  const saveSiteSection = async () => {
    if (!siteTranslationSection || !siteTranslations) return;
    setSavingSiteTranslations(true);

    // Parse the YAML draft back into the translations object
    const updated = JSON.parse(JSON.stringify(siteTranslations));
    const lines = siteTranslationDraft.split("\n");
    let currentKey = null;

    for (const line of lines) {
      const keyMatch = line.match(/^([a-zA-Z0-9_\[\].]+):$/);
      const langMatch = line.match(/^\s{2}(en|nl|it|de):\s?(.*)/);

      if (keyMatch) {
        currentKey = keyMatch[1];
      } else if (langMatch && currentKey) {
        const lang = langMatch[1];
        const val = langMatch[2];
        const section = siteTranslationSection;

        // Handle array keys like expertise[0].title
        const arrMatch = currentKey.match(/^(.+)\[(\d+)\]\.(.+)$/);
        const simpleArrMatch = currentKey.match(/^(.+)\[(\d+)\]$/);

        if (arrMatch) {
          const [, arrKey, idx, subKey] = arrMatch;
          if (!updated[lang][section][arrKey]) updated[lang][section][arrKey] = [];
          if (!updated[lang][section][arrKey][parseInt(idx)]) updated[lang][section][arrKey][parseInt(idx)] = {};
          updated[lang][section][arrKey][parseInt(idx)][subKey] = val;
        } else if (simpleArrMatch) {
          const [, arrKey, idx] = simpleArrMatch;
          if (!updated[lang][section][arrKey]) updated[lang][section][arrKey] = [];
          updated[lang][section][arrKey][parseInt(idx)] = val;
        } else if (currentKey.includes(".")) {
          const [parentKey, subKey] = currentKey.split(".");
          if (!updated[lang][section][parentKey]) updated[lang][section][parentKey] = {};
          updated[lang][section][parentKey][subKey] = val;
        } else {
          updated[lang][section][currentKey] = val;
        }
      }
    }

    try {
      const res = await fetch("/api/translations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSiteTranslations(updated);
        setSiteTranslationSection(null);
        alert("Translations saved! Reload the site to see changes.");
      } else {
        alert("Failed to save translations");
      }
    } catch (err) {
      console.error("Error saving site translations:", err);
      alert("Failed to save translations");
    } finally {
      setSavingSiteTranslations(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show inline form
  if (formMode) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setFormMode(null); setEditingItem(null); }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="font-semibold text-foreground">
                {editingItem ? "Edit" : "New"} {formMode === "research" ? "Research Article" : "Visualization"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setFormMode(null); setEditingItem(null); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!formData.title || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editingItem ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Category</Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(v) => setFormData({ ...formData, category: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {formMode === "research" ? (
                          <>
                            <SelectItem value="research">Research</SelectItem>
                            <SelectItem value="analysis">Analysis</SelectItem>
                            <SelectItem value="case-study">Case Study</SelectItem>
                            <SelectItem value="methodology">Methodology</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="heatmap">Heatmap</SelectItem>
                            <SelectItem value="choropleth">Choropleth</SelectItem>
                            <SelectItem value="scatter">Scatter Plot</SelectItem>
                            <SelectItem value="time-series">Time Series</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Status</Label>
                    <Select
                      value={formData.status || "draft"}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formMode === "research" ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Author</Label>
                      <Input
                        value={formData.author || ""}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Author name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Abstract</Label>
                      <Textarea
                        value={formData.abstract || ""}
                        onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                        placeholder="Brief abstract/description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Tags (comma-separated)</Label>
                      <Input
                        value={formData.tags || ""}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="e.g., machine-learning, real-estate, python"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Description</Label>
                      <Textarea
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Region</Label>
                        <Input
                          value={formData.region || ""}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          placeholder="e.g., Amsterdam, NL"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Data Points</Label>
                        <Input
                          value={formData.data_points || ""}
                          onChange={(e) => setFormData({ ...formData, data_points: e.target.value })}
                          placeholder="e.g., 45,000+ properties"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Technologies (comma-separated)</Label>
                      <Input
                        value={formData.technologies || ""}
                        onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                        placeholder="e.g., Mapbox, PostGIS, Python"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Metrics (JSON array)</Label>
                      <Textarea
                        value={formData.metrics || ""}
                        onChange={(e) => setFormData({ ...formData, metrics: e.target.value })}
                        placeholder='[{"label": "Properties", "value": "45K+"}]'
                        rows={3}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Translations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Translations</CardTitle>
                <CardDescription>
                  Add translations in YAML format. Each line: <code className="text-xs bg-muted px-1 py-0.5 rounded">lang: translated text</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "title", label: "Title" },
                  ...(formMode === "research"
                    ? [{ key: "abstract", label: "Abstract" }]
                    : [{ key: "description", label: "Description" }]),
                ].map((field) => {
                  const yamlValue = ["en", "nl", "it", "de"]
                    .map((lang) => {
                      const val = formData[`${field.key}_${lang}`] || "";
                      return val ? `${lang}: ${val}` : `${lang}: `;
                    })
                    .join("\n");

                  const parseYaml = (text) => {
                    const updates = {};
                    const lines = text.split("\n");
                    for (const line of lines) {
                      const match = line.match(/^(en|nl|it|de):\s*(.*)/);
                      if (match) {
                        updates[`${field.key}_${match[1]}`] = match[2];
                      }
                    }
                    return updates;
                  };

                  return (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm font-semibold block">{field.label}</Label>
                      <Textarea
                        value={yamlValue}
                        onChange={(e) => {
                          const updates = parseYaml(e.target.value);
                          setFormData((prev) => ({ ...prev, ...updates }));
                        }}
                        rows={field.key === "title" ? 4 : 6}
                        className="font-mono text-sm"
                        placeholder={`en: ${field.label} in English\nnl: ${field.label} in Dutch\nit: ${field.label} in Italian\nde: ${field.label} in German`}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Preview Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Image</CardTitle>
                <CardDescription>Upload a thumbnail/preview image for this {formMode === "research" ? "article" : "visualization"} (optional).</CardDescription>
              </CardHeader>
              <CardContent>
                {(formData.preview_image || formData.preview_image_url) ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.preview_image ? URL.createObjectURL(formData.preview_image) : formData.preview_image_url}
                      alt="Preview"
                      className="max-h-48 rounded-lg border border-border object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={() => setFormData({ ...formData, preview_image: null, preview_image_url: null })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImagePlus className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop an image here, or click to browse
                    </p>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Choose Image
                        </span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({ ...formData, preview_image: file, preview_image_url: null });
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content - Rich Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content</CardTitle>
                <CardDescription>Write your content using the rich text editor below. Supports Markdown formatting.</CardDescription>
              </CardHeader>
              <CardContent>
                <MarkdownEditor
                  value={formData.content || ""}
                  onChange={(v) => setFormData({ ...formData, content: v })}
                />
              </CardContent>
            </Card>

            {/* PDF Upload - Research only */}
            {formMode === "research" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">PDF Attachment</CardTitle>
                  <CardDescription>Upload a PDF version of the research article (optional).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <FileUp className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drop a PDF file here, or click to browse
                    </p>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <FileUp className="w-4 h-4 mr-2" />
                          Choose PDF
                        </span>
                      </Button>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({ ...formData, pdf_file: file });
                          }
                        }}
                      />
                    </label>
                    {formData.pdf_file && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-foreground">{formData.pdf_file.name || formData.pdf_file}</span>
                        <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, pdf_file: null })}>
                          Remove
                        </Button>
                      </div>
                    )}
                    {editingItem?.pdf_file && !formData.pdf_file && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>Current PDF: {editingItem.pdf_file.split("/").pop()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Geodata Source */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Geodata Source</CardTitle>
                <CardDescription>Add geospatial data for map visualization.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={geoDataMode} onValueChange={setGeoDataMode} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="paste">Paste GeoJSON</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                    <TabsTrigger value="existing">Use Existing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="mt-4 space-y-3">
                    <Textarea
                      value={formData.geojson_data || ""}
                      onChange={(e) => setFormData({ ...formData, geojson_data: e.target.value })}
                      placeholder='{"type": "FeatureCollection", "features": [...]}'
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste valid GeoJSON for map visualization. Leave empty for no map.
                    </p>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-4 space-y-3">
                    <GeoFileUpload
                      token={token}
                      onUploadComplete={(result) => {
                        setUploadedDataset(result);
                        setFormData({
                          ...formData,
                          geodataset_id: result.dataset_id,
                          value_field: null,
                          has_map: true,
                        });
                      }}
                    />
                    {uploadedDataset && (
                      <GeoFieldSelector
                        fields={uploadedDataset.available_fields || []}
                        fieldTypes={uploadedDataset.field_types || {}}
                        value={formData.value_field}
                        onChange={(field) => setFormData({ ...formData, value_field: field })}
                        label="Select Value Field"
                        filterNumeric={formData.category === "heatmap" || formData.category === "choropleth"}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="existing" className="mt-4 space-y-3">
                    <GeoDatasetSelector
                      value={formData.geodataset_id}
                      onChange={(datasetId) => setFormData({ ...formData, geodataset_id: datasetId, has_map: true })}
                      onDatasetLoad={(dataset) => setSelectedDataset(dataset)}
                      label="Select Dataset"
                    />
                    {selectedDataset && (
                      <GeoFieldSelector
                        fields={selectedDataset.available_fields || []}
                        fieldTypes={selectedDataset.field_types || {}}
                        value={formData.value_field}
                        onChange={(field) => setFormData({ ...formData, value_field: field })}
                        label="Select Value Field"
                        filterNumeric={formData.category === "heatmap" || formData.category === "choropleth"}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Save button at bottom */}
            <div className="flex justify-end gap-3 pb-12">
              <Button variant="outline" onClick={() => { setFormMode(null); setEditingItem(null); }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title || saving} className="min-w-[140px]">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editingItem ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Ian Ronk CRM</h1>
              <p className="text-xs text-muted-foreground">Content Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden md:flex gap-1 items-center">
              <Map className="w-3 h-3" />
              GeoJSON
            </Badge>
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-transparent">View Site</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{research.length}</p>
                <p className="text-sm text-muted-foreground">Research Articles</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Map className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visualizations.length}</p>
                <p className="text-sm text-muted-foreground">Visualizations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{research.length + visualizations.length}</p>
                <p className="text-sm text-muted-foreground">Total Content</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Research, Visualizations, and Translations */}
        <Tabs defaultValue="research" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="translations" onClick={() => { if (!siteTranslations) fetchSiteTranslations(); }}>
              <Languages className="w-4 h-4 mr-1.5" /> Translations
            </TabsTrigger>
          </TabsList>

          {/* Research Tab */}
          <TabsContent value="research" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Research Articles</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchResearch} className="bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => openResearchForm()} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Research
                </Button>
              </div>
            </div>

            {loadingResearch ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : research.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No research articles yet</p>
                  <Button onClick={() => openResearchForm()} className="mt-4">Add your first article</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {research.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {item.preview_image && (
                          <img src={item.preview_image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{item.category}</Badge>
                            <Badge variant={item.status === "published" ? "default" : "outline"} className="text-xs">{item.status}</Badge>
                            {item.has_map && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Map className="w-3 h-3" /> Map
                              </Badge>
                            )}
                            {item.pdf_file && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <FileText className="w-3 h-3" /> PDF
                              </Badge>
                            )}
                            {item.translations && (
                              <Badge variant="outline" className="text-xs gap-1 border-yellow-500/30 text-yellow-600">
                                <Languages className="w-3 h-3" /> Translated
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />{item.date}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.abstract}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => translatingItem?.item?.id === item.id ? setTranslatingItem(null) : openTranslation("research", item)}
                            className={`bg-transparent ${translatingItem?.item?.id === item.id ? "border-yellow-500 text-yellow-600" : ""}`}
                            title="Translations"
                          >
                            <Languages className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openResearchForm(item)} className="bg-transparent">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete("research", item)} className="bg-transparent text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Inline translation panel */}
                      {translatingItem?.type === "research" && translatingItem?.item?.id === item.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Languages className="w-4 h-4 text-yellow-500" /> Translations (YAML)
                            </h4>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setTranslatingItem(null)}>Cancel</Button>
                              <Button size="sm" onClick={saveTranslation} disabled={savingTranslation}>
                                {savingTranslation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Title</Label>
                              <Textarea
                                value={toYaml("title")}
                                onChange={(e) => setTranslationData((prev) => ({ ...prev, ...parseYaml(e.target.value, "title") }))}
                                rows={4}
                                className="font-mono text-sm"
                                placeholder={"en: Title in English\nnl: Title in Dutch\nit: Title in Italian\nde: Title in German"}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Abstract</Label>
                              <Textarea
                                value={toYaml("abstract")}
                                onChange={(e) => setTranslationData((prev) => ({ ...prev, ...parseYaml(e.target.value, "abstract") }))}
                                rows={4}
                                className="font-mono text-sm"
                                placeholder={"en: Abstract in English\nnl: Abstract in Dutch\nit: Abstract in Italian\nde: Abstract in German"}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Visualizations Tab */}
          <TabsContent value="visualizations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Visualizations</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchVisualizations} className="bg-transparent">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => openVisualizationForm()} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Visualization
                </Button>
              </div>
            </div>

            {loadingVisualizations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : visualizations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No visualizations yet</p>
                  <Button onClick={() => openVisualizationForm()} className="mt-4">Add your first visualization</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {visualizations.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {item.preview_image && (
                          <img src={item.preview_image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{item.category}</Badge>
                            <Badge variant={item.status === "published" ? "default" : "outline"} className="text-xs">{item.status}</Badge>
                            {(item.geojson_data || item.geodataset_id) && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Map className="w-3 h-3" /> Map
                              </Badge>
                            )}
                            {item.translations && (
                              <Badge variant="outline" className="text-xs gap-1 border-yellow-500/30 text-yellow-600">
                                <Languages className="w-3 h-3" /> Translated
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{item.region}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            {item.data_points && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Database className="w-3 h-3" />{item.data_points}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => translatingItem?.item?.id === item.id ? setTranslatingItem(null) : openTranslation("visualization", item)}
                            className={`bg-transparent ${translatingItem?.item?.id === item.id ? "border-yellow-500 text-yellow-600" : ""}`}
                            title="Translations"
                          >
                            <Languages className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openVisualizationForm(item)} className="bg-transparent">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete("visualization", item)} className="bg-transparent text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Inline translation panel */}
                      {translatingItem?.type === "visualization" && translatingItem?.item?.id === item.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                              <Languages className="w-4 h-4 text-yellow-500" /> Translations (YAML)
                            </h4>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => setTranslatingItem(null)}>Cancel</Button>
                              <Button size="sm" onClick={saveTranslation} disabled={savingTranslation}>
                                {savingTranslation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Title</Label>
                              <Textarea
                                value={toYaml("title")}
                                onChange={(e) => setTranslationData((prev) => ({ ...prev, ...parseYaml(e.target.value, "title") }))}
                                rows={4}
                                className="font-mono text-sm"
                                placeholder={"en: Title in English\nnl: Title in Dutch\nit: Title in Italian\nde: Title in German"}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                              <Textarea
                                value={toYaml("description")}
                                onChange={(e) => setTranslationData((prev) => ({ ...prev, ...parseYaml(e.target.value, "description") }))}
                                rows={4}
                                className="font-mono text-sm"
                                placeholder={"en: Description in English\nnl: Description in Dutch\nit: Description in Italian\nde: Description in German"}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Translations Tab */}
          <TabsContent value="translations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Website Translations</h2>
              <Button variant="outline" size="sm" onClick={fetchSiteTranslations} className="bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            {loadingSiteTranslations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !siteTranslations ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Languages className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Click the tab to load website translations</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Edit the text content on your website in all 4 languages (en, nl, it, de). Click a section to expand and edit using YAML format.
                </p>
                <div className="grid gap-3">
                  {Object.keys(siteTranslations.en || {}).map((section) => (
                    <Card key={section} className="overflow-hidden">
                      <CardContent className="p-0">
                        <button
                          type="button"
                          onClick={() => siteTranslationSection === section ? setSiteTranslationSection(null) : openSiteSection(section)}
                          className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-yellow-500/10 flex items-center justify-center">
                              <Languages className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{section}</h3>
                              <p className="text-xs text-muted-foreground">
                                {Object.keys(siteTranslations.en[section] || {}).length} keys
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {siteTranslationSection === section ? "Editing" : "Click to edit"}
                          </Badge>
                        </button>

                        {siteTranslationSection === section && (
                          <div className="border-t border-border p-4 md:p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                Each key is followed by its value in all 4 languages. Edit the text after each <code className="bg-muted px-1 py-0.5 rounded">lang:</code> prefix.
                              </p>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSiteTranslationSection(null)}>
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={saveSiteSection} disabled={savingSiteTranslations}>
                                  {savingSiteTranslations ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                  Save Section
                                </Button>
                              </div>
                            </div>
                            <Textarea
                              value={siteTranslationDraft}
                              onChange={(e) => setSiteTranslationDraft(e.target.value)}
                              rows={Math.min(30, siteTranslationDraft.split("\n").length + 2)}
                              className="font-mono text-sm leading-relaxed"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
