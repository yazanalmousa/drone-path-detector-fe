import { Button } from "@/components/ui/button";
import CaptureIcon from "@/assets/exportCapture.svg?react";
import LanguageIcon from "@/assets/languageIcon.svg?react";
import BillIcon from "@/assets/billIcon.svg?react";
import { Link } from "react-router-dom";

interface Props {
  logoSrc: string;
}

const Header = ({ logoSrc }: Props) => {
  return (
    <header className="bg-black border-b border-[#272727] px-6 h-[72px]">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center">
          <img src={logoSrc} alt="Logo" className="h-5 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#F9F9F9] hover:bg-transparent hover:cursor-pointer h-9 w-9"
          >
            <CaptureIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#F9F9F9] hover:bg-transparent hover:cursor-pointer h-9 w-9"
          >
            <LanguageIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#F9F9F9] hover:bg-transparent hover:cursor-pointer h-9 w-9"
          >
            <BillIcon />
          </Button>
          <div className="h-10 w-px bg-[#F9F9F9] mx-2" />
          <div className="text-right text-[#F9F9F9]">
            <div className="text-sm font-[700]">
              <span className="font-[400] ">Hello,</span> Mohammed Omar
            </div>
            <div className="text-xs text-[#748AA1]">Technical Support</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
