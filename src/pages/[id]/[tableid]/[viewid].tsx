import type { NextPage } from "next";
import { useRouter } from "next/router";
import { SiAirtable } from "react-icons/si";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  createColumnHelper,
  type SortingState,
  getSortedRowModel,
  type OnChangeFn,
  Cell,
  Header,
  Table as TanstackTable,
  TableFeature,
  Row,
} from "@tanstack/react-table";

import { api } from "~/utils/api";
import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import { IoChevronDownSharp } from "react-icons/io5";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { RxHamburgerMenu } from "react-icons/rx";
import { VscTable } from "react-icons/vsc";
import { PiCalendar, PiPlus, PiUsersThree } from "react-icons/pi";
import { IoFilterOutline } from "react-icons/io5";
import type { Base, Table } from "@prisma/client";
import { TbArrowsSort } from "react-icons/tb";
import { AiOutlineGroup } from "react-icons/ai";
import { PiPaintBucket } from "react-icons/pi";
import { RxRows } from "react-icons/rx";
import { PiArrowSquareOut } from "react-icons/pi";
import toast from "react-hot-toast";
import { BsEyeSlash } from "react-icons/bs";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { RiGalleryView2 } from "react-icons/ri";
import { PiKanban } from "react-icons/pi";
import { FaRegListAlt } from "react-icons/fa";
import {
  FaChartGantt,
  FaChevronDown,
  FaRegStar,
  FaWpforms,
} from "react-icons/fa6";
import { TablePopUp } from "~/components/TablePopUp";
import { GoGear } from "react-icons/go";
import { BasePopUp } from "~/components/BasePopUp";
import { useVirtualizer } from "@tanstack/react-virtual";
import cuid from "cuid";
import { ColumnPopUp } from "~/components/ColumnPopUp";
import { FilterPopUp } from "~/components/FilterPopUp";
import { SortPopUp } from "~/components/SortPopUp";
import { SearchPopUp } from "~/components/SearchPopUp";
import { useDebounce } from "use-debounce";
import type { MetaType, SortObject, ViewObj } from "~/helpers/types";
import { TableView } from "~/components/TableView";
import { ViewPopUp } from "~/components/ViewPopUp";
import { getIconComponent } from "~/helpers/getIconComponent";

const columnHelper = createColumnHelper<Record<string, string>>();

type FilterObj = {
  field: string;
  key: string;
  filterKey: string;
  value: string | null;
  isNegative: boolean;
  type: string;
  columnType: string;
  id: string;
};

interface ViewsListProps {
  name: string;
  id: string;
  tableId: string;
  isRenaming: boolean;
  setCurrentView: React.Dispatch<React.SetStateAction<string | undefined>>;
  setViewState: React.Dispatch<React.SetStateAction<ViewObj[]>>;
  currentViewId: string;
  viewState: ViewObj[];
}

const ViewsList = ({
  name,
  id,
  tableId,
  setCurrentView,
  isRenaming,
  setViewState,
  currentViewId,
  viewState,
}: ViewsListProps) => {
  const isActive = (id: string) => currentViewId === id;
  const { mutate: updateView } = api.views.update.useMutation({});
  const [currentName, setCurrentName] = useState<string>("");
  useEffect(() => {
    setCurrentName(name);
  }, [viewState, name]);
  return (
    <div
      className={`flex cursor-pointer flex-row items-center justify-normal gap-1 rounded-[3px] ${isActive(id) ? "bg-[#C4ECFFB3]" : "bg-white hover:bg-[#f2f2f2]"} group px-2 py-2 text-[12.5px] font-[500]`}
    >
      <div className="w-5 group-hover:hidden">
        <VscTable className="text-[#166EE1]" size={17} />
      </div>
      <div className="hidden w-5 group-hover:flex">
        <FaRegStar size={16} />
      </div>
      {isRenaming ? (
        <input
          className="w-full text-[13px]"
          type="text"
          value={currentName}
          onChange={(e) => {
            setCurrentName(e.target.value);
            console.log(name);
          }}
          onBlur={() => {
            setViewState((prev) => {
              return prev.map((view) =>
                view.id === id
                  ? { ...view, isRenaming: false, name: currentName }
                  : view,
              );
            });
            updateView({ id, newName: currentName });
          }}
        />
      ) : (
        <span>{name}</span>
      )}
    </div>
  );
};
const PopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  setData: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
  record: string;
}> = ({ x, y, isOpen, setData, record }) => {
  if (!isOpen) return null;

  const ctx = api.useUtils();
  const { mutate: delRecord } = api.rows.delete.useMutation({
    onSuccess: () => {
      void ctx.rows.invalidate();
      setData((prevDatas) => prevDatas.filter((row) => row.id !== record));
    },
    onError: () => {
      toast.error("Something went wrong, please try again");
    },
  });

  const deleteRecord = () => {
    delRecord({ rowId: record });
  };

  return (
    <div
      className="fixed rounded-md bg-white p-2 shadow-lg"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <span
        className="cursor-pointer px-1 py-1 text-sm text-red-500 hover:bg-[#f8f8f8]"
        onClick={(e) => {
          e.preventDefault();
          deleteRecord();
        }}
      >
        Delete record
      </span>
    </div>
  );
};

