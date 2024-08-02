import React from "react";

interface Props {
  text: string;
}

export const Ribbon = ({ text }: Props) => {
  return (
    <div className="absolute top-11 right-4 transform translate-x-8 rotate-45 origin-top-right z-10">
      <div className="bg-green-500 text-white px-7 py-1 text-xs font-bold shadow-md">
        {text}
      </div>
    </div>
  );
};
