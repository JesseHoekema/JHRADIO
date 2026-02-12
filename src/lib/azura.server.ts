import type { Request } from "../../generated/prisma/client";
import { prisma } from "$lib/prisma";

export const getRequestedSongsByCurrentDate = async (): Promise<Request[]> => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.request.findMany({
    where: {
      requestedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: {
      requestedAt: "asc"
    }
  });
};
