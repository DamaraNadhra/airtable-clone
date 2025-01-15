import { MdOutlineTextFormat } from "react-icons/md";
import { LuLetterText } from "react-icons/lu";
import { PiUser } from "react-icons/pi";
import { TbCircleChevronDown } from "react-icons/tb";

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
    default:
      return <LuLetterText size={size ?? 17} />;
  }
};
