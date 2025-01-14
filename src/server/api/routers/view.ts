import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const viewsRouter = createTRPCRouter({
  getALl: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const views = ctx.db.view.findMany({
        where: { tableId: input.tableId },
      });
      return views;
    }),
  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const viewUnique = ctx.db.view.findUnique({
        where: { id: input.id },
      });
      return viewUnique;
    }),
  create: privateProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const view = await ctx.db.view.create({
        data: {
          id: input.id,
          name: input.name,
          tableId: input.tableId,
        },
      });
      return view;
    }),
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        filters: z.array(z.any()).optional(),
        sorters: z.array(z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedView = await ctx.db.view.update({
        where: { id: input.id },
        data: {
          filterState: input.filters,
          sorterState: input.sorters,
        },
      });
      return updatedView;
    }),
});
