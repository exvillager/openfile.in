import React from "react";
import * as spinners from "react-spinners";

const ClipLoader = (spinners as any).ClipLoader || spinners.ClipLoader;

function Spinner({ size = 14, color = "white" }: { size?: number; color?: string }) {
  return (
    <div className="h-full flex justify-center items-center">
      <ClipLoader color={color} size={size} />
    </div>
  );
}

export default React.memo(Spinner);
