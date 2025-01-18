import type { ColumnDef } from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useEffect, useState } from "react";
import { PiPlus, PiTrash } from "react-icons/pi";
import { useDebounce } from "use-debounce";
import { FaChevronDown } from "react-icons/fa6";
import { api } from "~/utils/api";
import type { MetaType, ViewObj } from "~/helpers/types";
import { getIconComponent } from "~/helpers/getIconComponent";
type FilterType = {
  key: string;
  isNegative: boolean;
};

type FilterObjType = {
  field: string;
  key: string;
  value: string | null;
  id: string;
  isNegative: boolean;
  filterKey: string;
  columnType: string;
  type: string;
};

const filterTypesString: Record<string, FilterType> = {
  contains: {
    isNegative: false,
    key: "contains",
  },
  "not contains": {
    isNegative: true,
    key: "contains",
  },
  "is empty": {
    isNegative: false,
    key: "equals",
  },
  "is not empty": {
    isNegative: true,
    key: "equals",
  },
};

const filterTypeNumber: Record<string, FilterType> = {
  ">": {
    isNegative: false,
    key: "gt",
  },
  "<": {
    isNegative: false,
    key: "lt",
  },
};

const FilterModifierPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  setFilterModifierModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterState: React.Dispatch<React.SetStateAction<FilterObjType[]>>;
  currentFilter: FilterObjType;
}> = ({
  x,
  y,
  isOpen,
  setFilterModifierModalOpen,
  setFilterState,
  currentFilter,
}) => {
  const modifiers = ["and", "or"];
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-16 flex-col gap-0 rounded-sm bg-white text-sm shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {modifiers.map((key) => (
        <div
          className="text-custom cursor-pointer px-2 py-1 text-[13px] hover:bg-[#f2f2f2]"
          key={key}
          onClick={() => {
            setFilterModifierModalOpen(false);
            setFilterState((prev) => {
              const updatedFilter = {
                ...currentFilter,
                type: key,
              };
              const prevFilters = prev.filter(
                (filter) => filter.id !== currentFilter.id,
              );
              return [...prevFilters, updatedFilter];
            });
          }}
        >
          {key}
        </div>
      ))}
    </div>
  );
};

const FilterTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  setFilterTypeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterState: React.Dispatch<React.SetStateAction<FilterObjType[]>>;
  currentFilterObj: FilterObjType;
}> = ({
  x,
  y,
  isOpen,
  setFilterTypeModalOpen,
  setFilterState,
  currentFilterObj,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-[130px] flex-col gap-0 rounded-sm bg-white p-3 text-sm shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {currentFilterObj.columnType === "text" ? (
        <>
          {Object.entries(filterTypesString).map(([filterKey, filter]) => (
            <div
              className="cursor-pointer px-2 py-1 text-[13px] hover:bg-[#f2f2f2]"
              key={filterKey}
              onClick={() => {
                const { key, isNegative } = filter;
                console.log(key, isNegative);
                setFilterTypeModalOpen(false);
                setFilterState((prev) => {
                  const updatedFilter = {
                    ...currentFilterObj,
                    key,
                    filterKey,
                    isNegative,
                  };
                  const prevFilters = prev.filter(
                    (filter) => filter.id !== currentFilterObj.id,
                  );
                  return [...prevFilters, updatedFilter];
                });
              }}
            >
              {filterKey}
            </div>
          ))}
        </>
      ) : (
        <>
          {Object.entries(filterTypeNumber).map(([filterKey, filter]) => (
            <div
              className="cursor-pointer px-2 py-1 hover:bg-[#f2f2f2]"
              key={filterKey}
              onClick={() => {
                const { key, isNegative } = filter;
                console.log(key, isNegative);
                setFilterTypeModalOpen(false);
                setFilterState((prev) => {
                  const updatedFilter = {
                    ...currentFilterObj,
                    key,
                    filterKey,
                    isNegative,
                  };
                  const prevFilters = prev.filter(
                    (filter) => filter.id !== currentFilterObj.id,
                  );
                  return [...prevFilters, updatedFilter];
                });
              }}
            >
              {filterKey}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const FieldTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  columns: ColumnDef<Record<string, string>, string>[];
  setFilterState: React.Dispatch<React.SetStateAction<FilterObjType[]>>;
  currentFilter: FilterObjType;
  setFieldTypeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  x,
  y,
  isOpen,
  setFieldTypeModalOpen,
  setFilterState,
  columns,
  currentFilter,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-[170px] flex-col gap-0 rounded-sm bg-white p-3 text-[13px] shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {columns.map((col) => (
        <div
          className="flex cursor-pointer flex-row items-center gap-2 p-2 py-[6px] opacity-80 hover:bg-[#f2f2f2]"
          key={col.id}
          onClick={() => {
            const firstStringFilter = filterTypesString.contains;
            const firstNumberFilter = filterTypeNumber[">"];
            const colType = (col.meta as MetaType).type;
            console.log("current filter columntype:", currentFilter.columnType);
            console.log("chosen filter columnType:", colType);
            setFieldTypeModalOpen(false);
            setFilterState((prev) => {
              const updatedFilter = {
                ...currentFilter,
                field: col.header as string,
                columnType: colType,
                ...(currentFilter.columnType !== colType
                  ? colType === "text"
                    ? { filterKey: "contains", ...firstStringFilter }
                    : { filterKey: ">", ...firstNumberFilter }
                  : {}),
              };
              const prevFilters = prev.filter(
                (filter) => filter.id !== currentFilter.id,
              );
              return [...prevFilters, updatedFilter];
            });
          }}
        >
          <div id="icon-container">
            {getIconComponent((col.meta as MetaType).icon, 15)}
          </div>
          <span>{col.header as string}</span>
        </div>
      ))}
    </div>
  );
};

export const FilterPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  tableId: string;
  setViewState: React.Dispatch<React.SetStateAction<ViewObj[]>>;
  viewState: ViewObj[];
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  columnsState: ColumnDef<Record<string, string>, string>[];
  currentViewId: string;
}> = ({
  x,
  y,
  isOpen,
  viewState,
  columnsState,
  currentViewId,
  setModalOpen,
  setViewState,
}) => {
  const [filterTypeModal, setFilterTypeModal] = useState<boolean>(false);
  const [fieldTypeModal, setFieldTypeModal] = useState<boolean>(false);
  const [filterModifierModal, setFilterModifierModal] =
    useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { mutate: updateView } = api.views.update.useMutation();
  const inputDisabled = (key: string) =>
    key === "is empty" || key === "is not empty";
  const [currentChosenFilter, setCurrentFilter] = useState<FilterObjType>();
  const [filters, setFilters] = useState<FilterObjType[]>([]);
  const [debouncedFilter] = useDebounce(filters, 400);
  const isDisabled = () => filters.length > 2;
  useEffect(() => {
    const currentView = viewState.find((view) => view.id === currentViewId);
    if (currentView) {
      setFilters(currentView.filterState as FilterObjType[]);
    }
  }, [viewState, currentViewId]);
  useEffect(() => {
    setViewState((prev) => {
      return prev.map(
        (view) =>
          view.id === currentViewId
            ? ({
                ...view,
                filterState: debouncedFilter,
              } as ViewObj)
            : view, // Keep other views unchanged
      );
    });
    if (currentViewId) {
      updateView({ id: currentViewId, filters: debouncedFilter });
    }
  }, [debouncedFilter, setViewState, updateView]);
  // useEffect(() => {
  //   setFilterState()
  // }, [debouncedInput])
  if (!isOpen) return null;

  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
        setFilterTypeModal(false);
        setFieldTypeModal(false);
      }}
    >
      <div
        className={`fixed z-20 flex h-auto flex-col rounded-md border bg-white px-2 shadow-lg ${filters.length > 0 ? "w-[590px]" : "w-[300px]"}`}
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <div className="m-3 flex flex-col gap-4 text-[13px]">
          {filters.length > 0 ? (
            <span className="text-[13px] text-gray-500">
              In this view, show records
            </span>
          ) : (
            <span className="text-[13px] text-gray-500">
              No filter conditions applied
            </span>
          )}
          <div className="flex flex-col gap-2">
            {filters.map((filterObj) => (
              <>
                <div
                  className="flex w-[558px] flex-row items-center gap-0 pl-2 text-[13px] opacity-70"
                  key={filterObj.id}
                >
                  {filterObj.type !== "neutral" ? (
                    <button
                      className={`mr-2 flex h-[30px] w-[60px] items-center justify-between border px-2 ${isDisabled() ? "cursor-default" : "cursor-pointer hover:bg-[#f2f2f2]"}`}
                      disabled={isDisabled()}
                      onClick={(e) => {
                        const element = e.currentTarget;
                        const rect = element.getBoundingClientRect();
                        setCurrentFilter(filterObj);
                        setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                        setFilterModifierModal(true);
                        setCurrentFilter(filterObj);
                      }}
                    >
                      <span>{filterObj.type}</span>
                      {!isDisabled() && (
                        <div id="icon-container">
                          <FaChevronDown size={12} />
                        </div>
                      )}
                    </button>
                  ) : (
                    <span className="mr-2 w-[60px] text-start">Where</span>
                  )}
                  <div
                    className="flex h-[30px] w-[120px] cursor-pointer flex-row items-center justify-between border-[1px] px-2 hover:bg-[#f2f2f2]"
                    onClick={(e) => {
                      setFieldTypeModal(true);
                      const element = e.currentTarget;
                      const rect = element.getBoundingClientRect();
                      setCurrentFilter(filterObj);
                      setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                    }}
                  >
                    <span>{filterObj.field}</span>
                    <div id="icon-container">
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                  <div
                    className={`flex h-[30px] w-[100px] cursor-pointer flex-row items-center justify-between border-[1px] px-2 hover:bg-[#f2f2f2]`}
                    onClick={(e) => {
                      setFilterTypeModal(true);
                      const element = e.currentTarget;
                      const rect = element.getBoundingClientRect();
                      setCurrentFilter(filterObj);
                      setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                    }}
                  >
                    <span>{filterObj.filterKey}</span>
                    <div id="icon-container">
                      <FaChevronDown size={12} />
                    </div>
                  </div>
                  <input
                    type={filterObj.columnType}
                    placeholder={
                      inputDisabled(filterObj.filterKey) ? "" : "type something"
                    }
                    className="h-[30px] border px-2 outline-none"
                    value={filterObj.value ?? ""}
                    onChange={(e) => {
                      setFilters((prev) => {
                        const filteredFilterState = prev.filter(
                          (filter) => filter.id !== filterObj.id,
                        );
                        const newFilter = {
                          ...filterObj,
                          value: e.target.value,
                        };
                        return [...filteredFilterState, newFilter];
                      });
                    }}
                    disabled={inputDisabled(filterObj.filterKey)}
                  />
                  <div
                    className="flex h-[30px] cursor-pointer items-center border p-1 hover:bg-[#f2f2f2]"
                    onClick={() => {
                      setFilters((prev) => {
                        const filteredFilterState = prev.filter(
                          (filter) => filter.id !== filterObj.id,
                        );
                        if (filterObj.type === "neutral") {
                          return filteredFilterState.map((view, index) =>
                            index === 0 ? { ...view, type: "neutral" } : view,
                          );
                        }
                        return filteredFilterState;
                      });
                    }}
                  >
                    <PiTrash size={15} />
                  </div>
                </div>
              </>
            ))}
          </div>
          <div className="flex flex-row items-center gap-4 font-semibold text-slate-700 opacity-75">
            <div
              className="flex cursor-pointer flex-row items-center gap-1 hover:text-blue-500"
              onClick={() => {
                const uniqueId = cuid();
                let newFilterType = "neutral";
                if (filters.length === 1) {
                  newFilterType = "or";
                } else if (filters.length >= 2) {
                  newFilterType = filters[1]?.type ?? "or";
                }
                setFilters((prev) => {
                  const newFilter: FilterObjType = {
                    field: "Name",
                    key: "contains",
                    filterKey: "contains",
                    value: "",
                    isNegative: false,
                    type: newFilterType,
                    columnType: "text",
                    id: uniqueId,
                  };
                  return [...prev, newFilter];
                });
              }}
            >
              <div id="icon-container">
                <PiPlus size={12} />
              </div>
              <span className="text-[13px]">Add condition</span>
            </div>
            <div className="flex cursor-pointer flex-row items-center gap-1 hover:text-blue-500">
              <div id="icon-container">
                <PiPlus size={12} />
              </div>
              <span className="text-[13px]">Add condition group</span>
            </div>
          </div>
        </div>
      </div>
      <OutsideClick onOutsideClick={() => setFilterModifierModal(false)}>
        <FilterModifierPopUp
          currentFilter={currentChosenFilter!}
          isOpen={filterModifierModal}
          setFilterState={setFilters}
          setFilterModifierModalOpen={setFilterModifierModal}
          x={mousePosition.x}
          y={mousePosition.y}
        />
      </OutsideClick>
      <OutsideClick onOutsideClick={() => setFilterTypeModal(false)}>
        <FilterTypePopUp
          currentFilterObj={currentChosenFilter!}
          isOpen={filterTypeModal}
          setFilterState={setFilters}
          setFilterTypeModalOpen={setFilterTypeModal}
          x={mousePosition.x}
          y={mousePosition.y}
        />
      </OutsideClick>
      <OutsideClick onOutsideClick={() => setFieldTypeModal(false)}>
        <FieldTypePopUp
          currentFilter={currentChosenFilter!}
          setFilterState={setFilters}
          columns={columnsState}
          isOpen={fieldTypeModal}
          setFieldTypeModalOpen={setFieldTypeModal}
          x={mousePosition.x}
          y={mousePosition.y}
        />
      </OutsideClick>
    </OutsideClick>
  );
};
