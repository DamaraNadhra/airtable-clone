import cuid from "cuid";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;
      const cuid1 = cuid();
      const cuid2 = cuid();
      const cuid3 = cuid();
      const cuid4 = cuid();
      const base = await ctx.db.base.create({
        data: {
          name: input.name,
          authorId,
          tables: {
            create: [
              {
                id: cuid4,
                name: "Table 1",
                columns: {
                  create: [
                    { name: "Name", id: cuid1, type: "string" },
                    { name: "Notes", id: cuid2, type: "string" },
                    { name: "Assignee", id: cuid3, type: "string" },
                  ],
                },
                rows: {
                  create: [
                    {
                      rowOrder: 1,
                      cells: {
                        create: [
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid1,
                          },
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid2,
                          },
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid3,
                          },
                        ],
                      },
                    },
                    {
                      rowOrder: 1,
                      cells: {
                        create: [
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid1,
                          },
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid2,
                          },
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid3,
                          },
                        ],
                      },
                    },
                    {
                      rowOrder: 1,
                      cells: {
                        create: [
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid1,
                          },
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid2,
                          },
                          {
                            stringValue: "",
                            tableId: cuid4,
                            columnId: cuid3,
                          },
                        ],
                      },
                    },
                  ],
                },
                views: {
                  create: [
                    { name: "Grid View 1", sorterState: [], filterState: [] },
                  ],
                },
              },
            ],
          },
        },
        include: {
          tables: true,
        },
      });
      return base;
    }),

  getBaseById: publicProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const base = await ctx.db.base.findUnique({
        where: { id: input.baseId },
        include: { tables: true },
      });
      if (!base) {
        throw new Error("Base not found");
      }
      return base;
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const bases = await ctx.db.base.findMany();
    return bases;
  }),
  rename: privateProcedure
    .input(
      z.object({
        baseId: z.string(),
        newName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedBase = await ctx.db.base.update({
        where: { id: input.baseId },
        data: { name: input.newName },
      });
      return updatedBase;
    }),
  deleteById: privateProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedBase = await ctx.db.base.delete({
        where: { id: input.baseId },
      });

      return deletedBase;
    }),
});
