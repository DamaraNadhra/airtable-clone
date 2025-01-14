import { ColumnDef } from "@tanstack/react-table";
import cuid from "cuid";
import OutsideClick from "outsideclick-react";
import { useState } from "react";
import { PiPlus } from "react-icons/pi";
import { useDebounce, useDebouncedCallback } from "use-debounce";

export const SearchPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  tableId: string;
  setSearchPopUpState: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchState: React.Dispatch<React.SetStateAction<string>>;
  searchState: string;
  rows: Record<string, string>[];
}> = ({
  x,
  y,
  tableId,
  isOpen,
  setSearchPopUpState,
  searchState,
  setSearchState,
  rows,
}) => {
  if (!isOpen) return null;
  return (
    <OutsideClick onOutsideClick={() => setSearchPopUpState(false)}>
      <div
        className="fixed z-20 flex h-[70px] w-[300px] flex-col rounded-sm border-[2px] bg-white text-[12px] shadow-md"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <input
          type="text"
          placeholder="Find in view"
          value={searchState}
          className="flex items-center px-2 py-2 outline-none placeholder:text-sm placeholder:font-semibold"
          onChange={(e) => {
            setSearchState(e.target.value);
          }}
        />
        <div className="flex h-[30px] grow items-center bg-[#f2f2f2] px-2 text-gray-500">
          Use advanced search option in the...
        </div>
      </div>
    </OutsideClick>
  );
};
