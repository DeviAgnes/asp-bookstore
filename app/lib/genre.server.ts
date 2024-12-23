import type { SerializeFrom } from "@remix-run/node";
import { db } from "~/lib/prisma.server";

export const getAllGenres = async () => {
  return await db.genre.findMany();
};

export type GetAllGenres = SerializeFrom<typeof getAllGenres>;

export const getGenreById = async (id: string) => {
  return await db.genre.findUnique({
    where: { id },
  });
};
