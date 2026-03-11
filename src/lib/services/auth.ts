// =============================================================================
// Auth Service - User authentication and registration queries
// =============================================================================

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { RegisterInput } from "@/lib/validators";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
      image: true,
    },
  });
}

export async function createUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });

  return user;
}
