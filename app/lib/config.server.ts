import type { SerializeFrom } from "@remix-run/node";
import { db } from "~/lib/prisma.server";

export const getConfig = async () => {
  const configs = await db.config.findMany({
    select: {
      id: true,
      amountTill60DaysPricePerDay: true,
      moreThan60DaysPricePerDay: true,
    },
  });

  if (configs.length === 0) {
    throw new Error("No config found");
  }

  return configs[0];
};

export type GetConfig = SerializeFrom<Awaited<ReturnType<typeof getConfig>>>;
