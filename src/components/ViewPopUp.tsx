import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { OutsideClick } from "outsideclick-react";
import type { View } from "@prisma/client";
import { FaRegStar } from "react-icons/fa6";
import { PiPencilSimple } from "react-icons/pi";
import { PiCopy } from "react-icons/pi";
import { PiTrash } from "react-icons/pi";
export const ViewPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  baseId: string;
  tableId: string;
  currentViewId: string;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setViewState: React.Dispatch<React.SetStateAction<View[]>>;
  setCurrentView: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedViewId: string;
  viewState: View[];
}> = ({
  x,
  y,
  isOpen,
  baseId,
  tableId,
  currentViewId,
  setModalOpen,
  setViewState,
  selectedViewId,
  setCurrentView,
  viewState,
}) => {
  const router = useRouter();
  const { mutate: delView } = api.views.deleteById.useMutation();
  const isActive = (id: string) => id === currentViewId;
  const isDisabled = () => viewState.length === 1;
  const firstViewId =
    viewState[0]?.id === currentViewId ? viewState[1]?.id : viewState[0]?.id;
  const handleRedirect = () => {
    setCurrentView(firstViewId);
    void router.push({
      pathname: `/${baseId}/${tableId}/${firstViewId}`,
    });
  };
  if (!isOpen) return null;

  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
      }}
    >
      <div
        className="fixed z-20 flex h-auto w-[280px] flex-col gap-1 rounded-md bg-white p-3 text-[#383c42] shadow-md"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <div className="flex cursor-pointer flex-row items-center gap-3 rounded-md py-[6px] pl-2 hover:bg-[#f2f2f2]">
          <div id="icon-container" className="mb-[2px]">
            <FaRegStar size={15} />
          </div>
          <span className="text-[13px]">{`Add to 'My favorites'`}</span>
        </div>
        <div className="mb-2 mt-1 border-b"></div>
        <div
          className="flex cursor-pointer flex-row items-center gap-3 rounded-md py-[6px] pl-2 hover:bg-[#f2f2f2]"
          onClick={() => {
            setViewState((prev) =>
              prev.map((view) =>
                view.id === selectedViewId
                  ? { ...view, isRenaming: true }
                  : view,
              ),
            );
            const theName = viewState.find(
              (v) => v.id === selectedViewId,
            )?.name;
            console.log(theName);
          }}
        >
          <div id="icon-container" className="mb-[2px]">
            <PiPencilSimple size={16} />
          </div>
          <span className="text-[12.5px]">Rename view</span>
        </div>
        <button className="flex cursor-pointer flex-row items-center gap-3 rounded-md py-[6px] pl-2 hover:bg-[#f2f2f2]">
          <div id="icon-container" className="mb-[2px]">
            <PiCopy size={17} />
          </div>
          <span className="text-[12.5px]">Duplicate view</span>
        </button>
        <button
          className="flex cursor-pointer flex-row items-center gap-3 rounded-md py-[6px] pl-2 hover:bg-[#f2f2f2] disabled:opacity-50"
          disabled={isDisabled()}
        >
          <div id="icon-container" className="mb-[2px]">
            <PiTrash size={17} />
          </div>
          <span
            className="text-[12.5px] text-red-500"
            onClick={() => {
              setViewState((prev) =>
                prev.filter((view) => view.id !== selectedViewId),
              );
              delView({ id: selectedViewId });
              setModalOpen(false);
              if (isActive(selectedViewId)) {
                handleRedirect();
              }
            }}
          >
            Delete view
          </span>
        </button>
      </div>
    </OutsideClick>
  );
};
