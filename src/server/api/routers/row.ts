import { faker } from "@faker-js/faker";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const rowRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
        id: z.string(),
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
          ...(col.type === "text" ? { stringValue: "" } : { intValue: null }),
        })),
      };
      const createdRow = await ctx.db.row.create({
        data: {
          tableId: input.tableId,
          cells,
          rowOrder: maxRow + 1,
          id: input.id,
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
        idS: z.array(z.string()),
        seed: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const maxRow = await ctx.db.row.count({
        where: { tableId: input.tableId },
      });
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });
      faker.seed(input.seed);
      const fakers = [
        () => faker.person.fullName(),
        () => faker.animal.petName(),
        () => faker.food.dish(),
      ];

      const rowRecords = Array.from({ length: 5000 }).map((_, index) => ({
        tableId: input.tableId,
        rowOrder: maxRow + index + 1,
        id: input.idS[index],
      }));
      const rows = await ctx.db.row.createManyAndReturn({
        data: rowRecords,
      });

      const records = rows.flatMap((row) => {
        return columns.map((col, colIndex) => ({
          columnId: col.id,
          tableId: input.tableId,
          rowId: row.id,
          ...(col.type === "text"
            ? { stringValue: fakers[colIndex % 3]!() }
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
        const cellValue = col.type === "text" ? "stringValue" : "intValue";
        if (col.type === "text") {
          return {
            column: {
              name: col.name,
            },
            [cellValue]: {
              contains: input.searchTerm,
              mode: "insensitive"
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
            ...(input.searchTerm !== "" && {
              cells: {
                some: {
                  OR: searchFilter,
                },
              },
            }),
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
      const ANDFilters = filter
        .filter((filterObj) => filterObj.type === "and")
        .map((filter) => {
          const valueAccessor =
            filter.columnType === "text" ? "stringValue" : "intValue";
          const filterValue =
            filter.columnType === "text"
              ? filter.value
              : Number(filter.value ?? "");

          const positiveFilter = {
            cells: {
              some: {
                column: {
                  name: filter.field,
                },
                [valueAccessor]: {
                  [filter.key]: filterValue,
                },
              },
            },
          };

          const negativeFilter = {
            cells: {
              some: {
                column: {
                  name: filter.field,
                },
                [valueAccessor]: {
                  not: {
                    [filter.key]: filterValue,
                  },
                },
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
          const valueAccessor =
            filter.columnType === "text" ? "stringValue" : "intValue";
          const filterValue =
            filter.columnType === "text"
              ? filter.value
              : Number(filter.value ?? "");

          const positiveFilter = {
            cells: {
              some: {
                column: {
                  name: filter.field,
                },
                [valueAccessor]: {
                  [filter.key]: filterValue,
                },
              },
            },
          };

          const negativeFilter = {
            cells: {
              some: {
                column: {
                  name: filter.field,
                },
                [valueAccessor]: {
                  not: {
                    [filter.key]: filterValue,
                  },
                },
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
          const valueAccessor =
            filter.columnType === "text" ? "stringValue" : "intValue";
          const filterValue =
            filter.columnType === "text"
              ? filter.value
              : Number(filter.value ?? "");

          const positiveFilter = {
            cells: {
              some: {
                column: {
                  name: filter.field,
                },
                [valueAccessor]: {
                  [filter.key]: filterValue,
                },
              },
            },
          };

          const negativeFilter = {
            cells: {
              some: {
                column: {
                  name: filter.field,
                },
                [valueAccessor]: {
                  not: {
                    [filter.key]: filterValue,
                  },
                },
              },
            },
          };

          if (filter.isNegative) {
            return negativeFilter;
          }
          return positiveFilter;
        });
      const sorter = input.sorters.map((sorter) => ({
        [sorter.type === "text" ? "stringValue" : "intValue"]: sorter.order,
      }));
      const sorterNarrower = {
        column: {
          name: input.sorters[0]?.field,
        },
      };
      const cells = await ctx.db.cell.findMany({
        where: {
          tableId: input.tableId,
          ...sorterNarrower,
          row: {
            AND: [
              ...(input.searchTerm !== ""
                ? [
                    {
                      cells: {
                        some: {
                          OR: searchFilter,
                        },
                      },
                    },
                  ]
                : []),
              ...(ORFilters.length === 0
                ? [...ANDFilters, ...neutralFilter]
                : []),
            ],
            ...(ORFilters.length > 0 &&
              ANDFilters.length === 0 && {
                OR: [...ORFilters, ...neutralFilter],
              }),
          },
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

      let nextCursor: string | undefined = undefined;

      if (cells.length > limit) {
        const nextItem = cells.pop();
        nextCursor = nextItem?.id;
      }
      const rows = cells.map((cell) => cell.row);
      function combineComparisonFunctions<T>(
        compareFunctions: Array<(a: T, b: T) => number>,
      ): (a: T, b: T) => number {
        return (a: T, b: T): number => {
          return compareFunctions.reduce((result, compareFunction) => {
            // Proceeds to the next comparison function if the previous one returned 0
            return result || compareFunction(a, b);
          }, 0);
        };
      }

      if (sorter.length > 1) {
        const compareFunctions = input.sorters.map((sorter) => {
          return (a: (typeof rows)[number], b: (typeof rows)[number]) => {
            const sorterValue =
              sorter.type === "text" ? "stringValue" : "intValue";

            // Find the cells to compare
            const cellA = a.cells.find(
              (cell) => cell.column.name === sorter.field,
            );
            const cellB = b.cells.find(
              (cell) => cell.column.name === sorter.field,
            );

            if (!cellA || !cellB) return 0;

            const valueA = cellA[sorterValue];
            const valueB = cellB[sorterValue];

            if (typeof valueA === "number" && typeof valueB === "number") {
              // sort numeric
              return sorter.order === "asc" ? valueA - valueB : valueB - valueA;
            }

            if (typeof valueA === "string" && typeof valueB === "string") {
              // sort strings
              return sorter.order === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
            }

            return 0; 
          };
        });
        const combinedComparator = combineComparisonFunctions(compareFunctions);
        rows.sort(combinedComparator);
      }

      return {
        rows,
        nextCursor,
        totalCount,
      };
    }),
});
