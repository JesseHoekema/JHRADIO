import { prisma } from "./prisma";
import { auth } from "./auth";

export const getShowById = async (id: string) => {
  return prisma.show.findUnique({
    where: { id: Number(id) },
  });
};

export const getIdByShowTitle = async (title: string) => {
  const show = await prisma.show.findFirst({
    where: { name: title },
    select: { id: true },
  });
  return show?.id ?? null;
}

export const getAllShows = async () => {
  return prisma.show.findMany();
}
