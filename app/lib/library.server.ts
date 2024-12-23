import type { SerializeFrom } from "@remix-run/node";
import { db } from "~/lib/prisma.server";

export async function getAllLibraries() {
  return db.library.findMany({
    include: {
      librarian: true,
    },
  });
}

export type GetAllLibraries = SerializeFrom<typeof getAllLibraries>;

export async function getLibraryById(id: string) {
  return db.library.findUnique({
    where: { id },
    include: {
      librarian: {
        where: {
          role: "librarian",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          libraryId: true,
        },
        take: 1,
      },
    },
  });
}

export async function updateLibrary(
  where: { id: string },
  data: {
    name?: string;
    location?: string;
    phoneNo?: string;
    email?: string;
    librarian?: { connect: { id: string } };
  },
) {
  const { librarian, ...libraryData } = data;

  return db.$transaction(async (tx) => {
    await tx.library.update({
      where: { id: where.id },
      data: libraryData,
    });

    if (librarian?.connect?.id) {
      await tx.user.update({
        where: { id: librarian.connect.id },
        data: { libraryId: where.id },
      });
    }
  });
}

export async function createLibrary(data: {
  name: string;
  location: string;
  phoneNo: string;
  email: string;
  librarian?: { connect: { id: string } };
}) {
  const { librarian, ...libraryData } = data;

  return db.$transaction(async (tx) => {
    const newLibrary = await tx.library.create({
      data: libraryData,
    });

    if (librarian?.connect?.id) {
      await tx.user.update({
        where: { id: librarian.connect.id },
        data: { libraryId: newLibrary.id },
      });
    }

    return newLibrary;
  });
}
