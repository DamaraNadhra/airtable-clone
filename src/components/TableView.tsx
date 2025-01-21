import type { Base, Table } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoChevronDownSharp } from "react-icons/io5";

interface TableViewProps {
  name: string;
  id?: string;
  baseId: string;
  setModal: React.Dispatch<React.SetStateAction<boolean>>;
  setTableId: React.Dispatch<React.SetStateAction<string>>;
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setPopUpId: React.Dispatch<React.SetStateAction<string>>;
  tableState: Table[];
  currentBase: Base;
  currentTableId: string;
}

export const TableView = ({
  name,
  id,
  baseId,
  setModal,
  setTableId,
  setPosition,
  setPopUpId,
  currentTableId,
  tableState,
  currentBase,
}: TableViewProps) => {
  const router = useRouter();
  const { tableid } = router.query;
  if (typeof tableid !== "string" || typeof id !== "string")
    throw new Error("No id");
  const isActive = (id: string) => id === currentTableId;
  const handlePopUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setPopUpId(id);
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.bottom });
    setModal(true);
  };
  
  return (
    <div className="h-full">
      {isActive(id) ? (
        <div
          className="flex h-full flex-row items-center gap-2 rounded-tl-[3px] rounded-tr-[3px] bg-white px-3 pt-1 shadow-md cursor-pointer"
          onClick={handlePopUp}
          onContextMenu={handlePopUp}
        >
          <div className="flex flex-row gap-2">
            <span className="font-[500]">{name}</span>
            <div>
              <IoChevronDownSharp size={13} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row">
          <Link
            className="flex rounded-[3px] px-3 py-2 font-[400] text-slate-300 hover:bg-slate-800 hover:bg-opacity-10 hover:text-slate-200"
            href={{
              pathname: `/${baseId}/${id}`,
              query: {
                tableState: JSON.stringify(tableState),
                currentTableId: id,
                currentBase: JSON.stringify(currentBase),
              },
            }}
            onContextMenu={handlePopUp}
            onClick={(e) => {
              if (e.button === 0) {
                setTableId(id);
              }
            }}
          >
            {name}
          </Link>
          <div className="my-[10px] border-r border-[#1a8aab]"></div>
        </div>
      )}
    </div>
  );
};
