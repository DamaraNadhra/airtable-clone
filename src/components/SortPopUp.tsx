import type { Column, View } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useEffect, useState } from "react";
import { PiPlus } from "react-icons/pi";
import type { MetaType, SortObject, ViewObj } from "~/helpers/types";
import { api } from "~/utils/api";
import { RxCross1 } from "react-icons/rx";
import { FaChevronDown } from "react-icons/fa6";
import {
  getIconComponent,
  NumberOrder,
  StringOrder,
} from "~/helpers/getIconComponent";
import toast from "react-hot-toast";
import { MdArrowRightAlt } from "react-icons/md";

const NewSorterPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  columns: ColumnDef<Record<string, string>, string>[];
  setFieldPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  sorters: SortObject[];
  setSortState: React.Dispatch<React.SetStateAction<SortObject[]>>;
}> = ({ x, y, isOpen, setSortState, columns, setFieldPopUp, sorters }) => {
  const filteredColumns = columns.filter(
    (col) => !sorters.some((sorter) => sorter.field === col.header),
  );
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-[300px] flex-col gap-0 rounded-md border bg-white py-3 pl-3 text-[12px] shadow-lg"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div className="flex flex-col gap-0 opacity-90">
        {filteredColumns.map((col) => (
          <div
            className="flex cursor-pointer flex-row items-center gap-2 rounded-md py-1 pl-2 hover:bg-[#f2f2f2]"
            key={col.id}
            onClick={() => {
              const uniqueCUID = cuid();
              const columnMeta: MetaType = col.meta as MetaType;
              const newSorter: SortObject = {
                field: col.header as string,
                id: uniqueCUID,
                order: "asc",
                type: columnMeta.type,
              };
              setFieldPopUp(false);
              setSortState((prev) => [...prev, newSorter]);
            }}
          >
            <div id="icon-container" className="text-gray-600 opacity-90">
              {getIconComponent((col.meta as MetaType).icon, 16)}
            </div>
            <span className="text-[13px]">{col.header as string}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const FieldTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  columns: ColumnDef<Record<string, string>, string>[];
  setFieldPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  sorters: SortObject[];
  setSortState: React.Dispatch<React.SetStateAction<SortObject[]>>;
  currentSortObj: SortObject;
}> = ({
  x,
  y,
  isOpen,
  setSortState,
  columns,
  setFieldPopUp,
  sorters,
  currentSortObj,
}) => {
  const filteredColumns = columns.filter(
    (col) => !sorters.some((sorter) => sorter.field === col.header),
  );
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-[130px] flex-col gap-0 rounded-sm bg-white p-3 text-[13px] shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {filteredColumns.map((col) => (
        <div
          className="flex cursor-pointer flex-row items-center gap-3 px-2 py-1 opacity-85 hover:bg-[#f2f2f2]"
          key={col.id}
          onClick={() => {
            setFieldPopUp(false);
            const colMeta = col.meta as MetaType;
            setSortState((prev) => {
              const updatedSort: SortObject = {
                ...currentSortObj,
                field: col.header as string,
                type: colMeta.type,
              };
              const prevFilters = prev.filter(
                (filter) => filter.id !== currentSortObj.id,
              );
              return [...prevFilters, updatedSort];
            });
          }}
        >
          <div id="">{getIconComponent((col.meta as MetaType).icon, 14)}</div>
          <span>{col.header as string}</span>
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
          {currentSortObj.type === "text" ? (
            <StringOrder order={ord} />
          ) : (
            <NumberOrder order={ord} />
          )}
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
  columns: ColumnDef<Record<string, string>, string>[];
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
  const [newSorterFieldChooser, setNewSorterFieldChooserState] =
    useState<boolean>(false);
  const filteredColumns = columns.filter(
    (col) => !sortState.some((sorter) => sorter.field === col.header),
  );
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
  }, [sortState, setViewState, updateView]);
  if (!isOpen) return null;
  if (sortState.length > 0) {
    return (
      <OutsideClick onOutsideClick={() => setSortPopUpState(false)}>
        <div
          className="fixed z-20 flex w-[360px] flex-col gap-0 rounded-md border bg-white p-3 text-[12px] shadow-lg"
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
                  {sortObj.type === "text" ? (
                    <StringOrder order={sortObj.order} />
                  ) : (
                    <NumberOrder order={sortObj.order} />
                  )}
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
                    console.log(columns);
                  }}
                >
                  <RxCross1 size={14} className="text-gray-600" />
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-3 flex w-24 cursor-pointer flex-row items-center gap-4 text-gray-600 hover:text-black disabled:cursor-default disabled:opacity-50"
            onClick={(e) => {
              const element = e.currentTarget;
              const rect = element.getBoundingClientRect();
              setMousePosition({ x: rect.left, y: rect.bottom + 5 });
              setNewSorterFieldChooserState(true);
            }}
            disabled={filteredColumns.length === 0}
          >
            <div id="icon-container">
              <PiPlus size={14} />
            </div>
            <span>Add sorter</span>
          </button>
          <OutsideClick onOutsideClick={() => setFieldTypePopUpState(false)}>
            <FieldTypePopUp
              x={mousePosition.x}
              y={mousePosition.y}
              isOpen={fieldTypePopUpState}
              sorters={sortState}
              columns={columns}
              setFieldPopUp={setFieldTypePopUpState}
              setSortState={setSortState}
              currentSortObj={currentSortObj!}
            />
          </OutsideClick>
          <OutsideClick onOutsideClick={() => setFieldTypePopUpState(false)}>
            <NewSorterPopUp
              x={mousePosition.x}
              y={mousePosition.y}
              isOpen={newSorterFieldChooser}
              sorters={sortState}
              columns={columns}
              setFieldPopUp={setNewSorterFieldChooserState}
              setSortState={setSortState}
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
        className="fixed z-20 flex w-[300px] flex-col gap-0 rounded-md border bg-white py-3 pl-3 text-[12px] shadow-lg"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <span className="pl-2 font-semibold text-gray-600 opacity-85">
          Sort by
        </span>
        <div className="mx-2 mb-2 mr-3 border-b pt-2"></div>
        <div className="flex flex-col gap-0 opacity-90">
          {columns.map((col) => (
            <div
              className="flex cursor-pointer flex-row items-center gap-2 rounded-md py-1 pl-2 hover:bg-[#f2f2f2]"
              key={col.id}
              onClick={() => {
                const uniqueCUID = cuid();
                const columnMeta: MetaType = col.meta as MetaType;
                const newSorter: SortObject = {
                  field: col.header as string,
                  id: uniqueCUID,
                  order: "asc",
                  type: columnMeta.type,
                };
                setSortState((prev) => [...prev, newSorter]);
              }}
            >
              <div id="icon-container" className="text-gray-600 opacity-90">
                {getIconComponent((col.meta as MetaType).icon, 16)}
              </div>
              <span className="text-[13px]">{col.header as string}</span>
            </div>
          ))}
        </div>
      </div>
    </OutsideClick>
  );
};
