import type { SerializeFrom } from "@remix-run/node";
import { db } from "~/lib/prisma.server";

export const getPaymentsByUserId = async (userId: string) => {
  return db.payment.findMany({
    where: {
      OR: [
        {
          bookSale: {
            userId: userId,
          },
        },
        {
          AND: [
            {
              rentalBook: {
                userId: userId,
                isReturned: true,
              },
            },
            {
              rentalBookId: {
                not: null,
              },
            },
          ],
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      bookSale: {
        include: {
          book: true,
        },
      },
      rentalBook: {
        include: {
          book: true,
        },
      },
    },
  });
};

export type GetPaymentsByUserId = SerializeFrom<typeof getPaymentsByUserId>;
