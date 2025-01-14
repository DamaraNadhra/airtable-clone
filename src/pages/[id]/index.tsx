import { useRouter } from "next/router";
import { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { SiAirtable } from "react-icons/si";
import { api } from "~/utils/api"; // Adjust import based on your actual setup

const BasePage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch tables using the useQuery hook directly
  const { data, isLoading, isError } = api.table.getAllTablesByBaseId.useQuery({
    baseId: id as string, // Ensuring baseId is treated as a string
  });
  const { data: baseData, isLoading: loadingBase } =
    api.base.getBaseById.useQuery({ baseId: id as string });

  useEffect(() => {
    // If there are tables, redirect to the first table
    if (baseData && data && data.length > 0) {
      const firstTableId = data[0]?.id;
      void router.push({
        pathname: `/${id as string}/${firstTableId}`,
        query: {
          currentBase: JSON.stringify(baseData),
          currentTableId: firstTableId,
          tableState: JSON.stringify(data),
        },
      });
    }
  }, [data, id, router]);

  if (isError) return <div>Error fetching tables</div>;
  if (!id || typeof id !== "string") return <div>Loading...</div>;

  return (
    <>
      <main className="flex h-screen w-screen flex-col overflow-x-hidden bg-[#f7f7f7]">
        <div className="relative flex">
          <div
            id="topbar"
            className="flex h-[56px] w-full flex-row items-center justify-between bg-[#007da1]"
          >
            <div className="flex h-[24px] w-[24px] flex-row items-center justify-between gap-2 pl-4 text-white">
              <div
                id="icon-container"
                className="group flex cursor-pointer p-1"
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
              <div className="ml-2 flex flex-col gap-1">
                <div className="flex w-20 animate-pulse rounded-full bg-[#d6d6d6] px-10 py-1"></div>
                <div className="w-14 animate-pulse rounded-full bg-[#d6d6d6] py-1"></div>
              </div>
              <div className="w-15 ml-5 animate-pulse rounded-full bg-[#d6d6d6] px-6 py-2"></div>
              <div className="w-15 ml-5 animate-pulse rounded-full bg-[#d6d6d6] px-10 py-2"></div>
            </div>
            <div className="flex flex-row justify-between"></div>
          </div>

          <div className="absolute left-0 right-0 top-[56px] h-[32px] overflow-auto overflow-y-hidden bg-[#007091]"></div>
        </div>
        <div className="mt-[32px]">
          <div className="relative">
            <div
              id="view-bar-container"
              className="absolute left-0 right-0 top-0 flex h-[44px] w-full flex-none flex-row justify-between border-b bg-white text-black"
            >
              <div className="ml-3 flex flex-row items-center justify-between gap-2">
                <div className="animate-pulse rounded-full bg-[#e0e0e0] px-8 py-2"></div>
                <div className="ml-4 flex flex-row gap-2">
                  <div className="animate-pulse rounded-full bg-[#e0e0e0] px-10 py-2"></div>
                  <div className="animate-pulse rounded-full bg-[#e0e0e0] px-10 py-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-[44px]"></div>
        <div className="flex h-[calc(100%-132px)] flex-col items-center justify-center">
          <div className="text-lg text-[#c0c0c0]">Loading this Base</div>
        </div>
      </main>
    </>
  );
};

export default BasePage;
