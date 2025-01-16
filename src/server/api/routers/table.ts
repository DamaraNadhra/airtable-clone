import cuid from "cuid";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const tableRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        name: z.string(),
        baseId: z.string(),
        id: z.string(),
        viewId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const cuid1 = cuid();
      const cuid2 = cuid();
      const cuid3 = cuid();
      const cuid4 = cuid();
      await ctx.db.table.create({
        data: {
          name: input.name,
          baseId: input.baseId,
          id: input.id,
          columns: {
            create: [
              {
                name: "Name",
                id: cuid1,
                type: "text",
                priority: "primary",
                icon: "MdOutlineTextFormat",
              },
              {
                name: "Notes",
                id: cuid2,
                type: "text",
                priority: "secondary",
                icon: "LuLetterText",
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
                      tableId: input.id,
                      columnId: cuid1,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
                      columnId: cuid2,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
                      columnId: cuid3,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
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
                      tableId: input.id,
                      columnId: cuid1,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
                      columnId: cuid2,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
                      columnId: cuid3,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
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
                      tableId: input.id,
                      columnId: cuid1,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
                      columnId: cuid2,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
                      columnId: cuid3,
                    },
                    {
                      stringValue: "",
                      tableId: input.id,
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
                name: "Grid View",
                id: input.viewId,
                sorterState: [],
                filterState: [],
                searchTerm: "",
              },
            ],
          },
        },
      });
      return {
        table: input.id,
        viewId: input.viewId,
      };
    }),

  getTableById: publicProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
      });
      return table;
    }),

  getAllTablesByBaseId: privateProcedure
    .input(
      z.object({
        baseId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tables = await ctx.db.table.findMany({
        where: { baseId: input.baseId },
      });
      return tables;
    }),
  delete: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deleteTable = await ctx.db.table.delete({
        where: { id: input.tableId },
      });

      return deleteTable;
    }),
  rename: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
        newName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedTable = await ctx.db.table.update({
        where: { id: input.tableId },
        data: { name: input.newName },
      });

      return updatedTable;
    }),
});
