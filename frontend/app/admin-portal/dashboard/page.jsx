"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  FolderOpen,
  FileText,
  Layers,
  Settings,
  RefreshCw,
  Save,
  Map,
  Database,
} from "lucide-react";
import { ResearchForm } from "@/components/admin/research-form";

export default function CMSDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [research, setResearch] = useState([]);
  const [layers, setLayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showResearchSheet, setShowResearchSheet] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin-portal");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [projectsRes, researchRes, layersRes] = await Promise.all([
        fetch("/api/django?endpoint=projects", { headers }),
        fetch("/api/django?endpoint=research", { headers }),
        fetch("/api/django?endpoint=layers", { headers }),
      ]);

      setProjects(await projectsRes.json());
      setResearch(await researchRes.json());
      setLayers(await layersRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin-portal");
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      await fetch(`/api/django?endpoint=${type}&id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (type === "projects") {
        setProjects(projects.filter((p) => p.id !== id));
      } else if (type === "research") {
        setResearch(research.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleNewItem = () => {
    if (activeTab === "research") {
      setEditingResearch(null);
      setShowResearchSheet(true);
    } else {
      setShowNewItemDialog(true);
    }
  };

  const handleEditResearch = async (item) => {
    // Fetch full research detail (with content) for editing
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/django?endpoint=research/${item.slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const fullItem = await res.json();
        setEditingResearch(fullItem);
        setShowResearchSheet(true);
      }
    } catch (error) {
      console.error("Failed to fetch research detail:", error);
      // Fallback to list data
      setEditingResearch(item);
      setShowResearchSheet(true);
    }
  };

  // Parse research data (handle paginated or array responses)
  const researchItems = Array.isArray(research) ? research : research.results || [];
  const projectItems = Array.isArray(projects) ? projects : projects.results || [];
  const layerItems = Array.isArray(layers) ? layers : layers.results || [];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">CMS Dashboard</h1>
                <p className="text-xs text-muted-foreground">
                  Manage your portfolio content
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {projectItems.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {researchItems.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Research</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {layerItems.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Map Layers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Django</p>
                  <p className="text-xs text-muted-foreground">Backend</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="projects" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="research" className="gap-2">
                <FileText className="w-4 h-4" />
                Research
              </TabsTrigger>
              <TabsTrigger value="layers" className="gap-2">
                <Layers className="w-4 h-4" />
                Map Layers
              </TabsTrigger>
            </TabsList>

            <Button className="gap-2" onClick={handleNewItem}>
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </div>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Visualization Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Title</TableHead>
                      <TableHead className="text-foreground">Category</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Created</TableHead>
                      <TableHead className="text-right text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectItems.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium text-foreground">
                          {project.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{project.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              project.status === "published"
                                ? "default"
                                : "outline"
                            }
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.created_at}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingItem(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete("projects", project.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Tab */}
          <TabsContent value="research">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Research & Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Title</TableHead>
                      <TableHead className="text-foreground">Category</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Tags</TableHead>
                      <TableHead className="text-foreground">Map</TableHead>
                      <TableHead className="text-right text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {researchItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-foreground">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "published" ? "default" : "outline"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {item.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.has_map && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Map className="w-3 h-3" />
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditResearch(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDelete("research", item.slug || item.id)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layers Tab */}
          <TabsContent value="layers">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">PostGIS Map Layers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Layer Name</TableHead>
                      <TableHead className="text-foreground">Type</TableHead>
                      <TableHead className="text-foreground">Source Table</TableHead>
                      <TableHead className="text-foreground">Visible</TableHead>
                      <TableHead className="text-right text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {layerItems.map((layer) => (
                      <TableRow key={layer.id}>
                        <TableCell className="font-medium text-foreground">
                          {layer.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{layer.type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {layer.table}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={layer.visible ? "default" : "outline"}
                          >
                            {layer.visible ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Research Sheet (full form) */}
      <Sheet open={showResearchSheet} onOpenChange={setShowResearchSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingResearch ? "Edit Research Article" : "New Research Article"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ResearchForm
              item={editingResearch}
              onSave={() => {
                setShowResearchSheet(false);
                setEditingResearch(null);
                fetchData();
              }}
              onCancel={() => {
                setShowResearchSheet(false);
                setEditingResearch(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* New Item Dialog (for projects) */}
      <NewItemDialog
        type={activeTab}
        onSave={fetchData}
        open={showNewItemDialog}
        onOpenChange={setShowNewItemDialog}
      />

      {/* Edit Dialog (for projects) */}
      {editingItem && (
        <EditItemDialog
          item={editingItem}
          type={activeTab}
          onClose={() => setEditingItem(null)}
          onSave={() => {
            setEditingItem(null);
            fetchData();
          }}
        />
      )}
    </main>
  );
}

function NewItemDialog({ type, onSave, open, onOpenChange }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "draft",
    tags: "",
    map_config: { center: [4.9041, 52.3676], zoom: 10 },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = type === "projects" ? "projects" : "research";

      await fetch(`/api/django?endpoint=${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      onSave();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        status: "draft",
        tags: "",
        map_config: { center: [4.9041, 52.3676], zoom: 10 },
      });
    } catch (error) {
      console.error("Failed to create:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Add New {type === "projects" ? "Project" : "Research"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visualization">Visualization</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Tags (comma-separated)</Label>
            <Input
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              placeholder="e.g., GIS, real estate, analysis"
            />
          </div>

          {type === "projects" && (
            <div className="space-y-2">
              <Label className="text-foreground">Map Center (lng, lat)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Longitude"
                  value={formData.map_config.center[0]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      map_config: {
                        ...formData.map_config,
                        center: [parseFloat(e.target.value), formData.map_config.center[1]],
                      },
                    })
                  }
                />
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="Latitude"
                  value={formData.map_config.center[1]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      map_config: {
                        ...formData.map_config,
                        center: [formData.map_config.center[0], parseFloat(e.target.value)],
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditItemDialog({ item, type, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ...item,
    tags: item.tags?.join(", ") || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const endpoint = type === "projects" ? "projects" : "research";

      await fetch(`/api/django?endpoint=${endpoint}&id=${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      onSave();
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit {type === "projects" ? "Project" : "Research"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Title</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description || formData.abstract || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visualization">Visualization</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Tags (comma-separated)</Label>
            <Input
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
