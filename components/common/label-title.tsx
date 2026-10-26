import React from "react";

interface Props {
  title: string;
}
export default function LabelTitle({ title }: Props) {
  return (
    <span className="group inline-block w-fit text-xs uppercase">{title}</span>
  );
}
