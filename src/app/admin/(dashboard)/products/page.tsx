// =============================================================================
// Admin Products List - Search, filter, and manage products
// =============================================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await getAdminSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : undefined;
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;
  const page = Math.max(1, Number(params.page ?? 1));

  const { products, pagination } = await getAdminProducts({
    search,
    categoryId,
    page,
    pageSize: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={search}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pagination.totalItems} product{pagination.totalItems !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.slug}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {product.sku ?? "—"}
                    </TableCell>
                    <TableCell>
                      {product.category?.name ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(Number(product.basePrice))}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.isActive ? "default" : "secondary"}
                      >
                        {product.isActive ? "Active" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.isFeatured && (
                        <Badge variant="outline">Featured</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/products?page=${pagination.page - 1}${search ? `&search=${search}` : ""}`}
                    >
                      Previous
                    </Link>
                  </Button>
                )}
                {pagination.page < pagination.totalPages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/admin/products?page=${pagination.page + 1}${search ? `&search=${search}` : ""}`}
                    >
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
