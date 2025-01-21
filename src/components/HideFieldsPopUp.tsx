import { useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { OutsideClick } from "outsideclick-react";
import type { ViewObj } from "~/helpers/types";
import type { Column } from "@prisma/client";
import { getIconComponent } from "~/helpers/getIconComponent";
export const HideFieldsPopUp: React.FC<{
  x: number;
  y: number;
  isOpen: boolean;
  columns: Column[];
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setViewState: React.Dispatch<React.SetStateAction<ViewObj[]>>;
  currentView: string;
  viewState: ViewObj[];
}> = ({
  x,
  y,
  isOpen,
  setModalOpen,
  currentView,
  viewState,
  setViewState,
  columns,
}) => {
  const [hiddenFieldState, setHiddenFieldState] = useState<string[]>([]);
  const { mutate: updateView } = api.views.update.useMutation();
  const currentViewIdRef = useRef(currentView);
  useEffect(() => {
    currentViewIdRef.current = currentView;
  }, [currentView]);
  const getIsChecked = (col: Column) => {
    return !hiddenFieldState.includes(col.id);
  };
  useEffect(() => {
    const currentViewObj = viewState.find((view) => view.id === currentView);
    if (currentViewObj) {
      setHiddenFieldState(currentViewObj.hiddenFields as string[]);
    }
  }, [viewState, currentView]);
  useEffect(() => {
    setViewState((prev) => {
      return prev.map(
        (view) =>
          view.id === currentViewIdRef.current
            ? ({
                ...view,
                hiddenFields: hiddenFieldState,
              } as ViewObj)
            : view, // Keep other views unchanged
      );
    });
    if (currentViewIdRef.current) {
      updateView({
        id: currentViewIdRef.current,
        hiddenFields: hiddenFieldState,
      });
    }
  }, [hiddenFieldState, setViewState, updateView]);
  if (!isOpen) return null;
  return (
    <OutsideClick
      onOutsideClick={() => {
        setModalOpen(false);
      }}
    >
      <div
        className="fixed z-50 flex h-auto w-[320px] flex-col gap-2 rounded-md border border-[1.5] border-black border-opacity-20 bg-white p-3 shadow-lg"
        style={{ left: `${x}px`, top: `${y}px` }}
      >
        <input
          type="text"
          className="p-1 text-[13px] outline-none"
          placeholder="Find a field"
        />
        <div className="mx-1 -mt-1 border-b border-gray-700 opacity-20"></div>
        <div className="ml-1 flex flex-col gap-2">
          {columns.map((col) => (
            <div
              key={col.id}
              className="flex cursor-pointer flex-row gap-2 hover:bg-[#f2f2f2]"
              onClick={() => {
                setHiddenFieldState((prev) =>
                  hiddenFieldState.includes(col.id)
                    ? prev.filter((id) => id !== col.id)
                    : [...prev, col.id],
                );
              }}
            >
              <label className="flex cursor-pointer select-none items-center">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={getIsChecked(col)}
                    onChange={() => {
                      console.log("ticked");
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`block h-2 w-4 rounded-full ${getIsChecked(col) ? "bg-green-600" : "bg-[#EAEEFB]"}`}
                  ></div>
                  <div
                    className={`dot absolute top-[1px] flex h-[6px] w-[6px] items-center justify-center rounded-full bg-white transition-transform duration-300`}
                    style={{
                      transform: getIsChecked(col)
                        ? "translateX(0.5rem)"
                        : "translateX(0.1rem)",
                    }}
                  >
                    <span className={`bg-primary h-1 w-1 rounded-full`}></span>
                  </div>
                </div>
              </label>
              <div className="flex flex-row items-center gap-2">
                <div
                  id="icon-container"
                  className="text-gray-800 text-opacity-75"
                >
                  {getIconComponent(col.icon, 15)}
                </div>
                <span className="text-[13px] text-gray-900 text-opacity-90">
                  {col.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-row justify-between gap-1">
          <span
            className="cursor-pointer rounded-sm bg-[#f2f2f2] px-[50px] py-1 text-[11px] font-semibold text-gray-800 opacity-80 hover:opacity-100"
            onClick={() => {
              setHiddenFieldState(() => columns.map((col) => col.id));
            }}
          >
            Hide all
          </span>
          <span
            className="cursor-pointer rounded-sm bg-[#f2f2f2] px-[50px] py-1 text-[11px] font-semibold text-gray-800 opacity-80 hover:opacity-100"
            onClick={() => {
              setHiddenFieldState([]);
            }}
          >
            Show all
          </span>
        </div>
      </div>
    </OutsideClick>
  );
};
