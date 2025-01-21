import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaRegStar } from "react-icons/fa6";
import { PiArrowSquareOut } from "react-icons/pi";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { api } from "~/utils/api";
import OutsideClick from "outsideclick-react";
import type { Base } from "@prisma/client";

const AnotherPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  baseId: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ x, y, isOpen, baseId, setModalOpen }) => {
  const ctx = api.useUtils();
  const router = useRouter();
  const { mutate: delBase } = api.base.deleteById.useMutation({
    onSuccess: () => {
      toast.success("Successfully deleted base");
      void ctx.base.invalidate();
    },
  });
  if (!isOpen) return null;
  return (
    <div
      className="fixed flex w-[240px] flex-col gap-0 rounded-md border-2 bg-white shadow-md"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      <span
        className="mx-8 my-1 cursor-pointer rounded-md px-2 py-1 text-center text-sm text-red-500 hover:bg-[#f2f2f2]"
        onClick={() => {
          setModalOpen(false);
          void router.push("/");
          delBase({ baseId });
        }}
      >
        Delete base
      </span>
    </div>
  );
};

export const BasePopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  baseId: string;
  currentBase: Base;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBaseState: React.Dispatch<
    React.SetStateAction<Base | Record<string, string>>
  >;
}> = ({ x, y, isOpen, baseId, setModalOpen, currentBase, setBaseState }) => {
  const ctx = api.useUtils();
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [newName, setNewName] = useState<string>(currentBase.name);
  const { mutate: renameBase } = api.base.rename.useMutation({
    onSuccess: (renamedBase) => {
      setModalOpen(false);
      setNewName(renamedBase.name);
      void ctx.table.invalidate();
    },
  });
  if (!isOpen) return null;
  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
        setRenameModalOpen(false);
        setBaseState((prev) => ({
          ...prev,
          name: newName,
        }));
        renameBase({ newName, baseId });
      }}
    >
      <div
        className="fixed z-20 flex w-[400px] flex-col gap-0 rounded-md border-2 bg-white shadow-md"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <div className="m-2 flex flex-row items-center justify-normal gap-2">
          <input
            type="text"
            placeholder="type something"
            className="m-3 mt-4 h-[37px] w-[272px] rounded-sm px-4 py-1 text-xl outline-none hover:bg-[#e4e9f0] focus:bg-[#e4e9f0] focus:ring-[2px] focus:ring-blue-300"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex flex-row gap-3">
            <div className="cursor-pointer">
              <FaRegStar size={15} />
            </div>
            <div className="cursor-pointer">
              <PiArrowSquareOut size={15} />
            </div>
            <div
              className="cursor-pointer"
              onClick={(e) => {
                setMousePosition({ x: e.clientX, y: e.clientY });
                setRenameModalOpen(true);
              }}
            >
              <HiOutlineDotsHorizontal size={15} />
            </div>
          </div>
        </div>
        <div className="mx-3 -mt-1 mb-4 border-t"></div>
        <OutsideClick onOutsideClick={() => setRenameModalOpen(false)}>
        <AnotherPopUp
          isOpen={renameModalOpen}
          x={mousePosition.x}
          y={mousePosition.y}
          baseId={baseId}
          setModalOpen={setRenameModalOpen}
        />
        </OutsideClick>
      </div>
    </OutsideClick>
  );
};
