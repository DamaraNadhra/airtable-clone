import type { NextPage } from "next";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import React, { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { SiAirtable } from "react-icons/si";
import { IoChevronDownSharp } from "react-icons/io5";
import type { Base, Table } from "@prisma/client";
import { TableView } from "~/components/TableView";
import { RxHamburgerMenu } from "react-icons/rx";
import { TablePopUp } from "~/components/TablePopUp";
import { FaChevronDown, FaClockRotateLeft } from "react-icons/fa6";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { PiBell, PiUsers } from "react-icons/pi";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

const BaseLayout: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const { id, tableid, tableState, currentTableId, currentBase } = router.query;
  if (typeof tableid !== "string" || typeof id !== "string") {
    throw new Error("slugs must be a string");
  }
  const { data: viewsData } = api.views.getALl.useQuery({
    tableId: currentTableId as string,
  });
  const [tables, setTables] = useState<Table[]>(
    tableState ? (JSON.parse(tableState as string) as Table[]) : [],
  );

  const passedBaseState = JSON.parse(currentBase as string) as Base;

  const [popUpId, setPopUpId] = useState<string>(
    (currentTableId as string) || "",
  );
  const [tableModalOpen, setTableModalOpen] = useState<boolean>(false);
  const [currentTableid, setTableId] = useState<string>(
    (currentTableId as string) || "",
  );
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const firstView = useMemo(
    () => viewsData?.map((data) => data)[0]?.id,
    [viewsData],
  );
  useEffect(() => {
    if (viewsData) {
      void router.push({
        pathname: `/${id}/${tableid}/${firstView}`,
        query: {
          fetchedBase: JSON.stringify(passedBaseState),
          tableState: JSON.stringify(tables),
        },
      });
    }
  }, [viewsData, id, tableid, firstView, router, passedBaseState, tables]);
  return (
    <>
      <main className="flex h-screen w-screen flex-col overflow-x-hidden bg-[#f7f7f7]">
        <div className="relative flex">
          <div
            id="topbar"
            className="flex h-[56px] w-full flex-row items-center justify-between bg-[#007da1]"
          >
            <div className="flex h-[24px] w-[24px] flex-row items-center justify-between gap-2 pl-4 text-white">
              <div className="flex flex-row justify-normal gap-[1px]">
                <div
                  id="icon-container"
                  className="group ml-[1px] mt-[3px] flex h-[32px] w-[32px] cursor-pointer p-1"
                >
                  <div
                    className="hidden rounded-full bg-white p-[6px] opacity-0 transition-opacity duration-300 group-hover:flex group-hover:opacity-100"
                    onClick={() => {
                      void router.push("/");
                    }}
                  >
                    <FiArrowLeft className="text-[#007da1]" size={12} />
                  </div>
                  <div className="group-hover:hidden">
                    <SiAirtable size={21} />
                  </div>
                </div>
                <div className="flex cursor-pointer flex-row items-center justify-between gap-2 pl-2">
                  <span className="text-[17px] font-[675] text-white text-opacity-90 hover:text-opacity-95">
                    {passedBaseState.name}
                  </span>
                  <div>
                    <IoChevronDownSharp size={13} />
                  </div>
                </div>
              </div>

              <div className="ml-2 cursor-default rounded-full border-[1px] border-[#1b6074] bg-[#006a89] px-[11px] py-[4px] text-[13px] text-white text-opacity-95 shadow-inner hover:bg-cyan-800 hover:bg-opacity-40">
                Data
              </div>
              <div className="cursor-pointer rounded-full px-3 py-[6px] text-[13px] text-white text-opacity-80 hover:bg-cyan-800 hover:bg-opacity-40">
                Automations
              </div>
              <div className="cursor-pointer rounded-full px-3 py-[6px] text-[13px] text-white text-opacity-80 hover:bg-cyan-800 hover:bg-opacity-40">
                Interfaces
              </div>
              <div className="h-5 border-r border-slate-300 border-opacity-30 pr-1"></div>
              <div className="cursor-pointer rounded-full px-3 py-[6px] text-[13px] text-white text-opacity-80 hover:bg-cyan-800 hover:bg-opacity-40">
                Forms
              </div>
            </div>
            <div className="mr-4 flex flex-row items-center justify-between gap-4">
              <div className="-mr-3 cursor-pointer rounded-full p-2 px-3 text-white text-opacity-70 hover:bg-[#00708f]">
                <FaClockRotateLeft size={12} />
              </div>
              <div
                className="-mr-2 flex cursor-pointer flex-row items-center gap-[4px] rounded-full bg-transparent px-3 py-[6px] text-white text-opacity-80 hover:bg-[#00708f]"
                id="help-button"
              >
                <div id="icon-container" className="">
                  <IoIosHelpCircleOutline size={16} />
                </div>
                <span className="text-[13px]">Help</span>
              </div>
              <div
                className="flex cursor-pointer flex-row items-center gap-[5px] rounded-full border-[1px] border-black border-opacity-20 bg-[#005e79] px-[11px] py-[5px] text-[13px] text-white shadow-inner"
                id="help-button"
              >
                Trial: 5 days left
              </div>
              <div className="flex cursor-pointer flex-row items-center gap-[5px] rounded-full bg-transparent bg-white px-3 py-[5px] text-[#007da1] opacity-95 hover:opacity-100">
                <div id="icon-container" className="">
                  <PiUsers size={16} />
                </div>
                <span className="font- text-[13px]">Share</span>
              </div>
              <div className="cursor-pointer rounded-full bg-white p-[6px] text-[#007da1] opacity-90 hover:opacity-100">
                <div>
                  <PiBell size={16} />
                </div>
              </div>
              <Image
                src={user?.imageUrl ?? ""}
                alt="Profile Image"
                className="h-7 w-7 cursor-pointer rounded-full outline outline-1 outline-white"
                width={56}
                height={56}
              />
            </div>
          </div>

          <div className="absolute left-0 right-0 top-[56px] flex h-[32px] w-full flex-row gap-2 overflow-auto overflow-y-hidden bg-[#007da1]">
            <div className="flex h-full flex-grow flex-row pl-3 bg-[#007091]">
              {tables.map((table) => (
                <TableView
                  {...table}
                  setPopUpId={setPopUpId}
                  currentTableId={currentTableid}
                  setModal={setTableModalOpen}
                  currentBase={passedBaseState}
                  setTableId={setTableId}
                  tableState={tables}
                  setPosition={setMousePosition}
                  key={table.id}
                />
              ))}
              <button className="px-2">
                <FiPlus
                  size={18}
                  className="text-slate-300 hover:text-slate-200"
                />
              </button>
            </div>
            <div className="flex h-full w-[157.71px] flex-row items-center bg-[#007091] text-white">
              <span className="cursor-pointer px-3 text-white text-opacity-80 hover:text-opacity-90">
                Extensions
              </span>
              <span className="flex cursor-pointer flex-row items-center gap-2 px-3 text-white text-opacity-80 hover:text-opacity-90">
                <span>Tools</span>
                <div>
                  <FaChevronDown size={10} />
                </div>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-[32px]">
          <div className="relative">
            <div
              id="view-bar-container"
              className="absolute left-0 right-0 top-0 flex h-[44px] w-full flex-none flex-row justify-between border-b bg-white text-black"
            >
              <div className="ml-3 flex flex-row items-center justify-between gap-2">
                <div
                  id="view"
                  className="flex flex-row items-center justify-normal gap-1 rounded-sm bg-white px-2 py-1 text-[12.5px] font-[500] hover:ring-1 hover:ring-gray-300"
                >
                  <RxHamburgerMenu size={15} />
                  <span>Views</span>
                </div>
                <div className="flex flex-row gap-2">
                  <div className="animate-pulse rounded-full bg-[#e0e0e0] px-10 py-2"></div>
                  <div className="animate-pulse rounded-full bg-[#e0e0e0] px-10 py-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[44px]"></div>
        <div className="flex h-[calc(100%-132px)] flex-row">
          <div className="flex h-full w-[282px] flex-col justify-between border-2 bg-white px-3 pt-2">
            <div className="mt-10 flex h-[33px] flex-row items-center rounded-md bg-[#fafafa]">
              <div className="ml-3 h-[20px] animate-pulse rounded-md bg-[#e0e0e0] px-[10px]"></div>
              <div className="ml-3 animate-pulse rounded-full bg-[#e0e0e0] px-20 py-2"></div>
            </div>
          </div>
        </div>
        <TablePopUp
          isOpen={tableModalOpen}
          tableState={tables}
          currentBase={passedBaseState}
          x={mousePosition.x}
          y={mousePosition.y}
          tableId={popUpId}
          baseId={id}
          setCurrentTableId={setTableId}
          setTableState={setTables}
          setModalOpen={setTableModalOpen}
        />
      </main>
    </>
  );
};

// export const getStaticProps: GetStaticProps = async (context) => {
//   const ssg = generateSSGHelper();
//   const baseId = context.params?.id;
//   const tableId = context.params?.tableid;
//   if (typeof tableId !== "string" || typeof baseId !== "string")
//     throw new Error("no id");

//   await ssg.base.getBaseById.prefetch({ baseId });
//   await ssg.table.getAllTablesByBaseId.prefetch({ baseId });

//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       baseId,
//       tableId,
//     },
//   };
// };

// export const getStaticPaths = () => {
//   return { paths: [], fallback: "blocking" };
// };

export default BaseLayout;
