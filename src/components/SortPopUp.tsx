import type { Column, View } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useEffect, useState } from "react";
import { PiPlus } from "react-icons/pi";
import type { SortObject, ViewObj } from "~/helpers/types";
import { api } from "~/utils/api";
import { RxCross1 } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import { getIconComponent } from "~/helpers/getIconComponent";

const FieldTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  columns: Column[];
  setFieldPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setSortState: React.Dispatch<React.SetStateAction<SortObject[]>>;
  currentSortObj: SortObject;
}> = ({
  x,
  y,
  isOpen,
  setSortState,
  columns,
  setFieldPopUp,
  currentSortObj,
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
            setFieldPopUp(false);
            setSortState((prev) => {
              const updatedSort: SortObject = {
                ...currentSortObj,
                field: col.name,
                type: col.type,
              };
              const prevFilters = prev.filter(
                (filter) => filter.id !== currentSortObj.id,
              );
              return [...prevFilters, updatedSort];
            });
          }}
        >
          {col.name}
        </div>
      ))}
    </div>
  );
};
const OrderTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  setOrderPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setSortState: React.Dispatch<React.SetStateAction<SortObject[]>>;
  currentSortObj: SortObject;
}> = ({ x, y, isOpen, setSortState, setOrderPopUp, currentSortObj }) => {
  const order = ["asc", "desc"];
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-[130px] flex-col gap-0 rounded-sm bg-white p-3 text-[13px] shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {order.map((ord) => (
        <div
          className="cursor-pointer px-2 py-1 hover:bg-[#f2f2f2]"
          key={ord}
          onClick={() => {
            setOrderPopUp(false);
            setSortState((prev) => {
              const updatedSort: SortObject = {
                ...currentSortObj,
                order: ord,
              };
              const prevFilters = prev.filter(
                (filter) => filter.id !== currentSortObj.id,
              );
              return [...prevFilters, updatedSort];
            });
          }}
        >
          {ord == "asc" ? "A-Z" : "Z-A"}
        </div>
      ))}
    </div>
  );
};

