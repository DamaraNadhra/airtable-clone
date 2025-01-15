/* eslint-disable */
import Head from "next/head";
import Link from "next/link";

import { api, RouterOutputs } from "~/utils/api";

import airtableLogo from "src/images/Airtable-Logo-cropped.jpg";
import magnifyingGlass from "src/images/loupe.png";
import Image from "next/image";
import { HiMagnifyingGlass } from "react-icons/hi2";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { IoIosNotificationsOutline } from "react-icons/io";
import { LuMenu } from "react-icons/lu";
import { GoHome } from "react-icons/go";
import { IoPeopleOutline } from "react-icons/io5";
import helpCircle from "src/components/svgs/helpCircle.svg";
import { FaChevronDown } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { PiStarFour } from "react-icons/pi";
import { PiGridFourLight } from "react-icons/pi";
import { GoArrowUp } from "react-icons/go";
import { PiTableLight } from "react-icons/pi";
import { NextPage } from "next";
import type { IconType } from "react-icons/lib";
import { PropsWithChildren } from "react";
import { PiBookOpenLight } from "react-icons/pi";
import { PiShoppingBagOpen } from "react-icons/pi";
import { SlGlobe } from "react-icons/sl";
import { BsPlusSquare } from "react-icons/bs";
import { PiPlus } from "react-icons/pi";
import { TfiExport } from "react-icons/tfi";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/nextjs";
import { useRouter } from "next/router";
import cuid from "cuid";

const BaseLayout = (props: PropsWithChildren) => {
  return (
    <div className="flex h-[95px] w-[336px] cursor-pointer flex-col gap-2 rounded-lg border-2 bg-white hover:shadow-md">
      {props.children}
    </div>
  );
};

