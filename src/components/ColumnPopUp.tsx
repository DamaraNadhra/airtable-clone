import {
  createColumnHelper,
  type CellContext,
  type ColumnDef,
  type CoreInstance,
} from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useState } from "react";
import toast from "react-hot-toast";
import type { IconType } from "react-icons/lib";
import { AiOutlineNumber } from "react-icons/ai";
import { LuLetterText } from "react-icons/lu";
import { api } from "~/utils/api";
import { getIconComponent } from "~/helpers/getIconComponent";

type FieldType = {
  name: string;
  icon: string;
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
            icon: "LuLetterText",
            name: "Text",
            key: "text",
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
            icon: "AiOutlineNumber",
            name: "Number",
            key: "number",
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
  setRowState: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
  setColState: React.Dispatch<
    React.SetStateAction<ColumnDef<Record<string, string>, string>[]>
  >;
  columns: ColumnDef<Record<string, string>, string>[];
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({
  x,
  y,
  isOpen,
  tableId,
  setModalOpen,
  setColState,
  setRowState,
  columns,
}) => {
  const [fieldTypePopUpModal, setFieldTypePopupModal] =
    useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [colName, setColName] = useState<string>("");
  const isValidFieldName = (name: string) =>
    !columns.some((c) => c.header === name);
  const [fieldType, setFieldType] = useState<FieldType>({
    icon: "LuLetterText",
    key: "text",
    name: "Text",
  });
  const columnHelper = createColumnHelper<Record<string, string>>();
  const { mutate: newCol } = api.columns.create.useMutation();

  if (!isOpen) return null;

  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
        setFieldTypePopupModal(false);
        setColName("");
      }}
    >
      <div
        className="fixed z-20 flex w-[350px] flex-col gap-2 rounded-md border-2 bg-white p-3 shadow-md"
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
          {getIconComponent(fieldType.icon, 15)}
          <div className="text-[13px]">{fieldType.name}</div>
        </div>
        <div className="flex flex-row items-center justify-end gap-2 pr-2 text-[12.5px]">
          {!isValidFieldName(colName) && (
            <div className="w-[140px] text-[12px] text-red-500 text-opacity-80">
              {"* Please choose another fieldname"}
            </div>
          )}
          <span
            className="cursor-pointer rounded-md p-2 px-3 hover:bg-[#f2f2f2]"
            onClick={() => {
              setModalOpen(false);
              setColName("");
            }}
          >
            Cancel
          </span>
          <button
            className="cursor-pointer rounded-md bg-blue-600 p-2 px-3 text-white disabled:opacity-50"
            disabled={!isValidFieldName(colName)}
            onClick={() => {
              const uniqueCUID = cuid();
              const newlyCreatedCol = columnHelper.accessor(colName, {
                header: colName,
                id: uniqueCUID,
                size: 180,
                meta: {
                  icon: fieldType.icon,
                  type: fieldType.key,
                  priority: "secondary",
                  tableId: tableId,
                },
              });
              setColState((prev) => [...prev, newlyCreatedCol]);
              setRowState((prev) =>
                prev.map((theRow) => ({
                  ...theRow,
                  [colName]: "",
                })),
              );
              setModalOpen(false);
              newCol({
                name: colName,
                tableId,
                id: uniqueCUID,
                iconName: fieldType.icon,
                type: fieldType.key,
              });
              setColName("");
            }}
          >
            Create field
          </button>
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
