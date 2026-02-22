"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Hash, Type, Calendar, ToggleLeft } from "lucide-react";

const fieldTypeIcons = {
  integer: Hash,
  float: Hash,
  string: Type,
  date: Calendar,
  datetime: Calendar,
  boolean: ToggleLeft,
};

const fieldTypeColors = {
  integer: "bg-yellow-500/20 text-yellow-400",
  float: "bg-yellow-500/20 text-yellow-400",
  string: "bg-purple-500/20 text-purple-400",
  date: "bg-amber-500/20 text-amber-400",
  datetime: "bg-amber-500/20 text-amber-400",
  boolean: "bg-amber-500/20 text-amber-400",
};

export function GeoFieldSelector({
  fields = [],
  fieldTypes = {},
  value,
  onChange,
  label = "Value Field",
  placeholder = "Select a field for visualization",
  filterNumeric = false,
}) {
  const [filteredFields, setFilteredFields] = useState(fields);

  useEffect(() => {
    if (filterNumeric) {
      // Only show numeric fields for heatmaps/choropleths
      setFilteredFields(
        fields.filter((field) => {
          const type = fieldTypes[field];
          return type === "integer" || type === "float";
        })
      );
    } else {
      setFilteredFields(fields);
    }
  }, [fields, fieldTypes, filterNumeric]);

  const getFieldIcon = (fieldName) => {
    const type = fieldTypes[fieldName] || "string";
    const Icon = fieldTypeIcons[type] || Type;
    return Icon;
  };

  const getFieldTypeColor = (fieldName) => {
    const type = fieldTypes[fieldName] || "string";
    return fieldTypeColors[type] || fieldTypeColors.string;
  };

  if (fields.length === 0) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="text-sm text-slate-500 italic">
          No fields available. Upload a dataset first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-600">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-600">
          {filteredFields.map((field) => {
            const Icon = getFieldIcon(field);
            const type = fieldTypes[field] || "string";
            return (
              <SelectItem
                key={field}
                value={field}
                className="focus:bg-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{field}</span>
                  <Badge
                    variant="secondary"
                    className={`ml-auto text-xs ${getFieldTypeColor(field)}`}
                  >
                    {type}
                  </Badge>
                </div>
              </SelectItem>
            );
          })}
          {filteredFields.length === 0 && filterNumeric && (
            <div className="px-2 py-3 text-sm text-slate-500 text-center">
              No numeric fields available for this visualization type.
            </div>
          )}
        </SelectContent>
      </Select>
      {filterNumeric && filteredFields.length < fields.length && (
        <p className="text-xs text-slate-500">
          Showing {filteredFields.length} of {fields.length} fields (numeric
          only for heatmaps)
        </p>
      )}
    </div>
  );
}
