import type { SerializeFrom } from "@remix-run/node";
import { db } from "~/lib/prisma.server";
import { AccountStatus, UserRole } from "@prisma/client";

export async function getAllLibrarians() {
  return db.user.findMany({
    where: {
      role: UserRole.librarian,
      status: AccountStatus.active,
    },
    include: {
      library: true,
    },
  });
}

export type GetAllLibrarians = SerializeFrom<typeof getAllLibrarians>;

export async function getAllNonAssignedLibrarians() {
  return db.user.findMany({
    where: {
      role: UserRole.librarian,
      status: AccountStatus.active,
      libraryId: null,
    },
  });
}

export async function getLibrarianById(id: string) {
  return db.user.findFirst({
    where: {
      id,
      role: UserRole.librarian,
    },
    include: {
      library: true,
    },
  });
}

export type GetLibrarianById = SerializeFrom<typeof getLibrarianById>;
