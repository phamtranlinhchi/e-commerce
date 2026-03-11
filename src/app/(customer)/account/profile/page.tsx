"use client";

// =============================================================================
// Profile Page - Edit user profile (name, email display, phone)
// =============================================================================

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Profile Settings</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your account information
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold">Personal Information</h3>
        <Separator className="my-4" />

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email ?? ""}
              disabled
              className="bg-neutral-50"
            />
            <p className="mt-1 text-xs text-neutral-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold">Account</h3>
        <Separator className="my-4" />
        <p className="text-sm text-neutral-500">
          Member since{" "}
          {user?.email ? "your registration" : "—"}
        </p>
      </Card>
    </div>
  );
}