type BaseKind = RouterOutputs["base"]["getAll"][number];
const BaseView = (props: BaseKind) => {
  const router = useRouter();
  return (
    <div
      className="flex h-[95px] w-[336px] cursor-pointer flex-col gap-2 rounded-lg border-2 bg-white hover:shadow-md"
      key={props.id}
      onClick={() => {
        router.push(`/${props.id}`);
      }}
    >
      <div className="m-5 flex grow flex-row justify-start gap-4">
        <div className="flex h-[56px] w-[56px] justify-center rounded-lg bg-green-900">
          <span className="flex items-center justify-center text-xl text-white">
            Un
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[13px] font-semibold">{props.name}</span>
          <span className="mt-2 text-[11px]">Base</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const { mutate: createBase } = api.base.create.useMutation();
  const { data: baseData, isLoading: baseLoading } = api.base.getAll.useQuery();

  return (
    <>
      <main className="relative flex h-screen w-screen flex-col overflow-x-hidden">
        <div className="fixed left-0 right-0 top-0 flex h-[60px] flex-row items-center justify-between border-b py-2 shadow-sm">
          <div className="ml-4 flex flex-row items-center gap-4">
            <div id="hamburg-menu-container">
              <LuMenu size={20} />
            </div>
            <Image
              src={airtableLogo}
              alt="airtable logo"
              className="h-7 w-28"
            />
          </div>
          <div className="flex flex-row items-center gap-2 rounded-full border-2 py-1 pl-3 pr-16 hover:cursor-pointer hover:shadow-md">
            <div className="">
              <HiMagnifyingGlass size={15} />
            </div>
            <input
              className="bg-transparent outline-none placeholder:text-[12px] hover:cursor-pointer"
              placeholder="Search..."
            />
          </div>
          <div className="mr-5 flex flex-row gap-3">
            <div
              className="flex cursor-pointer flex-row items-center gap-1 rounded-full bg-white px-2 hover:bg-gray-300 hover:bg-opacity-80"
              id="help-button"
            >
              <div id="icon-container" className="">
                <IoIosHelpCircleOutline size={20} />
              </div>
              <span className="text-sm">Help</span>
            </div>
            <div
              id="notif-container"
              className="flex cursor-pointer items-center rounded-full border-2 px-1 py-1 shadow-sm hover:bg-gray-300 hover:bg-opacity-80"
            >
              <IoIosNotificationsOutline size={20} />
            </div>
            <SignOutButton>
              <div
                className="cursor-pointer rounded-full bg-green-500 px-[10px] py-1"
                onClick={() => {}}
              >
                D
              </div>
            </SignOutButton>
          </div>
        </div>
        <div className="h-[60px]"></div>
        <div id="after the header" className="flex grow flex-row">
          <div className="relative">
            <div
              id="sidebar"
              className="group absolute left-0 top-0 z-10 h-full w-[47px] flex-grow origin-left transform overflow-hidden border-r bg-white transition-transform duration-300 hover:w-[300px]"
            >
              <div className="flex h-full flex-col justify-between group-hover:hidden">
                <div
                  id="top-side-sidebar"
                  className="collapsed-content mt-4 flex flex-col gap-4 px-3"
                >
                  <GoHome size={20} />
                  <IoPeopleOutline size={20} />
                  <div className="mt-1 border-b"></div>
                </div>
                <div
                  id="bottom-side-sidebar"
                  className="flex flex-col gap-5 px-3"
                >
                  <div className="border-t"></div>
                  <div
                    id="icon-container"
                    className="flex flex-row justify-center"
                  >
                    <PiBookOpenLight size={16} className="text-gray-500" />
                  </div>
                  <div
                    id="icon-container"
                    className="flex flex-row justify-center"
                  >
                    <PiShoppingBagOpen size={16} className="text-gray-400" />
                  </div>
                  <div
                    id="icon-container"
                    className="flex flex-row justify-center"
                  >
                    <SlGlobe size={14} className="text-gray-400" />
                  </div>
                  <div
                    id="icon-container"
                    className="flex flex-row justify-center"
                  >
                    <BsPlusSquare size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="hidden group-hover:flex group-hover:h-full group-hover:flex-col group-hover:justify-between group-hover:shadow-md">
                <div className="flex flex-col items-center gap-3">
                  <div className="mt-2 flex w-[92%] cursor-pointer flex-row items-center justify-between rounded-sm hover:bg-slate-300 hover:bg-opacity-40">
                    <span className="px-2 py-2 pl-2 pr-10 font-[500]">
                      Home
                    </span>
                    <div className="pr-3">
                      <FaChevronDown size={13} />
                    </div>
                  </div>
                  <div className="flex flex-row justify-start gap-3 px-3 pl-5">
                    <div id="icon-star-container">
                      <FaRegStar size={21} />
                    </div>
                    <span className="text-xs text-gray-500">
                      Your starred bases, interfaces, and workspaces will appear
                      here
                    </span>
                  </div>
                  <div className="mt-2 flex w-[92%] cursor-pointer flex-row items-center justify-between rounded-sm hover:bg-slate-300 hover:bg-opacity-40">
                    <span className="px-2 py-2 pl-2 pr-10 font-[500]">
                      All workspaces
                    </span>
                    <div className="flex flex-row items-center gap-3 pr-3">
                      <FaPlus size={15} />
                      <FaChevronRight size={13} />
                    </div>
                  </div>
                </div>
                <div className="mb-4 flex flex-col px-3 text-gray-600">
                  <div className="mb-3 border-t"></div>
                  <div className="flex cursor-pointer flex-row items-center justify-start gap-[6px] rounded-md py-2 hover:bg-slate-300 hover:bg-opacity-30">
                    <div id="icon-container" className="pl-2">
                      <PiBookOpenLight size={18} />
                    </div>
                    <span className="text-[13px]">Templates and apps</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-start gap-[6px] rounded-md py-2 hover:bg-slate-300 hover:bg-opacity-30">
                    <div id="icon-container" className="pl-2">
                      <PiShoppingBagOpen size={18} />
                    </div>
                    <span className="text-[13px]">Marketplace</span>
                  </div>
                  <div className="flex cursor-pointer flex-row items-center justify-start gap-[6px] rounded-md py-2 hover:bg-slate-300 hover:bg-opacity-30">
                    <div id="icon-container" className="pl-2">
                      <TfiExport size={15} />
                    </div>
                    <span className="text-[13px]">Import</span>
                  </div>
                  <button
                    className="mt-4"
                    onClick={() => {
                      const uniqueCUID = cuid();
                      createBase({ name: "Untitled", id: uniqueCUID });
                      void router.push(`/${uniqueCUID}`);
                    }}
                  >
                    <div className="flex flex-row items-center justify-center gap-3 rounded-md bg-blue-600 px-4 py-2 text-white">
                      <div>
                        <PiPlus size={16} />
                      </div>
                      <span className="text-[13px] font-[500]">Create</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[47px]"></div>
          <div className="flex w-full flex-col gap-7 bg-[#f8fafb] px-11">
            <span className="pt-7 text-[27px] font-semibold">Home</span>
            <div className="flex flex-row justify-start gap-3">
              <BaseLayout>
                <div className="flex flex-row items-center gap-2 px-3 pt-3">
                  <div id="icon-container">
                    <PiStarFour size={18} className="text-[#DD04A8]" />
                  </div>
                  <span className="text-sm font-semibold">Start with AI</span>
                </div>
                <span className="px-3 pb-3 text-[13px] text-gray-500">
                  Turn your process into an app with data and interfaces using
                  AI.
                </span>
              </BaseLayout>
              <BaseLayout>
                <div className="flex flex-row items-center gap-2 px-3 pt-3">
                  <div id="icon-container">
                    <PiGridFourLight size={20} className="text-[#63498D]" />
                  </div>
                  <span className="text-sm font-semibold">
                    Start with templates
                  </span>
                </div>
                <span className="px-3 pb-3 text-[13px] text-gray-500">
                  Turn your process into an app with data and interfaces using
                  AI.
                </span>
              </BaseLayout>
              <BaseLayout>
                <div className="flex flex-row items-center gap-2 px-3 pt-3">
                  <div id="icon-container">
                    <GoArrowUp size={20} className="text-[#0D7F78]" />
                  </div>
                  <span className="text-sm font-semibold">Quickly upload</span>
                </div>
                <span className="px-3 pb-3 text-[13px] text-gray-500">
                  Turn your process into an app with data and interfaces using
                  AI.
                </span>
              </BaseLayout>
              <BaseLayout>
                <div className="flex flex-row items-center gap-2 px-3 pt-3">
                  <div id="icon-container">
                    <PiTableLight size={20} className="text-[#3B66A3]" />
                  </div>
                  <span className="text-sm font-semibold">
                    Start from scratch
                  </span>
                </div>
                <span className="px-3 pb-3 text-[13px] text-gray-500">
                  Turn your process into an app with data and interfaces using
                  AI.
                </span>
              </BaseLayout>
            </div>
            <div className="flex flex-row gap-3 text-[15px] text-gray-500">
              <span className="hover:cursor-pointer">Opened by you ⌵</span>
              <span className="hover:cursor-pointer">Show all types ⌵</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {baseData?.map((base) => <BaseView {...base} />)}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
