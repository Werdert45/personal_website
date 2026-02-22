"use client";

import { useState, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Link,
  Code,
  List,
  Eye,
  Edit,
  Table,
  Quote,
  ImagePlus,
  Loader2,
} from "lucide-react";

function insertMarkdown(textarea, before, after = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const replacement = `${before}${selected || "text"}${after}`;
  const newValue =
    textarea.value.substring(0, start) +
    replacement +
    textarea.value.substring(end);
  return { newValue, cursorPos: start + before.length + (selected || "text").length };
}

function insertAtCursor(textarea, text) {
  const start = textarea.selectionStart;
  const newValue =
    textarea.value.substring(0, start) +
    text +
    textarea.value.substring(start);
  return { newValue, cursorPos: start + text.length };
}

const markdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-2xl font-bold mt-6 mb-3 text-foreground border-b border-border pb-2" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="text-base font-semibold mt-3 mb-2 text-foreground" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-sm text-muted-foreground leading-relaxed mb-3" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="space-y-1 ml-6 list-disc mb-3" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="space-y-1 ml-6 list-decimal mb-3" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-sm text-muted-foreground" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  em: ({ node, ...props }) => (
    <em className="italic" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-primary underline hover:text-primary/80" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-3 text-muted-foreground italic" {...props} />
  ),
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-primary" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="block bg-muted p-4 rounded-lg text-xs font-mono overflow-x-auto mb-3 text-foreground" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ node, ...props }) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs mb-3" {...props} />
  ),
  hr: ({ node, ...props }) => (
    <hr className="border-border my-6" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse text-sm border border-border rounded-lg overflow-hidden" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-muted" {...props} />
  ),
  tbody: ({ node, ...props }) => (
    <tbody {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="border-b border-border last:border-b-0" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="border-r border-border last:border-r-0 px-3 py-2 text-left font-semibold text-foreground text-xs" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="border-r border-border last:border-r-0 px-3 py-2 text-muted-foreground text-xs" {...props} />
  ),
  img: ({ node, ...props }) => (
    <img className="max-w-full h-auto rounded-lg my-4" {...props} />
  ),
};

export function MarkdownEditor({ value, onChange }) {
  const [view, setView] = useState("split");
  const [uploading, setUploading] = useState(false);
  const editorId = useId();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("crm_token") || localStorage.getItem("admin_token");
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const textarea = textareaRef.current;
        if (textarea) {
          const markdown = `\n![${file.name}](${data.url})\n`;
          const result = insertAtCursor(textarea, markdown);
          onChange(result.newValue);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(result.cursorPos, result.cursorPos);
          }, 0);
        }
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.error || "Failed to upload image");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleToolbar = (action) => {
    if (action === "image") {
      fileInputRef.current?.click();
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    let result;
    switch (action) {
      case "bold":
        result = insertMarkdown(textarea, "**", "**");
        break;
      case "italic":
        result = insertMarkdown(textarea, "_", "_");
        break;
      case "h1":
        result = insertMarkdown(textarea, "# ");
        break;
      case "h2":
        result = insertMarkdown(textarea, "## ");
        break;
      case "link":
        result = insertMarkdown(textarea, "[", "](url)");
        break;
      case "code":
        result = insertMarkdown(textarea, "```\n", "\n```");
        break;
      case "list":
        result = insertMarkdown(textarea, "- ");
        break;
      case "quote":
        result = insertMarkdown(textarea, "> ");
        break;
      case "table":
        result = insertMarkdown(
          textarea,
          "| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n"
        );
        break;
      default:
        return;
    }

    onChange(result.newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursorPos, result.cursorPos);
    }, 0);
  };

  // Handle paste events for images
  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await handleImageUpload(file);
        return;
      }
    }
  };

  // Handle drag and drop for images
  const handleDrop = async (e) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith("image/")) {
      e.preventDefault();
      await handleImageUpload(file);
    }
  };

  const toolbarButtons = [
    { action: "bold", icon: Bold, label: "Bold" },
    { action: "italic", icon: Italic, label: "Italic" },
    { action: "h1", icon: Heading1, label: "Heading 1" },
    { action: "h2", icon: Heading2, label: "Heading 2" },
    { action: "link", icon: Link, label: "Link" },
    { action: "code", icon: Code, label: "Code Block" },
    { action: "list", icon: List, label: "List" },
    { action: "quote", icon: Quote, label: "Blockquote" },
    { action: "table", icon: Table, label: "Table" },
    { action: "image", icon: uploading ? Loader2 : ImagePlus, label: "Upload Image" },
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = "";
        }}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-2 py-1">
        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ action, icon: Icon, label }) => (
            <Button
              key={action}
              type="button"
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${action === "image" && uploading ? "animate-spin" : ""}`}
              onClick={() => handleToolbar(action)}
              title={label}
              disabled={action === "image" && uploading}
            >
              <Icon className="w-3.5 h-3.5" />
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={view === "edit" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView("edit")}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={view === "split" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView("split")}
          >
            Split
          </Button>
          <Button
            type="button"
            variant={view === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setView("preview")}
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={`flex ${view === "split" ? "divide-x divide-border" : ""}`}>
        {(view === "edit" || view === "split") && (
          <div className={view === "split" ? "w-1/2" : "w-full"}>
            <Textarea
              ref={textareaRef}
              id={`md-editor-${editorId}`}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              onDrop={handleDrop}
              placeholder="Write your content in markdown... (paste or drop images here)"
              className="min-h-[400px] border-0 rounded-none resize-none font-mono text-sm focus-visible:ring-0"
            />
          </div>
        )}
        {(view === "preview" || view === "split") && (
          <div
            className={`${
              view === "split" ? "w-1/2" : "w-full"
            } min-h-[400px] p-4 overflow-auto max-w-none`}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground italic text-sm">
                Preview will appear here...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
