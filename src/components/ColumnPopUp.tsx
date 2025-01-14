import type { CellContext, ColumnDef } from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { IconType } from "react-icons/lib";
import { AiOutlineNumber } from "react-icons/ai";
import { LuLetterText } from "react-icons/lu";
import { api } from "~/utils/api";

type FieldType = {
  name: string;
  icon: IconType;
  key: string;
};

const FieldTypePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  setFieldPopUp: React.Dispatch<React.SetStateAction<boolean>>;
  setField: React.Dispatch<React.SetStateAction<FieldType>>;
}> = ({ x, y, isOpen, setFieldPopUp, setField }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed z-20 flex w-[130px] flex-col gap-0 rounded-sm bg-white p-3 text-[13px] shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <div
        className="flex cursor-pointer flex-row gap-3 px-2 py-1 hover:bg-[#f2f2f2]"
        onClick={() => {
          setFieldPopUp(false);
          setField(() => ({
            icon: LuLetterText,
            name: "Text",
            key: "string",
          }));
        }}
      >
        <div id="icon-container">
          <LuLetterText size={15} />
        </div>
        <div className="text-[13px]">Text</div>
      </div>
      <div
        className="flex cursor-pointer flex-row gap-3 px-2 py-1 hover:bg-[#f2f2f2]"
        onClick={() => {
          setFieldPopUp(false);
          setField(() => ({
            icon: AiOutlineNumber,
            name: "Number",
            key: "int",
          }));
        }}
      >
        <div id="icon-container">
          <AiOutlineNumber size={15} />
        </div>
        <div className="text-[13px]">Number</div>
      </div>
    </div>
  );
};

export const ColumnPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  tableId: string;
  setColState: React.Dispatch<
    React.SetStateAction<ColumnDef<Record<string, string>, string>[]>
  >;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ x, y, isOpen, tableId, setModalOpen, setColState }) => {
  const [fieldTypePopUpModal, setFieldTypePopupModal] =
    useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [colName, setColName] = useState<string>("");
  const [fieldType, setFieldType] = useState<FieldType>({
    icon: LuLetterText,
    key: "string",
    name: "Text",
  });
  const { mutate: newCol } = api.columns.create.useMutation({
    onSuccess: () => {
      toast.success("Successfully created column");
    },
    onError: () => {
      toast.error("Failed to create column");
    },
  });

  if (!isOpen) return null;

  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
        setFieldTypePopupModal(false);
      }}
    >
      <div
        className="fixed flex w-[331px] flex-col gap-2 rounded-md border-2 bg-white p-3 shadow-md"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <input
          type="text"
          placeholder="Field name (optional)"
          className="mt-1 h-[37px] rounded-md border-2 px-4 py-1 text-[13px] shadow-sm outline-none placeholder:text-[13px] focus:ring-[1.5px] focus:ring-blue-600"
          value={colName}
          onChange={(e) => setColName(e.target.value)}
        />
        <div
          className="flex cursor-pointer flex-row items-center gap-3 rounded-md border-2 py-1 pl-2 shadow-sm hover:bg-[#f2f2f2]"
          onClick={(e) => {
            const element = e.currentTarget;
            const rect = element.getBoundingClientRect();
            setMousePosition({ x: rect.left, y: rect.bottom + 5 });
            setFieldTypePopupModal(true);
          }}
        >
          <fieldType.icon size={15} />
          <div className="text-[13px]">{fieldType.name}</div>
        </div>
        <div className="flex flex-row items-center justify-end gap-2 pr-2 text-[12.5px]">
          <span
            className="cursor-pointer rounded-md p-2 px-3 hover:bg-[#f2f2f2]"
            onClick={() => {
              setModalOpen(false);
            }}
          >
            Cancel
          </span>
          <span
            className="cursor-pointer rounded-md bg-blue-600 p-2 px-3 text-white"
            onClick={() => {
              const uniqueCUID = cuid();
              const newlyCreatedCol = {
                header: colName,
                accessor: colName,
                cell: (cell: CellContext<Record<string, string>, string>) =>
                  cell.getValue(),
                id: uniqueCUID,
              };
              setColState((prev) => [...prev, newlyCreatedCol]);
              setModalOpen(false);
              newCol({
                name: colName,
                tableId,
                id: uniqueCUID,
                type: fieldType.key,
              });
            }}
          >
            Create field
          </span>
        </div>
      </div>
      <OutsideClick onOutsideClick={() => setFieldTypePopupModal(false)}>
        <FieldTypePopUp
          x={mousePosition.x}
          y={mousePosition.y}
          isOpen={fieldTypePopUpModal}
          setFieldPopUp={setFieldTypePopupModal}
          setField={setFieldType}
        />
      </OutsideClick>
    </OutsideClick>
  );
};
