import React from "react";

interface Props {
  title: string;
}
export default function LabelTitle({ title }: Props) {
  return (
    <span className="group inline-block w-fit text-xs uppercase">
      <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
        [
      </span>
      {title}
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
        ]
      </span>
    </span>
  );
}
