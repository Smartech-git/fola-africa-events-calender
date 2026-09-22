import React from "react";

interface Props {
  title: string;
}
export default function Title({ title }: Props) {
  return (
    <div className="group w-fit text-xs uppercase">
      <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
        [
      </span>
      {title}
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
        ]
      </span>
    </div>
  );
}
