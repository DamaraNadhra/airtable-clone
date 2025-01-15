import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const columnRouter = createTRPCRouter({
  getAll: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });
      return columns;
    }),
  create: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string(),
        id: z.string().optional(),
        type: z.string(),
        iconName: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const defaultIcon =
        input.type === "string" ? "LuLetterText" : "AiOutlineNumber";
      const response = await ctx.db.column.create({
        data: {
          name: input.name,
          tableId: input.tableId,
          id: input.id,
          type: input.type,
          icon: input.iconName ?? defaultIcon,
          priority: "secondary",
        },
      });
      const rows = await ctx.db.row.findMany({
        where: { tableId: input.tableId },
      });

      for (const row of rows) {
        await ctx.db.cell.create({
          data: {
            rowId: row.id,
            columnId: response.id,
            tableId: response.tableId,
            ...(response.type === "string"
              ? { stringValue: "" }
              : { intValue: 0 }),
          },
        });
      }
      return response;
    }),
});
