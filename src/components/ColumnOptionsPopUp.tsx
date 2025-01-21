import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { OutsideClick } from "outsideclick-react";
import {  BsEyeSlash } from "react-icons/bs";
import { IoFilterOutline } from "react-icons/io5";
import {
  PiArrowLeft,
  PiArrowRight,
  PiCopy,
  PiEnvelopeSimple,
  PiFadersHorizontal,
  PiPencilSimple,
  PiPlus,
  PiSortAscending,
  PiSortDescending,
  PiTrash,
} from "react-icons/pi";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { HiOutlineLockClosed } from "react-icons/hi";
import { FaRegListAlt } from "react-icons/fa";
import type { ColumnDef } from "@tanstack/react-table";
import type { FilterObj, MetaType, SortObject, ViewObj } from "~/helpers/types";
import cuid from "cuid";
import { NumberOrder, StringOrder } from "~/helpers/getIconComponent";
export const ColumnOptionsPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  currentColId: string;
  baseId: string;
  columnsState: ColumnDef<Record<string, string>, string>[];
  setRowState: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setColumnState: React.Dispatch<
    React.SetStateAction<ColumnDef<Record<string, string>, string>[]>
  >;
  currentViewId: string;
  sorters: SortObject[];
  filters: FilterObj[];
  setViewState: React.Dispatch<React.SetStateAction<ViewObj[]>>;
}> = ({
  x,
  y,
  isOpen,
  setRowState,
  setModalOpen,
  setColumnState,
  sorters,
  columnsState,
  currentColId,
  filters,
  setViewState,
  currentViewId,
}) => {
  const [renameModalOpen, setRenameModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");

  const { mutate: renameColumn } = api.columns.update.useMutation();
  const selectedColumn = columnsState.find((col) => col.id === currentColId);
  useEffect(() => {
    if (selectedColumn) {
      setNewName(selectedColumn.header as string);
    }
  }, [selectedColumn]);

  const { mutate: delCol } = api.columns.delete.useMutation();
  if (!isOpen) return null;

  if (renameModalOpen) {
    return (
      <OutsideClick
        onOutsideClick={() => {
          setRenameModal(false);
          setModalOpen(false);
        }}
      >
        <div
          className="fixed z-50 flex h-[211px] w-[320px] flex-col gap-3 rounded-md border-2 bg-white p-4 shadow-md"
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          <input
            type="text"
            placeholder="type something"
            className="mt-1 h-[37px] rounded-[4px] py-2 pl-2 text-[14px] outline-none ring-[1.5px] ring-blue-600"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <span className="mt-2 text-sm text-gray-800 text-opacity-70">
            What should each record be called?
          </span>
          <div className="cursor-pointer rounded-md bg-[#f1f4f8] bg-opacity-80 py-[8px] pl-2 text-[13px] text-gray-800 text-opacity-80 hover:bg-opacity-100">
            Record
          </div>
          <div className="flex flex-row gap-4 text-[11px] font-[300] text-gray-900 text-opacity-60">
            <span>Examples:</span>
            <span className="flex flex-row items-center gap-1">
              <div className="icon-container">
                <PiPlus size={16} />
              </div>
              <span>Add record</span>
            </span>
            <span className="flex flex-row items-center gap-1">
              <div className="icon-container">
                <PiEnvelopeSimple size={16} />
              </div>
              <span>Send records</span>
            </span>
          </div>
          <div className="flex flex-row items-center justify-end gap-3 text-[13px]">
            <span
              className="cursor-pointer rounded-md p-1 py-[5px] text-gray-800 text-opacity-90 hover:bg-[#f2f2f2]"
              onClick={() => {
                setModalOpen(false);
                setRenameModal(false);
              }}
            >
              Cancel
            </span>
            <span
              className="flex cursor-pointer items-center rounded-md bg-[#166ee1] p-1 px-2 py-[5px] font-semibold text-white"
              onClick={() => {
                renameColumn({ columnId: currentColId, newName });
              }}
            >
              Save
            </span>
          </div>
        </div>
      </OutsideClick>
    );
  }
  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
      }}
    >
      <div
        className="fixed z-50 flex h-auto w-[320px] flex-col rounded-md border border-[1.5] border-black border-opacity-20 bg-white p-3 shadow-lg"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiPencilSimple size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Edit field
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiCopy size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Duplicate field
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiArrowLeft size={16} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Insert left
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiArrowRight size={16} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Insert right
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiPencilSimple size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Copy field URL
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <AiOutlineInfoCircle size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Edit field description
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-70">
            <HiOutlineLockClosed size={16} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Edit field permissions
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span
          className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]"
          onClick={() => {
            const uniqueCUID = cuid();
            const columnMeta = selectedColumn?.meta as MetaType;
            const newSorter: SortObject = {
              field: selectedColumn?.header as string,
              id: uniqueCUID,
              order: "asc",
              type: columnMeta.type,
            };
            setViewState((prev) =>
              prev.map((view) =>
                view.id === currentViewId
                  ? { ...view, sorterState: [...sorters, newSorter] }
                  : view,
              ),
            );
          }}
        >
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiSortAscending size={15} />
          </div>
          <span className="flex flex-row items-center gap-2 text-[13px] text-gray-900 text-opacity-90">
            <span>Sort</span>
            {(selectedColumn?.meta as MetaType).type === "text" ? (
              <StringOrder order="asc" />
            ) : (
              <NumberOrder order="asc" />
            )}
          </span>
        </span>
        <span
          className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]"
          onClick={() => {
            const uniqueCUID = cuid();
            const columnMeta = selectedColumn?.meta as MetaType;
            const newSorter: SortObject = {
              field: selectedColumn?.header as string,
              id: uniqueCUID,
              order: "desc",
              type: columnMeta.type,
            };
            setViewState((prev) =>
              prev.map((view) =>
                view.id === currentViewId
                  ? { ...view, sorterState: [...sorters, newSorter] }
                  : view,
              ),
            );
          }}
        >
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiSortDescending size={15} />
          </div>
          <span className="flex flex-row items-center gap-2 text-[13px] text-gray-900 text-opacity-90">
            <span>Sort</span>
            {(selectedColumn?.meta as MetaType).type === "text" ? (
              <StringOrder order="desc" />
            ) : (
              <NumberOrder order="desc" />
            )}
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span
          className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]"
          onClick={() => {
            const uniqueId = cuid();
            let newFilterType = "neutral";
            if (filters.length === 1) {
              newFilterType = "or";
            } else if (filters.length >= 2) {
              newFilterType = filters[1]?.type ?? "or";
            }
            const colType = (selectedColumn?.meta as MetaType).type;
            setViewState((prev) => {
              const newFilter: FilterObj = {
                field: selectedColumn?.header as string,
                key: colType === "text" ? "contains" : "gt",
                filterKey: colType === "text" ? "contains" : ">",
                value: colType === "text" ? "" : "0",
                isNegative: false,
                type: newFilterType,
                columnType: colType,
                id: uniqueId,
              };
              const updatedViews = prev.map((view) =>
                view.id === currentViewId
                  ? { ...view, filterState: [...filters, newFilter] }
                  : view,
              );
              return updatedViews;
            });
            setModalOpen(false);
          }}
        >
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <IoFilterOutline size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Filter by this field
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <FaRegListAlt size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Group by this field
          </span>
        </span>
        <div className="flex flex-row items-center justify-between">
          <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
            <div id="icon-container" className="text-gray-800 text-opacity-70">
              <PiFadersHorizontal size={14} />
            </div>
            <span className="text-[13px] text-gray-900 text-opacity-90">
              Show dependencies
            </span>
          </span>
          <span className="rounded-full bg-[#beecfe] px-2 py-[1px] text-[11px] text-[#0068a0]">
            Business
          </span>
        </div>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <BsEyeSlash size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Hide field
          </span>
        </span>
        <span
          className="flex cursor-pointer flex-row items-center gap-3 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]"
          onClick={() => {
            setColumnState((prev) =>
              prev.filter((fil) => fil.id !== currentColId),
            );
            setRowState((prev) =>
              prev.map((row) => {
                delete row[selectedColumn?.header as string];
                return row;
              }),
            );
            delCol({ columnId: currentColId });
            setModalOpen(false);
          }}
        >
          <div id="icon-container" className="text-gray-800 text-opacity-70">
            <PiTrash size={16} />
          </div>
          <span className="text-[13px] text-red-500 text-opacity-95">
            Delete field
          </span>
        </span>
      </div>
    </OutsideClick>
  );
};