const ViewLayout: NextPage = () => {
  const router = useRouter();
  const ctx = api.useUtils();
  const {
    id: baseId,
    tableid: tableId,
    viewid: viewId,
    fetchedBase,
    tableState,
  } = router.query;
  if (
    typeof baseId !== "string" ||
    typeof tableId !== "string" ||
    typeof viewId !== "string"
  )
    throw new Error("Invalid baseId or tableId");
  useEffect(() => {
    console.log("current table id: ", tableId);
  }, [tableId]);
  const [currentTableId, setTableId] = useState<string>(tableId);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentTables, setTables] = useState<Table[]>(
    tableState ? (JSON.parse(tableState as string) as Table[]) : [],
  );
  const [filterPopUpState, setFilterPopUpState] = useState<boolean>(false);
  const [rowsTemp, setRows] = useState<Record<string, string>[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [columns, setColumns] = useState<
    ColumnDef<Record<string, string>, string>[]
  >([]);
  const [loadingViewsState, setLoadingViewsState] = useState<boolean>(true);
  const [viewsState, setViewState] = useState<ViewObj[]>([]);
  const [searchState, setSearchState] = useState<string>("");
  const [sortPopUpState, setSortPopUpState] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterObj[]>([]);
  useEffect(() => {
    if (viewId) {
      setCurrentView(viewId);
    }
  }, [viewId]);
  const [sorters, setSorters] = useState<SortObject[]>([]);
  const [columnPopUp, setColumnPopUpOpen] = useState<boolean>(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [baseModalOpen, setBaseModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchPopUpState, setSearchPopUpState] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>();
  const [popUpId, setPopUpId] = useState<string>("");
  const [selectedViewId, setSelectedViewId] = useState<string>("");
  const [viewPopUpModalOpen, setViewPopUpModalOpen] = useState<boolean>(false);
  const [debouncedSearchTerm] = useDebounce(searchState, 400);
  const [rowSelection, setRowSelection] = useState({});
  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);
  const { mutate: add5k } = api.rows.add5k.useMutation({
    onSuccess: () => {
      toast.success("Successfully added 5k records");
      void ctx.rows.invalidate();
    },
  });
  const { data: viewsData, isLoading: loadingViews } =
    api.views.getALl.useQuery({ tableId });
  const { data: currentViewData, isLoading: loadingCurrentView } =
    api.views.getById.useQuery({ id: viewId });
  const { data: baseData, isLoading: loadingBaseData } =
    api.base.getBaseById.useQuery({ baseId });
  const { data: tables, isLoading: loadingTablesData } =
    api.table.getAllTablesByBaseId.useQuery({ baseId });
  const { mutate: updateView } = api.views.update.useMutation();
  const { data: columnData, isLoading: loadingColumnData } =
    api.columns.getAll.useQuery({ tableId });
  const [currentBase, setCurrentBase] = useState<Base | Record<string, string>>(
    fetchedBase ? (JSON.parse(fetchedBase as string) as Base) : {},
  );

  useEffect(() => {
    if (viewsState.length > 0) {
      const currentViewObj = viewsState.find((v) => v.id === currentView);
      if (currentViewObj) {
        setFilters(currentViewObj.filterState as FilterObj[]);
        setSorters(currentViewObj.sorterState as SortObject[]);
        setSearchState(currentViewObj.searchTerm);
      }
    }
  }, [viewsState, currentView]);
  useEffect(() => {
    if (viewsData) {
      setViewState(viewsData);
    }
  }, [viewsData]);
  useEffect(() => {
    if (tables) {
      setTables(tables);
    }
  }, [tables]);
  useEffect(() => {
    if (baseData) {
      setCurrentBase(baseData);
    }
  }, [baseData]);
  useEffect(() => {
    if (currentViewData) {
      setCurrentView(currentViewData.id);
    }
  }, [currentViewData]);
  useEffect(() => {
    setViewState((prev) =>
      prev.map((view) =>
        view.id === currentView
          ? { ...view, searchTerm: debouncedSearchTerm }
          : view,
      ),
    );
    updateView({ id: currentView!, searchTerm: debouncedSearchTerm });
    console.log("updating debounced search term");
  }, [debouncedSearchTerm, currentView, updateView]);
  const {
    data: rowsData,
    fetchNextPage,
    isFetching,
    isLoading: loadingRowsData,
  } = api.rows.findByTableId.useInfiniteQuery(
    {
      limit: 60,
      tableId,
      filters: filters ?? [],
      sorters: sorters ?? [],
      searchTerm: debouncedSearchTerm,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  useEffect(() => {
    if (
      !(
        loadingColumnData &&
        loadingTablesData &&
        loadingBaseData &&
        loadingRowsData &&
        loadingCurrentView
      )
    ) {
      setIsLoading(false);
    }
  }, [
    loadingColumnData,
    loadingTablesData,
    loadingBaseData,
    loadingRowsData,
    loadingCurrentView,
  ]);
  useEffect(() => {
    if (!loadingViews && !loadingCurrentView) {
      setLoadingViewsState(false);
    }
  }, [loadingViews, loadingCurrentView]);

  const { mutate: newRow } = api.rows.create.useMutation({
    onSuccess: () => {
      toast.success("Successfully created row");
    },
  });
  const { mutate: updateCell } = api.cells.update.useMutation();
  const { mutate: createTable } = api.table.create.useMutation({
    onSuccess: ({ table, viewId }) => {
      void router.push(`/${baseId}/${table}/${viewId}`);
    },
  });
  const { mutate: createView } = api.views.create.useMutation({
    onSuccess: (createdView) => {
      void router.push(`/${baseId}/${tableId}/${createdView.id}`);
    },
  });
  const handleHighLightCell = (cell: Cell<Record<string, string>, unknown>) => {
    let accumulatedBg = "";
    const isFiltered = filters.some(
      (filter) => filter.field === cell.column.columnDef.header,
    );
    const isSorted = sorters.some(
      (sorter) => sorter.field === cell.column.columnDef.header,
    );
    const cellValue = cell.getValue();
    if (
      (typeof cellValue === "string" || typeof cellValue === "number") &&
      debouncedSearchTerm &&
      String(cellValue).includes(debouncedSearchTerm)
    ) {
      return "bg-[#ffd17e]";
    }
    if (filters.length === 0 && sorters.length === 0 && searchState === "") {
      return "group-hover:bg-[#f2f2f2] bg-white";
    }
    if (isFiltered && !isSorted) {
      accumulatedBg += "bg-[#e9fbed] group-hover:bg-[#e3f4e7] ";
    }
    if (isSorted && !isFiltered) {
      accumulatedBg += "bg-[#fff2eb] group-hover:bg-[#f9ece5]";
    }
    if (isSorted && isFiltered) {
      accumulatedBg += "bg-[#e9fbed] group-hover:bg-[#e3f4e7]";
    }
    if (!isSorted && !isFiltered) {
      accumulatedBg +=
        "group-hover:bg-[#f8f8f8] group-hover:bg-opacity-90 bg-white";
    }
    return accumulatedBg;
  };
  const handleHighLightHeader = (
    header: Header<Record<string, string>, unknown>,
  ) => {
    let accumulatedBg = "";
    const isFiltered = filters.some(
      (filter) => filter.field === header.column.columnDef.header,
    );
    const isSorted = sorters.some(
      (sorter) => sorter.field === header.column.columnDef.header,
    );

    if (filters.length === 0 && sorters.length === 0 && searchState === "") {
      return "bg-[#f2f2f2] hover:bg-[#fafafa] hover:bg-opacity-80";
    }

    if (isFiltered && !isSorted) {
      accumulatedBg += "bg-[#eff5f1]";
    }
    if (isSorted && !isFiltered) {
      accumulatedBg += "bg-[#fcf8f6]";
    }
    if (isSorted && isFiltered) {
      accumulatedBg += "bg-[#eff5f1]";
    }
    if (!isSorted && !isFiltered) {
      accumulatedBg += "bg-[#f2f2f2] hover:bg-[#fafafa] hover:bg-opacity-50";
    }
    return accumulatedBg;
  };

  const flattenedRows = useMemo(
    () =>
      rowsData?.pages?.flatMap((page) =>
        page.rows.map((row) => ({
          ...row.cells.reduce(
            (acc, cell) => {
              if (cell.column.type === "text") {
                acc[cell.column.name] = cell.stringValue ?? "";
              } else {
                acc[cell.column.name] = cell.intValue ?? "";
              }
              return acc;
            },
            {} as Record<string, string | number>,
          ),
          id: row.id,
        })),
      ) ?? [],
    [rowsData],
  );

  useEffect(() => {
    setRows(flattenedRows);
  }, [flattenedRows]);

  const totalDBRowCount = rowsData?.pages?.[0]?.totalCount ?? 0;
  const totalFetched = flattenedRows.length;

  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          void fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  type TableMetaType = {
    updateCellData: (
      rowIndex: number,
      colId: string,
      columnHeader: string,
      value: string,
      rowId: string,
    ) => void;
  };
  const EditableCell: React.FC<{
    getValue: () => unknown;
    rowIndex: number;
    rowId: string;
    columnId: string;
    table: TanstackTable<Record<string, string>>;
    columnHeader: string;
  }> = ({ getValue, rowIndex, rowId, columnId, table, columnHeader }) => {
    const initialValue = getValue() as string;
    const [value, setValue] = React.useState<string>(initialValue);

    // Call updateData when the input loses focus
    const onBlur = () => {
      (table.options.meta as TableMetaType).updateCellData(
        rowIndex,
        columnId,
        value,
        columnHeader,
        rowId,
      );
    };

    // Sync state when external value changes
    React.useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    return (
      <input
        className={`focus:outline-5 h-[32px] w-full bg-transparent pl-2 text-[13px] text-gray-800 text-opacity-95 focus:outline-blue-500`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
      />
    );
  };
  const defaultColumn: Partial<ColumnDef<Record<string, string>>> = {
    cell: ({
      getValue,
      row,
      column: {
        id,
        columnDef: { header },
      },
      table,
    }) => {
      return (
        <EditableCell
          rowId={row.id}
          getValue={getValue}
          rowIndex={row.index}
          columnId={id}
          columnHeader={header as string}
          table={table}
        />
      );
    },
  };
  type rowSelectionMeta = {
    isUtilityColumn: boolean;
  };
  useEffect(() => {
    if (!loadingColumnData && columnData) {
      const updatedColumns = columnData.map((column) => {
        return columnHelper.accessor(column.name, {
          header: column.name,
          id: column.id,
          size: 180,
          meta: {
            icon: column.icon,
            type: column.type,
            priority: column.priority,
            tableId: column.tableId,
          },
        });
      });
      setColumns(updatedColumns);
    }
  }, [loadingColumnData, columnData]);

  const table = useReactTable({
    data: rowsTemp,
    columns,
    defaultColumn,
    getRowId: (row) => row.id!,
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    state: { rowSelection: rowSelection },
    meta: {
      updateCellData: (
        rowIndex: number,
        colId: string,
        value: string,
        columnHeader: string,
        rowId: string,
      ) => {
        setRows((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              updateCell({ columnId: colId, newValue: value, rowId });
              return {
                ...old[rowIndex]!,
                [columnHeader]: value,
              };
            }
            return row;
          }),
        );
      },
    },
  });

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    if (!!table.getRowModel().rows.length) {
      rowVirtualizer.scrollToIndex?.(0);
    }
  };

  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 32, //estimate row height for accurate scrollbar dragging
    getScrollElement: () => tableContainerRef.current,
    //measure dynamic row height
    measureElement:
      typeof window !== "undefined"
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });
  return (
    <>
      <main
        className="flex h-screen w-screen flex-col overflow-x-hidden bg-[#f7f7f7]"
        onClick={(e) => {
          e.preventDefault();
          if (e.button === 0) {
            closePopup();
          }
        }}
      >
        <div className="relative flex">
          <div
            id="topbar"
            className="flex h-[56px] w-full flex-row items-center justify-between bg-[#007da1]"
          >
            <div className="flex h-[24px] w-auto flex-row items-center justify-between gap-2 pl-4 text-white">
              <div className="flex flex-row justify-normal gap-[1px]">
                <div
                  id="icon-container"
                  className="group ml-[1px] mt-[3px] flex h-[32px] w-[32px] cursor-pointer p-1"
                >
                  <div
                    className="hidden rounded-full bg-white p-[6px] opacity-0 transition-opacity duration-300 group-hover:flex group-hover:opacity-100"
                    onClick={() => {
                      void router.push("/");
                    }}
                  >
                    <FiArrowLeft className="text-[#007da1]" size={12} />
                  </div>
                  <div className="group-hover:hidden">
                    <SiAirtable size={21} />
                  </div>
                </div>
                <div
                  className="flex cursor-pointer flex-row items-center justify-between gap-2 pl-2"
                  onClick={(e) => {
                    e.preventDefault();
                    const element = e.currentTarget;
                    const rect = element.getBoundingClientRect();
                    setMousePosition({ x: rect.left, y: rect.bottom });
                    setBaseModalOpen(true);
                  }}
                >
                  <span className="text-[17px] font-semibold">
                    {currentBase?.name}
                  </span>
                  <div>
                    <IoChevronDownSharp size={13} />
                  </div>
                </div>
              </div>
              <div className="ml-2 cursor-default rounded-full border-[1px] border-[#1b6074] bg-[#006a89] px-[11px] py-[4px] text-[12.5px] text-gray-200 text-opacity-95 shadow-inner hover:bg-cyan-800 hover:bg-opacity-40">
                Data
              </div>
              <div className="cursor-pointer rounded-full px-3 py-[6px] text-[12.5px] text-white text-opacity-80 hover:bg-cyan-800 hover:bg-opacity-40">
                Automations
              </div>
              <div className="cursor-pointer rounded-full px-3 py-[6px] text-[12.5px] text-white text-opacity-80 hover:bg-cyan-800 hover:bg-opacity-40">
                Interfaces
              </div>
              <div className="h-5 border-r border-slate-300 border-opacity-30"></div>
              <div className="cursor-pointer rounded-full px-3 py-[6px] text-[12.5px] text-white text-opacity-80 hover:bg-cyan-800 hover:bg-opacity-40">
                Forms
              </div>
            </div>
            <div className="flex flex-row justify-between"></div>
          </div>

          <div className="absolute left-0 right-0 top-[56px] h-[32px] overflow-auto overflow-y-hidden bg-[#007091]">
            <div className="flex h-full flex-row pl-3">
              {currentTables.map((table) => (
                <TableView
                  {...table}
                  setPopUpId={setPopUpId}
                  currentTableId={currentTableId}
                  setModal={setTableModalOpen}
                  currentBase={currentBase as Base}
                  setTableId={setTableId}
                  tableState={currentTables}
                  setPosition={setMousePosition}
                  key={table.id}
                />
              ))}
              <button
                className="flex flex-row items-center gap-2 px-2 text-slate-300 hover:text-slate-200"
                onClick={() => {
                  const uniqueCUID = cuid();
                  const uniqueCUID2 = cuid();
                  const createdTable = {
                    name: "New Table",
                    baseId,
                    id: uniqueCUID,
                    createdAt: new Date(),
                  };
                  setTables((prevData) => [...prevData, createdTable]);
                  setTableId(createdTable.id);
                  createTable({
                    baseId,
                    id: uniqueCUID,
                    name: "New Table",
                    viewId: uniqueCUID2,
                  });
                  setIsLoading(true);
                  setLoadingViewsState(true);
                }}
              >
                <div>
                  <FiPlus size={18} className="" />
                </div>
                <span className="-mb-[1px] text-[12.5px]">Add or import</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-[32px]">
          <div className="relative">
            <div className="absolute left-0 right-0 top-[44px] z-0 h-[32px] w-full border-b-[1.5px] border-black border-opacity-10 bg-white"></div>
            <div
              id="view-bar-container"
              className="absolute left-0 right-0 top-0 flex h-[44px] w-full flex-none flex-row justify-between border-b-[1.2px] border-black border-opacity-20 bg-white text-black shadow-sm"
            >
              <div className="ml-3 flex flex-row items-center justify-between gap-2">
                <div
                  id="view"
                  className={`flex flex-row items-center justify-normal gap-1 rounded-[4px] ${loadingViewsState ? "bg-white" : "bg-[#f2f2f2]"} px-2 py-1 text-[12.5px] font-[500] hover:ring-2 hover:ring-inset hover:ring-gray-300`}
                >
                  <RxHamburgerMenu size={15} />
                  <span>Views</span>
                </div>
                {loadingViewsState ? (
                  <>
                    <div className="animate-pulse rounded-full bg-[#e0e0e0] px-10 py-2"></div>
                    <div className="animate-pulse rounded-full bg-[#e0e0e0] px-10 py-2"></div>
                  </>
                ) : (
                  <>
                    <div className="h-5 w-[1px] border-r-[1px] border-black opacity-30"></div>
                    <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-sm px-2 py-1 text-[12.5px] font-[500] transition-colors delay-[35ms] hover:bg-[#f2f2f2]">
                      <VscTable className="text-[#166EE1]" size={17} />
                      <span className="ml-1">Grid view</span>
                      <PiUsersThree size={17} />
                      <IoChevronDownSharp size={15} />
                    </div>
                    <div className="flex cursor-pointer flex-row items-center justify-normal gap-1 rounded-sm px-2 py-1 text-[12.5px] text-gray-800 transition-colors delay-[35ms] hover:bg-[#f2f2f2]">
                      <BsEyeSlash size={15} />
                      <span>Hide fields</span>
                    </div>
                    <div
                      className={`flex w-auto cursor-pointer flex-row items-center justify-normal gap-1 rounded-[4px] px-2 py-1 text-[12.5px] text-gray-800 ${filters.length > 0 ? "bg-[#caf4d3] hover:ring-2 hover:ring-inset hover:ring-[#b5dbbd]" : "transition-colors delay-[35ms] hover:bg-[#f2f2f2]"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = e.currentTarget;
                        const rect = element.getBoundingClientRect();
                        setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                        setFilterPopUpState(true);
                      }}
                    >
                      <IoFilterOutline size={15} />
                      <span className="w-auto">
                        {filters.length > 0
                          ? `Filtered by ${Array.from(new Set(filters.map((fil) => fil.field))).join(", ")}`
                          : "Filter"}
                      </span>
                    </div>
                    <div className="flex cursor-pointer flex-row items-center justify-normal gap-1 rounded-[4px] px-2 py-1 text-[12.5px] text-gray-800 transition-colors delay-[35ms] hover:bg-[#f2f2f2]">
                      <AiOutlineGroup size={15} />
                      <span>Group</span>
                    </div>
                    <div
                      className={`flex cursor-pointer flex-row items-center justify-normal gap-1 rounded-[4px] px-2 py-1 text-[12.5px] text-gray-800 ${sorters.length > 0 ? "bg-[#ffe0cd] hover:ring-2 hover:ring-inset hover:ring-[#e5c9b8]" : "transition-colors delay-[35ms] hover:bg-[#f2f2f2]"}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = e.currentTarget;
                        const rect = element.getBoundingClientRect();
                        setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                        setSortPopUpState(true);
                      }}
                    >
                      <TbArrowsSort className="scale-y-125" size={13} />
                      <span>
                        {sorters.length > 0
                          ? `Sorted by ${sorters.length} ${sorters.length > 1 ? "fields" : "field"}`
                          : "Sort"}
                      </span>
                    </div>
                    <div className="flex cursor-pointer flex-row items-center justify-normal gap-1 rounded-sm px-2 py-1 text-[12.5px] text-gray-800 transition-colors delay-[35ms] hover:bg-[#f2f2f2]">
                      <PiPaintBucket size={15} />
                      <span>Color</span>
                    </div>
                    <div className="flex cursor-pointer items-center justify-normal rounded-sm px-2 py-1 text-[12.5px] text-gray-800 transition-colors delay-[35ms] hover:bg-[#f2f2f2]">
                      <RxRows size={13} />
                    </div>
                    <div
                      className="flex cursor-pointer flex-row items-center justify-normal gap-1 rounded-sm px-2 py-1 text-[12.5px] text-gray-800 transition-colors delay-[35ms] hover:bg-[#f2f2f2]"
                      onClick={() =>
                        console.log(
                          viewsState.find((v) => v.id === currentView),
                        )
                      }
                    >
                      <PiArrowSquareOut size={15} />
                      <span>Share and sync</span>
                    </div>
                  </>
                )}
              </div>
              <div
                className="mr-3 flex cursor-pointer items-center"
                onClick={(e) => {
                  e.preventDefault();
                  const element = e.currentTarget;
                  const rect = element.getBoundingClientRect();
                  setMousePosition({ x: rect.left - 290, y: rect.bottom + 3 });
                  setSearchPopUpState(true);
                }}
              >
                <HiMagnifyingGlass size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[44px]"></div>
        <div className="relative z-10 flex h-[calc(100%-132px)] flex-row">
          {loadingViewsState ? (
            <div className="flex h-full w-[282px] flex-col justify-between border-2 bg-white px-3 pt-2">
              <div className="mt-10 flex h-[33px] flex-row items-center rounded-md bg-[#fafafa]">
                <div className="ml-3 h-[20px] animate-pulse rounded-md bg-[#e0e0e0] px-[10px]"></div>
                <div className="ml-3 animate-pulse rounded-full bg-[#e0e0e0] px-20 py-2"></div>
              </div>
            </div>
          ) : (
            <div className="relative flex h-full w-full flex-row">
              <div
                className="sticky top-0 z-10 flex h-full w-[282px] flex-col justify-between border-2 bg-white px-3 pt-2"
                id="sidebar"
                onClick={() => {
                  setTableModalOpen(false);
                }}
              >
                <div className="flex flex-col gap-0">
                  <div className="my-2 flex flex-row border-b focus-within:border-b-blue-500">
                    <div className="flex w-full flex-row items-center justify-start gap-2 pb-1 pl-3">
                      <div>
                        <HiMagnifyingGlass size={16} />
                      </div>
                      <input
                        type="text"
                        placeholder="Find a view"
                        className="max-w-[190px] bg-transparent outline-none placeholder:text-xs"
                      />
                    </div>
                    <div className="flex cursor-pointer items-center pr-3">
                      <GoGear className="text-gray-500" size={16} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {viewsState.map((view) => (
                      <div
                        key={view.id}
                        onClick={() => {
                          const isActive = () => currentView === view.id;
                          if (!isActive()) {
                            setCurrentView(view.id);
                            void router.push(
                              `/${baseId}/${tableId}/${view.id}`,
                            );
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          const element = e.currentTarget;
                          const rect = element.getBoundingClientRect();
                          setMousePosition({
                            x: rect.right + 10,
                            y: rect.top,
                          });
                          setSelectedViewId(view.id);
                          setViewPopUpModalOpen(true);
                        }}
                      >
                        <ViewsList
                          currentViewId={currentView!}
                          isRenaming={view.isRenaming ?? false}
                          id={view.id}
                          name={view.name}
                          setCurrentView={setCurrentView}
                          setViewState={setViewState}
                          tableId={view.tableId}
                          viewState={viewsState}
                          key={view.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-0 px-1 py-3 pt-4">
                  <div className="border-t pb-3"></div>
                  <div className="flex cursor-pointer flex-row items-center justify-between pb-3">
                    <span className="pl-3 text-[15px] font-[500]">
                      Create...
                    </span>
                    <div className="pr-3">
                      <IoChevronDownSharp size={13} />
                    </div>
                  </div>
                  <div
                    className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[7px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]"
                    onClick={(e) => {
                      e.preventDefault();
                      const uniqueCUID = cuid();
                      const newView: ViewObj = {
                        searchTerm: "",
                        id: uniqueCUID,
                        name: "Grid View",
                        tableId: tableId,
                        filterState: [],
                        sorterState: [],
                        isRenaming: false,
                        createdAt: new Date(),
                      };
                      setCurrentView(newView.id);
                      setViewState((prev) => {
                        const updatedViews = [...prev, newView];
                        return updatedViews;
                      });
                      createView(newView);
                      setIsLoading(true);
                    }}
                  >
                    <div>
                      <VscTable className="text-[#166EE1]" size={17} />
                    </div>
                    <span>Grid</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[7px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <PiCalendar className="text-[#D54401]" size={17} />
                    </div>
                    <span>Calendar</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[7px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <RiGalleryView2 className="text-[#7C37EF]" size={17} />
                    </div>
                    <span>Gallery</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[6px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <PiKanban className="text-[#048A0E]" size={17} />
                    </div>
                    <span>Kanban</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[6px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <PiKanban className="text-[#DC043B]" size={17} />
                    </div>
                    <span>Timeline</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[6px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <FaRegListAlt className="text-[#0D52AC]" size={17} />
                    </div>
                    <span>List</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-[6px] text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <FaChartGantt className="text-[#0D7F78]" size={17} />
                    </div>
                    <span>Gantt</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-2 text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    New section
                  </div>
                  <div className="border-b pb-3"></div>
                  <div className="flex cursor-pointer flex-row items-center justify-normal gap-2 rounded-[3px] px-2 py-2 text-[12.5px] font-[500] hover:bg-[#f2f2f2]">
                    <div>
                      <FaWpforms className="text-[#DD04A8]" size={17} />
                    </div>
                    <span>Form</span>
                  </div>
                </div>
              </div>
              {loadingColumnData ||
              loadingTablesData ||
              loadingBaseData ||
              loadingRowsData ||
              loadingCurrentView ||
              isLoading ? (
                <div className="flex grow flex-col items-center gap-2 pt-32">
                  <div
                    className="inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent text-gray-400"
                    role="status"
                    aria-label="loading"
                  ></div>
                  <span className="text-gray-500">Loading this view</span>
                </div>
              ) : (
                <div
                  className="relative w-full overflow-auto"
                  onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
                  ref={tableContainerRef}
                >
                  <Box
                    className="sticky top-0 z-10 table bg-transparent hover:bg-[#f7f7f7]"
                    w={table.getTotalSize() + 150}
                    key={tableId}
                  >
                    {table.getHeaderGroups().map((headerGroup) => (
                      <Box className="table-header-group" key={headerGroup.id}>
                        <Box className="table-cell w-14 border-y-[1.2px] border-l-[1.2px] border-black border-opacity-10 bg-[#f2f2f2] align-middle">
                          <input
                            id="select-all-checkbox"
                            type="checkbox"
                            value=""
                            checked={table.getIsAllRowsSelected()}
                            onChange={table.getToggleAllRowsSelectedHandler()}
                            className="border-gray ml-3 h-3 w-3 rounded bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                          />
                        </Box>
                        {headerGroup.headers.map((header) => (
                          <Box
                            className={`table-cell border-y-[1.2px] border-r-[1.2px] border-black border-opacity-10 text-start align-middle text-[13px] ${handleHighLightHeader(header)}`}
                            height="32px"
                            key={header.id}
                            style={{
                              minWidth: header.getSize(),
                            }}
                          >
                            <Box className="flex flex-row justify-between">
                              <Box className="flex flex-row items-center gap-2 pl-2">
                                {header.column.columnDef.meta && (
                                  <Box className="opacity-50">
                                    {getIconComponent(
                                      (header.column.columnDef.meta as MetaType)
                                        .icon ?? "",
                                    )}
                                  </Box>
                                )}
                                <Box className="text-[12.5px] opacity-80">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </Box>
                              </Box>
                              <Box className="flex cursor-pointer items-center rounded-full px-2 opacity-50">
                                <FaChevronDown size={12} />
                              </Box>
                            </Box>
                          </Box>
                        ))}
                        <Box
                          className="table-cell w-[94px] cursor-pointer border-[1.2px] border-black border-opacity-10 bg-[#f2f2f2] pl-9 align-middle hover:bg-opacity-20"
                          height={"32px"}
                          onContextMenu={() => console.log(rowsTemp)}
                          onClick={(e) => {
                            e.preventDefault();
                            if (e.button === 0) {
                              const isCloseToRight =
                                e.clientX >= innerWidth - 300;
                              console.log(isCloseToRight);
                              console.log(e.clientX);
                              console.log(innerWidth);
                              setMousePosition({
                                x: isCloseToRight ? e.clientX - 150 : e.clientX,
                                y: e.clientY,
                              });
                              setColumnPopUpOpen(true);
                            }
                          }}
                        >
                          <PiPlus size={18} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  <Box
                    className="relative bg-transparent"
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = rows[virtualRow.index];
                      return (
                        <Box
                          data-index={virtualRow.index}
                          className="group absolute table-row bg-[#f8f8f8]"
                          ref={(node: Element | null) =>
                            rowVirtualizer.measureElement(node)
                          }
                          key={row?.id}
                          onClick={() => {
                            closePopup();
                          }}
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <Box className="table-cell h-[32px] w-14 border-y-[1.1px] border-black border-opacity-10 bg-white px-[21px] text-start align-middle group-hover:bg-inherit">
                            <input
                              id="cell-checkbox"
                              type="checkbox"
                              checked={row!.getIsSelected()}
                              className="peer -ml-2 hidden h-3 w-3 rounded border-y-[1.1px] border-r-[1.1px] border-black border-opacity-20 bg-gray-100 text-blue-600 checked:flex group-hover:flex dark:border-gray-600 dark:bg-gray-700"
                              onChange={row!.getToggleSelectedHandler()}
                            />
                            <span className="-ml-2 text-[12px] opacity-50 group-hover:hidden peer-checked:hidden">
                              {virtualRow.index + 1}
                            </span>
                          </Box>
                          {row?.getVisibleCells().map((cell) => (
                            <Box
                              className={`border-black-4 table-cell border-y-[1.1px] border-r-[1.1px] border-black border-opacity-10 align-middle text-sm ${handleHighLightCell(cell)}`}
                              w={cell.column.getSize()}
                              height="32px"
                              key={cell.id}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Box>
                          ))}
                        </Box>
                      );
                    })}
                  </Box>
                  <div
                    className="flex h-[32px] cursor-pointer border bg-white text-black hover:bg-[#f2f2f2]"
                    style={{
                      width: table.getTotalSize() + 56,
                    }}
                    onClick={() => {
                      const uniqueCUID = cuid();
                      const createdRow = columns.reduce(
                        (acc, col) => {
                          const header = col.header;
                          acc[header as string] = "";
                          return acc;
                        },
                        { id: uniqueCUID } as Record<string, string>,
                      );
                      setRows((prevData) => [...prevData, createdRow]);
                      newRow({
                        tableId,
                        id: uniqueCUID,
                      });
                    }}
                  >
                    <div className="flex h-full w-[236px] items-center border-r pl-2">
                      <PiPlus size={17} />
                    </div>
                  </div>
                  <div
                    className="flex h-[32px] w-[149px] cursor-pointer items-center rounded-md bg-white text-red-500 hover:text-red-400"
                    onClick={() => {
                      add5k({ tableId });
                    }}
                  >
                    ADD 15K RECORDS
                  </div>
                  <PopUp
                    isOpen={isOpen}
                    setData={setRows}
                    x={mousePosition.x + 10}
                    y={mousePosition.y + 10}
                    record={popUpId}
                  />
                </div>
              )}
            </div>
          )}
          <TablePopUp
            isOpen={tableModalOpen}
            currentBase={currentBase as Base}
            tableState={currentTables}
            x={mousePosition.x}
            y={mousePosition.y}
            tableId={popUpId}
            baseId={baseId}
            setCurrentTableId={setTableId}
            setTableState={setTables}
            setModalOpen={setTableModalOpen}
          />
          <BasePopUp
            isOpen={baseModalOpen}
            currentBase={currentBase as Base}
            setBaseState={setCurrentBase}
            x={mousePosition.x}
            y={mousePosition.y}
            baseId={baseId}
            setModalOpen={setBaseModalOpen}
          />
          <ColumnPopUp
            isOpen={columnPopUp}
            tableId={tableId}
            columns={columns}
            setColState={setColumns}
            setRowState={setRows}
            x={mousePosition.x}
            y={mousePosition.y}
            setModalOpen={setColumnPopUpOpen}
          />
          <FilterPopUp
            columnsState={columns}
            isOpen={filterPopUpState}
            x={mousePosition.x}
            y={mousePosition.y}
            tableId={tableId}
            setViewState={setViewState}
            setModalOpen={setFilterPopUpState}
            viewState={viewsState}
            currentViewId={currentView!}
          />
          <SortPopUp
            viewState={viewsState}
            columns={columns}
            isOpen={sortPopUpState}
            x={mousePosition.x}
            y={mousePosition.y}
            tableId={tableId}
            setViewState={setViewState}
            setSortPopUpState={setSortPopUpState}
            currentViewId={currentView!}
          />
          <SearchPopUp
            searchState={searchState}
            setSearchState={setSearchState}
            rows={rowsTemp}
            isOpen={searchPopUpState}
            x={mousePosition.x}
            y={mousePosition.y}
            tableId={tableId}
            setSearchPopUpState={setSearchPopUpState}
          />
          <ViewPopUp
            currentViewId={currentView!}
            selectedViewId={selectedViewId}
            isOpen={viewPopUpModalOpen}
            baseId={baseId}
            tableId={tableId}
            setCurrentView={setCurrentView}
            setModalOpen={setViewPopUpModalOpen}
            setViewState={setViewState}
            viewState={viewsState}
            x={mousePosition.x}
            y={mousePosition.y}
          />
        </div>
      </main>
    </>
  );
};

export default ViewLayout;