export const SortPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  tableId: string;
  viewState: ViewObj[];
  setViewState: React.Dispatch<React.SetStateAction<ViewObj[]>>;
  setSortPopUpState: React.Dispatch<React.SetStateAction<boolean>>;
  currentViewId: string;
  columns: Column[];
}> = ({
  x,
  y,
  tableId,
  columns,
  isOpen,
  setSortPopUpState,
  currentViewId,
  setViewState,
  viewState,
}) => {
  const [fieldTypePopUpState, setFieldTypePopUpState] =
    useState<boolean>(false);
  const [orderTypePopUpState, setOrderTypePopUpState] =
    useState<boolean>(false);
  const [currentSortObj, setCurrentSortObj] = useState<SortObject>();
  const [sortState, setSortState] = useState<SortObject[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { mutate: updateView } = api.views.update.useMutation();
  useEffect(() => {
    const currentView = viewState.find((view) => view.id === currentViewId);
    if (currentView) {
      setSortState(currentView.sorterState as SortObject[]);
    }
  }, [viewState, currentViewId]);
  useEffect(() => {
    setViewState((prev) => {
      return prev.map(
        (view) =>
          view.id === currentViewId
            ? { ...view, sorterState: sortState } // Create a new object for the updated view
            : view, // Keep other views unchanged
      );
    });
    if (currentViewId) {
      updateView({ id: currentViewId, sorters: sortState });
    }
  }, [sortState]);
  if (!isOpen) return null;
  if (sortState.length > 0) {
    return (
      <OutsideClick onOutsideClick={() => setSortPopUpState(false)}>
        <div
          className="fixed z-20 flex w-[360px] flex-col gap-0 rounded-sm bg-white p-3 text-[12px] shadow-md"
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          <span className="font-semibold text-gray-600">Sort by</span>
          <div className="mb-2 border-b pt-2"></div>
          <div className="flex flex-col gap-2">
            {sortState.map((sortObj) => (
              <div
                className="flex flex-row items-center gap-2"
                key={sortObj.id}
              >
                <span
                  className="flex w-44 cursor-pointer flex-row items-center justify-between border py-1 pl-2 hover:bg-[#f2f2f2]"
                  onClick={(e) => {
                    const element = e.currentTarget;
                    const rect = element.getBoundingClientRect();
                    setCurrentSortObj(sortObj);
                    setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                    setFieldTypePopUpState(true);
                  }}
                >
                  <span>{sortObj.field}</span>
                  <div className="pr-3">
                    <FaChevronDown size={12} />
                  </div>
                </span>
                <span
                  className="flex w-28 cursor-pointer flex-row items-center justify-between border py-1 pl-3 hover:bg-[#f2f2f2]"
                  onClick={(e) => {
                    const element = e.currentTarget;
                    const rect = element.getBoundingClientRect();
                    setCurrentSortObj(sortObj);
                    setMousePosition({ x: rect.left, y: rect.bottom + 5 });
                    setOrderTypePopUpState(true);
                  }}
                >
                  {sortObj.order === "asc" ? "A-Z" : "Z-A"}
                  <div className="pr-3">
                    <FaChevronDown size={12} />
                  </div>
                </span>
                <div
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm hover:bg-[#f2f2f2]"
                  onClick={() => {
                    const updatedSortState = sortState.filter(
                      (filter) => filter.id !== sortObj.id,
                    );
                    setSortState(updatedSortState);
                  }}
                >
                  <RxCross1 size={14} className="text-gray-600" />
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-3 flex cursor-pointer flex-row items-center gap-4 text-gray-600 hover:text-black"
            onClick={() => {
              const uniqueCUID = cuid();
              const newSorter: SortObject = {
                field: columns[0]!.name,
                id: uniqueCUID,
                order: "asc",
                type: columns[0]!.type,
              };
              setSortState((prev) => [...prev, newSorter]);
            }}
          >
            <div id="icon-container">
              <PiPlus size={14} />
            </div>
            <span>Add sorter</span>
          </div>
          <OutsideClick onOutsideClick={() => setFieldTypePopUpState(false)}>
            <FieldTypePopUp
              x={mousePosition.x}
              y={mousePosition.y}
              isOpen={fieldTypePopUpState}
              columns={columns}
              setFieldPopUp={setFieldTypePopUpState}
              setSortState={setSortState}
              currentSortObj={currentSortObj!}
            />
          </OutsideClick>
          <OutsideClick onOutsideClick={() => setOrderTypePopUpState(false)}>
            <OrderTypePopUp
              x={mousePosition.x}
              y={mousePosition.y}
              isOpen={orderTypePopUpState}
              setOrderPopUp={setOrderTypePopUpState}
              setSortState={setSortState}
              currentSortObj={currentSortObj!}
            />
          </OutsideClick>
        </div>
      </OutsideClick>
    );
  }
  return (
    <OutsideClick onOutsideClick={() => setSortPopUpState(false)}>
      <div
        className="fixed z-20 flex w-[300px] flex-col gap-0 rounded-md border bg-white p-3 pl-5 text-[12px] shadow-lg"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <span className="font-semibold text-gray-600">Sort by</span>
        <div className="mb-2 border-b pt-2"></div>
        <div className="flex flex-col gap-1 opacity-85">
          {columns.map((col) => (
            <div
              className="flex cursor-pointer flex-row items-center gap-2 rounded-md py-1 hover:bg-[#f2f2f2]"
              key={col.id}
              onClick={() => {
                const uniqueCUID = cuid();
                const newSorter: SortObject = {
                  field: columns[0]!.name,
                  id: uniqueCUID,
                  order: "asc",
                  type: columns[0]!.type,
                };
                setSortState((prev) => [...prev, newSorter]);
              }}
            >
              <div id="icon-container">{getIconComponent(col.icon, 16)}</div>
              <span className="text-[12.5px]">{col.name}</span>
            </div>
          ))}
        </div>
      </div>
    </OutsideClick>
  );
};
