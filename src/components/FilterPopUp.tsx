import type { ColumnDef } from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useEffect, useState } from "react";
import { PiPlus } from "react-icons/pi";
import { useDebounce } from "use-debounce";
import { FaChevronDown, FaRegTrashCan } from "react-icons/fa6";
import type { Column, View } from "@prisma/client";
import { api } from "~/utils/api";
type FilterType = {
  key: string;
  isNegative: boolean;
};

type ViewObj =
  | {
      id: string;
      name: string;
      filterState?: Record<string, string>[];
      sorterState?: Record<string, string>[];
      tableId: string;
    }
  | View;

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

const filterTypes: Record<string, FilterType> = {
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
          className="text-custom cursor-pointer px-2 py-1 hover:bg-[#f2f2f2]"
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
      {Object.entries(filterTypes).map(([filterKey, filter]) => (
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
    </div>
  );
};

const FieldTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  columns: Column[];
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
      className="fixed z-20 flex w-[130px] flex-col gap-0 rounded-sm bg-white p-3 text-[13px] shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {columns.map((col) => (
        <div
          className="cursor-pointer px-2 py-1 hover:bg-[#f2f2f2]"
          key={col.id}
          onClick={() => {
            setFieldTypeModalOpen(false);
            setFilterState((prev) => {
              const updatedFilter = {
                ...currentFilter,
                field: col.name,
                columnType: col.type,
              };
              const prevFilters = prev.filter(
                (filter) => filter.id !== currentFilter.id,
              );
              return [...prevFilters, updatedFilter];
            });
          }}
        >
          {col.name}
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
  columnsState: Column[];
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
                filterState: filters,
              } as ViewObj)
            : view, // Keep other views unchanged
      );
    });
    if (currentViewId) {
      updateView({ id: currentViewId, filters });
    }
  }, [filters]);
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
        className={`fixed z-20 flex h-auto flex-col rounded-md border-2 bg-white shadow-md ${filters.length > 0 ? "w-[590px]" : "w-[300px]"}`}
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
          <div className="flex flex-col items-center gap-2">
            {filters.map((filterObj) => (
              <>
                <div
                  className="flex flex-row items-center gap-0"
                  key={filterObj.id}
                >
                  {filterObj.type !== "neutral" ? (
                    <div
                      className="mr-2 flex h-[30px] w-[50px] cursor-pointer items-center justify-between border px-2 hover:bg-[#f2f2f2]"
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
                      <div id="icon-container">
                        <FaChevronDown size={12} />
                      </div>
                    </div>
                  ) : (
                    <span className="w-[60px] text-center">Where</span>
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
                    className="flex h-[30px] w-[100px] cursor-pointer flex-row items-center justify-between border-[1px] px-2 hover:bg-[#f2f2f2]"
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
                    type="text"
                    placeholder={
                      inputDisabled(filterObj.key) ? "" : "type something"
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
                    disabled={inputDisabled(filterObj.key)}
                  />
                  <div
                    className="flex h-[30px] cursor-pointer items-center border p-1 hover:bg-[#f2f2f2]"
                    onClick={() => {
                      setFilters((prev) =>
                        prev.filter((obj) => obj.id !== filterObj.id),
                      );
                    }}
                  >
                    <FaRegTrashCan size={15} />
                  </div>
                </div>
              </>
            ))}
          </div>
          <div
            className="flex cursor-pointer flex-row items-center gap-3 hover:text-blue-500"
            onClick={() => {
              const uniqueId = cuid();
              setFilters((prev) => {
                const newFilter: FilterObjType = {
                  field: "Name",
                  key: "not",
                  filterKey: "contains",
                  value: null,
                  isNegative: true,
                  type: filters.length > 0 ? "or" : "neutral",
                  columnType: "string",
                  id: uniqueId,
                };
                return [...prev, newFilter];
              });
            }}
          >
            <div id="icon-container">
              <PiPlus size={12} />
            </div>
            <span>Add condition</span>
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
