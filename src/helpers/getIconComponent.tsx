import { MdArrowRightAlt, MdOutlineTextFormat } from "react-icons/md";
import { LuLetterText } from "react-icons/lu";
import { PiUser } from "react-icons/pi";
import { TbCircleChevronDown } from "react-icons/tb";
import { AiOutlineNumber } from "react-icons/ai";

export const getIconComponent = (iconName: string, size?: number) => {
  switch (iconName) {
    case "MdOutlineTextFormat":
      return <MdOutlineTextFormat size={size ?? 17} />;
    case "LuLettertext":
      return <LuLetterText size={size ?? 17} />;
    case "PiUser":
      return <PiUser size={size ?? 17} />;
    case "TbCircleChevronDown":
      return <TbCircleChevronDown size={size ?? 17} />;
    case "AiOutlineNumber":
      return <AiOutlineNumber size={size ?? 17} />;
    default:
      return <LuLetterText size={size ?? 17} />;
  }
};

export const StringOrder = ({ order }: { order: string }) => {
  return (
    <div className="flex flex-row items-center gap-1">
      {order === "asc" ? (
        <>
          <span>A</span>
          <div>
            <MdArrowRightAlt size={12} />
          </div>
          <span>Z</span>
        </>
      ) : (
        <>
          <span>Z</span>
          <div>
            <MdArrowRightAlt size={12} />
          </div>
          <span>A</span>
        </>
      )}
    </div>
  );
};

export const NumberOrder = ({ order }: { order: string }) => {
  return (
    <div className="flex flex-row items-center gap-1">
      {order === "asc" ? (
        <>
          <span>1</span>
          <div>
            <MdArrowRightAlt size={12} />
          </div>
          <span>9</span>
        </>
      ) : (
        <>
          <span>9</span>
          <div>
            <MdArrowRightAlt size={12} />
          </div>
          <span>1</span>
        </>
      )}
    </div>
  );
};
