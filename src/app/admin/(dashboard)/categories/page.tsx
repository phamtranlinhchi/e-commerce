"use client";

// =============================================================================
// Admin Categories - List with inline create/edit
// =============================================================================

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  parent: { id: string; name: string } | null;
  _count: { products: number };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline form state
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setFormName("");
    setFormSlug("");
    setFormActive(true);
  }

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setCreating(false);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormActive(cat.isActive);
  }

  function cancelForm() {
    setCreating(false);
    setEditing(null);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      if (creating) {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            slug: formSlug,
            isActive: formActive,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to create category");
        }
      } else if (editing) {
        const res = await fetch("/api/admin/categories", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing,
            name: formName,
            slug: formSlug,
            isActive: formActive,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to update category");
        }
      }

      cancelForm();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete category");
      }
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={startCreate} disabled={creating}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{categories.length} categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Inline Create Row */}
              {creating && (
                <TableRow>
                  <TableCell>
                    <Input
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        setFormSlug(slugify(e.target.value));
                      }}
                      placeholder="Category name"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="category-slug"
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Active</span>
                    </div>
                  </TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || !formName || !formSlug}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelForm}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {categories.length === 0 && !creating ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No categories yet
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) =>
                  editing === cat.id ? (
                    // Inline Edit Row
                    <TableRow key={cat.id}>
                      <TableCell>
                        <Input
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={formSlug}
                          onChange={(e) => setFormSlug(e.target.value)}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>{cat._count.products}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formActive}
                            onChange={(e) => setFormActive(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Active</span>
                        </div>
                      </TableCell>
                      <TableCell>{cat.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSave}
                            disabled={saving || !formName || !formSlug}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelForm}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Display Row
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cat.slug}
                      </TableCell>
                      <TableCell>{cat._count.products}</TableCell>
                      <TableCell>
                        <Badge
                          variant={cat.isActive ? "default" : "secondary"}
                        >
                          {cat.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{cat.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
