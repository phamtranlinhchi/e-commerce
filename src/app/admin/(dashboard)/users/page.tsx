"use client";

// =============================================================================
// Admin Users - List users and manage roles
// =============================================================================

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  _count: { orders: number };
}

interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchUsers(p = page, s = search) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: "20" });
      if (s) params.set("search", s);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update role");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(dateString: string) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {pagination
              ? `${pagination.totalItems} user${pagination.totalItems !== 1 ? "s" : ""}`
              : "Users"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Loading...
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Change Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">
                            {user.name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "ADMIN"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user._count.orders}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(v) =>
                              handleRoleChange(user.id, v)
                            }
                            disabled={updatingId === user.id}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CUSTOMER">
                                Customer
                              </SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    {pagination.page > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(pagination.page - 1);
                          fetchUsers(pagination.page - 1);
                        }}
                      >
                        Previous
                      </Button>
                    )}
                    {pagination.page < pagination.totalPages && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage(pagination.page + 1);
                          fetchUsers(pagination.page + 1);
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
