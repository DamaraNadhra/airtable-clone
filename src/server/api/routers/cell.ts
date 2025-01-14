import { Prisma } from "@prisma/client";
import { tuple, z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const cellsRouter = createTRPCRouter({
  getAllByTableId: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const cells = await ctx.db.cell.findMany({
        where: { tableId: input.tableId },
        include: {
          row: {
            include: {
              cells: {
                include: {
                  column: true,
                },
              },
            },
          },
        },
      });
      return cells.map((cell) => cell.row);
    }),
  update: privateProcedure
    .input(
      z.object({
        rowId: z.string(),
        columnId: z.string(),
        newValue: z.union([z.string(), z.number()]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cell = await ctx.db.cell.findUnique({
        where: {
          rowId_columnId: {
            rowId: input.rowId,
            columnId: input.columnId,
          },
        },
      });
      const newData =
        typeof input.newValue === "string"
          ? { stringValue: input.newValue }
          : { intValue: Number(input.newValue) };
      const updatedCells = await ctx.db.cell.update({
        where: { id: cell?.id },
        data: newData,
      });
      return updatedCells;
    }),
});
