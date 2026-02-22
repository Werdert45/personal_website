"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export function GeodatasetSelector({ value, onChange }) {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDatasets() {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("/api/django?endpoint=geodata/datasets", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setDatasets(data.results || data);
        }
      } catch (err) {
        console.error("Failed to fetch geodatasets:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDatasets();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading datasets...
      </div>
    );
  }

  return (
    <Select
      value={value ? String(value) : "none"}
      onValueChange={(v) => onChange(v === "none" ? null : parseInt(v))}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a dataset" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No dataset</SelectItem>
        {datasets.map((ds) => (
          <SelectItem key={ds.id} value={String(ds.id)}>
            {ds.name} ({ds.feature_count} features)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
