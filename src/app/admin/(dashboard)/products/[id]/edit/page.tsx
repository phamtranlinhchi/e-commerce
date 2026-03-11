"use client";

// =============================================================================
// Admin Edit Product - Form to update an existing product
// =============================================================================

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    basePrice: "",
    compareAtPrice: "",
    sku: "",
    categoryId: "",
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([product, cats]) => {
        if (product.error) {
          setError(product.error);
          return;
        }
        setForm({
          name: product.name ?? "",
          slug: product.slug ?? "",
          description: product.description ?? "",
          shortDescription: product.shortDescription ?? "",
          basePrice: String(product.basePrice ?? ""),
          compareAtPrice: product.compareAtPrice
            ? String(product.compareAtPrice)
            : "",
          sku: product.sku ?? "",
          categoryId: product.categoryId ?? "",
          isFeatured: product.isFeatured ?? false,
          isActive: product.isActive ?? true,
        });
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        shortDescription: form.shortDescription || null,
        basePrice: parseFloat(form.basePrice),
        compareAtPrice: form.compareAtPrice
          ? parseFloat(form.compareAtPrice)
          : null,
        sku: form.sku || null,
        categoryId: form.categoryId || null,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={5}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={form.shortDescription}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        shortDescription: e.target.value,
                      }))
                    }
                    maxLength={300}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.basePrice}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, basePrice: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Compare At Price</Label>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.compareAtPrice}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          compareAtPrice: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, categoryId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sku: e.target.value }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
