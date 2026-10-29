import { FileText } from "lucide-react";
import React from "react";

function OpenfileLogo() {
  return (
    <div className="w-8 h-8 bg-[#FFD400] border-2 border-black rounded-md flex items-center justify-center shadow-[2px_2px_0px_0px_#111111]">
      <FileText className="w-4 h-4 text-black" strokeWidth={2.5} />
    </div>
  );
}

export default OpenfileLogo;
