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
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUser;
      const cuid1 = cuid();
      const cuid2 = cuid();
      const cuid3 = cuid();
      const cuid4 = cuid();
      const cuid5 = cuid();
      const base = await ctx.db.base.create({
        data: {
          name: input.name,
          authorId,
          id: input.id,
          tables: {
            create: [
              {
                id: cuid5,
                name: "Table 1",
                columns: {
                  create: [
                    {
                      name: "Name",
                      id: cuid1,
                      type: "text",
                      priority: "primary",
                      icon: "MdOutlineTextFormat",
                      hidden: false,
                    },
                    {
                      name: "Notes",
                      id: cuid2,
                      type: "text",
                      priority: "secondary",
                      icon: "LuLetterText",
                      hidden: false,
                    },
                    {
                      name: "Assignee",
                      id: cuid3,
                      type: "text",
                      priority: "secondary",
                      icon: "PiUser",
                    },
                    {
                      name: "Status",
                      id: cuid4,
                      type: "text",
                      priority: "secondary",
                      icon: "TbCircleChevronDown",
                    },
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
                            tableId: cuid5,
                            columnId: cuid1,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid2,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid3,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid4,
                          },
                        ],
                      },
                    },
                    {
                      rowOrder: 2,
                      cells: {
                        create: [
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid1,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid2,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid3,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid4,
                          },
                        ],
                      },
                    },
                    {
                      rowOrder: 3,
                      cells: {
                        create: [
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid1,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid2,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid3,
                          },
                          {
                            stringValue: "",
                            tableId: cuid5,
                            columnId: cuid4,
                          },
                        ],
                      },
                    },
                  ],
                },
                views: {
                  create: [
                    {
                      name: "Grid View 1",
                      sorterState: [],
                      filterState: [],
                      searchTerm: "",
                    },
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
  getAll: publicProcedure
    .input(
      z.object({
        authorId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const bases = await ctx.db.base.findMany({
        where: { authorId: input.authorId },
      });
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
