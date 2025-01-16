import type { Prisma, View } from "@prisma/client";

export type SortObject = {
  id: string;
  order: string;
  field: string;
  type: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type MetaType = {
  icon: string;
  type: string;
  priority: string;
  tableId: string;
};

export type ViewObj = View & {
  filterState?: Prisma.JsonValue[] | Record<string, string>[];
  sorterState?: Prisma.JsonValue[] | Record<string, string>[];
  isRenaming?: boolean;
  createdAt?: Date;
  searchTerm?: string;
};
