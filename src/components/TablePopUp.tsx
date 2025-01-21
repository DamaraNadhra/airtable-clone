import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { OutsideClick } from "outsideclick-react";
import type { Base, Table } from "@prisma/client";
import { FiArrowUpCircle } from "react-icons/fi";
import { BsEyeSlash } from "react-icons/bs";
import { IoChevronForward } from "react-icons/io5";
import {
  PiCopy,
  PiEnvelopeSimple,
  PiFadersHorizontal,
  PiPencilSimple,
  PiPlus,
  PiTrash,
} from "react-icons/pi";
import { LuChartGantt } from "react-icons/lu";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { HiOutlineLockClosed } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
export const TablePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  tableId: string;
  baseId: string;
  setTableState: React.Dispatch<React.SetStateAction<Table[]>>;
  currentBase: Base;
  tableState: Table[];
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTableId: React.Dispatch<React.SetStateAction<string>>;
}> = ({
  x,
  y,
  isOpen,
  tableId,
  baseId,
  tableState,
  currentBase,
  setModalOpen,
  setTableState,
  setCurrentTableId,
}) => {
  const router = useRouter();
  const [renameModalOpen, setRenameModal] = useState<boolean>(false);
  const { data: selectedTable } = api.table.getTableById.useQuery({ tableId });

  const [newName, setNewName] = useState<string>("");

  const { mutate: renameTable } = api.table.rename.useMutation({});
  const { tableid } = router.query;
  if (typeof tableid !== "string") throw new Error("invalid baseId");
  const { mutate: delBase } = api.base.deleteById.useMutation({
    onSuccess: () => {
      void router.push({
        pathname: `/${baseId}/${firstTableId}/`,
        query: {
          currentBase: JSON.stringify(currentBase),
          currentTableId: firstTableId,
          tableState: JSON.stringify(tableState),
        },
      });
    },
  });
  const firstTableId =
    tableState[0]?.id === tableid ? tableState[1]?.id : tableState[0]?.id;

  const isActive = (id: string) => id === tableid;
  const handleRedirect = () => {
    if (tableState.length === 1) {
      void router.push("/");
      delBase({ baseId });
    } else {
      setCurrentTableId(firstTableId ?? "");
    }
  };

  useEffect(() => {
    if (selectedTable) {
      setNewName(selectedTable.name);
    }
  }, [selectedTable]);

  const { mutate: delTable } = api.table.delete.useMutation({
    onSuccess: () => {
      toast.success("Successfully deleted table");
    },
  });

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
          className="fixed z-50 flex h-[211px] w-[331px] flex-col gap-2 rounded-md border-2 bg-white p-4 shadow-md"
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
          <div className="flex flex-row items-center justify-end gap-2 text-[13px]">
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
                setModalOpen(false);
                setTableState((prev) =>
                  prev.map((table) =>
                    table.id === tableId ? { ...table, name: newName } : table,
                  ),
                );
                setRenameModal(false);
                renameTable({ newName, tableId });
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
        className="fixed z-50 flex h-[432px] w-[330px] flex-col rounded-md border border-[1.5] border-black border-opacity-20 bg-white p-3 shadow-lg"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <span className="flex cursor-pointer flex-row items-center justify-between rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div className="flex flex-row items-center justify-start gap-2">
            <div id="icon-container" className="text-gray-800 text-opacity-75">
              <FiArrowUpCircle size={14} />
            </div>
            <span className="text-[13px] text-gray-900 text-opacity-95">
              Import data
            </span>
          </div>
          <span className="text-gray-800 text-opacity-75">
            <IoChevronForward size={14} />
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span
          className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]"
          onClick={() => setRenameModal(true)}
        >
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiPencilSimple size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Rename table
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <BsEyeSlash size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Hide table
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiFadersHorizontal size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Manage fields
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <PiCopy size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Duplicate table
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <LuChartGantt size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Configure date dependencies
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-75">
            <AiOutlineInfoCircle size={15} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Edit table description
          </span>
        </span>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-70">
            <HiOutlineLockClosed size={16} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Edit table permissions
          </span>
        </span>
        <div className="mx-2 my-2 border-b opacity-80"></div>
        <span className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]">
          <div id="icon-container" className="text-gray-800 text-opacity-70">
            <RxCross1 size={14} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Clear data
          </span>
        </span>
        <span
          className="flex cursor-pointer flex-row items-center gap-2 rounded-[4px] px-2 py-[7px] text-sm hover:bg-[#f2f2f2]"
          onClick={() => {
            setTableState((prev) =>
              prev.filter((table) => table.id !== tableId),
            );
            delTable({ tableId });
            setModalOpen(false);
            if (isActive(tableId)) {
              handleRedirect();
            }
          }}
        >
          <div id="icon-container" className="text-gray-800 text-opacity-70">
            <PiTrash size={16} />
          </div>
          <span className="text-[13px] text-gray-900 text-opacity-90">
            Delete table
          </span>
        </span>
      </div>
    </OutsideClick>
  );
};
