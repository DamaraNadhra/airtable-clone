import { faker } from "@faker-js/faker";
import type { Prisma } from "@prisma/client";
import { BsInputCursor } from "react-icons/bs";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

type RowFields = Record<string, string | null>;

export const rowRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });
      const maxRow = await ctx.db.row.count({
        where: { tableId: input.tableId },
      });
      const cells = {
        create: columns.map((col) => ({
          columnId: col.id,
          tableId: input.tableId,
          ...(col.type === "string" ? { stringValue: "" } : { intValue: null }),
        })),
      };
      const createdRow = await ctx.db.row.create({
        data: {
          tableId: input.tableId,
          cells,
          rowOrder: maxRow + 1,
        },
      });
      return createdRow;
    }),
  delete: privateProcedure
    .input(
      z.object({
        rowId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedRow = await ctx.db.row.delete({
        where: { id: input.rowId },
      });
      return deletedRow;
    }),
  add5k: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const maxRow = await ctx.db.row.count({
        where: { tableId: input.tableId },
      });
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });
      const fakers = [
        () => faker.person.fullName(),
        () => faker.animal.petName(),
        () => faker.food.dish(),
      ];

      const rowRecords = Array.from({ length: 300 }).map((_, index) => ({
        tableId: input.tableId,
        rowOrder: maxRow + index + 1,
      }));
      const rows = await ctx.db.row.createManyAndReturn({
        data: rowRecords,
      });

      const records = rows.flatMap((row, index) => {
        return columns.map((col) => ({
          columnId: col.id,
          tableId: input.tableId,
          rowId: row.id,
          ...(col.type === "string"
            ? { stringValue: fakers[index % 3]!() }
            : { intValue: faker.number.int({ min: 1, max: 100 }) }),
        }));
      });

      try {
        await ctx.db.cell.createMany({
          data: records,
        });
        console.log("Successfully added 5000 records.");
      } catch (error) {
        console.error("Error adding records:", error);
      }
    }),
  findByTableId: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
        limit: z.number().min(1).max(1000).nullish(),
        filters: z.array(
          z.object({
            field: z.string(),
            isNegative: z.boolean(),
            key: z.string(),
            value: z.string().nullish(),
            columnType: z.string(),
            id: z.string(),
            filterKey: z.string(),
            type: z.string(),
          }),
        ),
        sorters: z.array(
          z.object({
            type: z.string(),
            field: z.string(),
            id: z.string(),
            order: z.string(),
          }),
        ),
        searchTerm: z.string(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const filter = input.filters?.length > 0 ? input.filters : [];
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });
      const searchFilter = columns.map((col) => {
        const cellValue = col.type === "string" ? "stringValue" : "intValue";
        if (col.type === "string") {
          return {
            column: {
              name: col.name,
            },
            [cellValue]: {
              contains: input.searchTerm,
            },
          };
        }
        return {
          column: {
            name: col.name,
          },
          [cellValue]: {
            equals: Number(input.searchTerm),
          },
        };
      });
      if (input.filters.length === 0 && input.sorters.length === 0) {
        const allRows = await ctx.db.row.findMany({
          where: {
            tableId: input.tableId,
            cells: {
              some: {
                OR: searchFilter,
              },
            },
          },
          include: {
            cells: {
              include: {
                column: true,
              },
            },
          },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: {
            rowOrder: "asc",
          },
        });
        const totalCount = await ctx.db.row.count({
          where: { tableId: input.tableId },
        });
        let nextCursor: string | undefined = undefined;

        if (allRows.length > limit) {
          const nextItem = allRows.pop();
          nextCursor = nextItem?.id;
        }

        return {
          rows: allRows,
          nextCursor,
          totalCount,
        };
      }
      console.log("search filter:", searchFilter);
      const ANDFilters = filter
        .filter((filterObj) => filterObj.type === "and")
        .map((filter) => {
          const filterValue =
            filter.columnType === "string" ? "stringValue" : "intValue";

          const positiveFilter = {
            column: {
              name: filter.field,
            },
            [filterValue]: {
              [filter.key]: filter.value,
            },
          };

          const negativeFilter = {
            column: {
              name: filter.field,
            },
            [filterValue]: {
              not: {
                [filter.key]: filter.value,
              },
            },
          };

          if (filter.isNegative) {
            return negativeFilter;
          }
          return positiveFilter;
        });

      const ORFilters = filter
        .filter((filterObj) => filterObj.type === "or")
        .map((filter) => {
          const filterValue =
            filter.columnType === "string" ? "stringValue" : "intValue";

          const positiveFilter = {
            column: {
              name: filter.field,
            },
            [filterValue]: {
              [filter.key]: filter.value,
            },
          };

          const negativeFilter = {
            column: {
              name: filter.field,
            },
            [filterValue]: {
              not: {
                [filter.key]: filter.value,
              },
            },
          };

          if (filter.isNegative) {
            return negativeFilter;
          }
          return positiveFilter;
        });
      const neutralFilter = filter
        .filter((filterObj) => filterObj.type === "neutral")
        .map((filter) => {
          const filterValue =
            filter.columnType === "string" ? "stringValue" : "intValue";
          const positiveFilter = {
            column: {
              name: filter.field,
            },
            [filterValue]: {
              [filter.key]: filter.value,
            },
          };

          const negativeFilter = {
            column: {
              name: filter.field,
            },
            [filterValue]: {
              not: {
                [filter.key]: filter.value,
              },
            },
          };

          if (filter.isNegative) {
            return negativeFilter;
          }
          return positiveFilter;
        });
      const sorter = input.sorters.map((sorter) => ({
        [sorter.type === "string" ? "stringValue" : "intValue"]: sorter.order,
      }));
      const sorterNarrower = {
        column: {
          name: input.sorters[0]?.field,
        },
      };
      const cells = await ctx.db.cell.findMany({
        where: {
          tableId: input.tableId,
          ...(neutralFilter.length === 0 &&
            ANDFilters.length === 0 &&
            ORFilters.length === 0 &&
            sorterNarrower),

          AND: [
            ...(ORFilters.length === 0
              ? [...ANDFilters, ...neutralFilter]
              : []),
            {
              row: {
                cells: {
                  some: {
                    OR: searchFilter,
                  },
                },
              },
            },
          ] as Prisma.CellWhereInput[],
          ...(ORFilters.length > 0 &&
            ANDFilters.length === 0 && {
              OR: [...ORFilters, ...neutralFilter] as Prisma.CellWhereInput[],
            }),
        },
        include: {
          column: true,
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
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: sorter[0] as Prisma.CellOrderByWithRelationInput,
        distinct: "rowId",
      });
      const totalCount = await ctx.db.row.count({
        where: { tableId: input.tableId },
      });

      console.log(searchFilter);
      let nextCursor: string | undefined = undefined;

      if (cells.length > limit) {
        const nextItem = cells.pop();
        nextCursor = nextItem?.id;
      }
      const rows = cells.map((cell) => cell.row);
      if (sorter.length > 1) {
        input.sorters.map((sorter, index) => {
          if (index === 0) return;
          rows.sort((rowA, rowB) => {
            console.log("hahaha");
            const sorterValue =
              sorter.type === "string" ? "stringValue" : "intValue";
            const cellA = rowA.cells.find(
              (cell) => cell.column.name === sorter.field,
            );
            const cellB = rowB.cells.find(
              (cell) => cell.column.name === sorter.field,
            );
            const valueA = cellA![sorterValue];
            const valueB = cellB![sorterValue];
            if (typeof valueA === "number" && typeof valueB === "number") {
              if (sorter.order === "asc") {
                return valueA - valueB;
              } else {
                return valueB - valueA;
              }
            }
            if (typeof valueA === "string" && typeof valueB === "string") {
              if (sorter.type === "asc") {
                return valueA.localeCompare(valueB); // Lexicographic comparison
              } else {
                return valueB.localeCompare(valueA); // Lexicographic comparison
              }
            }
            return 0;
          });
        });
      }
      return {
        rows,
        nextCursor,
        totalCount,
      };
    }),
});
