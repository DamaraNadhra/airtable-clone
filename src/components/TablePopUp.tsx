import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { OutsideClick } from "outsideclick-react";
import type { Base, Table } from "@prisma/client";
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
  const ctx = api.useUtils();
  const router = useRouter();
  const [renameModalOpen, setRenameModal] = useState<boolean>(false);
  const { data: selectedTable } = api.table.getTableById.useQuery({ tableId });

  const [newName, setNewName] = useState<string>("");

  const { mutate: renameTable } = api.table.rename.useMutation({
    onSuccess: () => {
      toast.success("Table renamed successfully");
      setModalOpen(false);
      setRenameModal(false);
      void ctx.table.invalidate();
    },
  });
  const { tableid } = router.query;
  if (typeof tableid !== "string") throw new Error("invalid baseId");
  const { mutate: delBase } = api.base.deleteById.useMutation();
  const firstTableId =
    tableState[0]?.id === tableid ? tableState[1]?.id : tableState[0]?.id;

  const isActive = (id: string) => id === tableid;
  const handleRedirect = () => {
    if (tableState.length === 1) {
      void router.push("/");
      delBase({ baseId });
    } else {
      setCurrentTableId(firstTableId ?? "");
      void router.push({
        pathname: `/${baseId}/${firstTableId}/`,
        query: {
          currentBase: JSON.stringify(currentBase),
          currentTableId: firstTableId,
          tableState: JSON.stringify(tableState),
        },
      });
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
          className="fixed z-50 flex w-[331px] flex-col rounded-md border-2 bg-white shadow-md"
          style={{ left: `${x}px`, top: `${y}px` }}
        >
          <input
            type="text"
            placeholder="type something"
            className="m-3 mt-4 h-[37px] rounded-[3px] px-4 py-1 text-[13px] outline-none focus:ring-[1.5px] focus:ring-blue-600"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex flex-row items-center justify-end gap-2 pb-3 pr-4 text-[12.5px]">
            <span
              className="cursor-pointer rounded-md p-1 hover:bg-[#f2f2f2]"
              onClick={() => {
                setModalOpen(false);
                setRenameModal(false);
              }}
            >
              Cancel
            </span>
            <span
              className="cursor-pointer rounded-md bg-blue-600 p-1 px-2 text-white"
              onClick={() => {
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
        className="fixed z-50 flex flex-col rounded-md bg-white p-2 shadow-lg"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <span
          className="cursor-pointer px-1 py-1 text-sm text-red-500 hover:bg-[#f8f8f8]"
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
          Delete table
        </span>
        <span
          className="cursor-pointer px-1 py-1 text-sm hover:bg-[#f8f8f8]"
          onClick={() => {
            setRenameModal(true);
          }}
        >
          Rename table
        </span>
      </div>
    </OutsideClick>
  );
};
