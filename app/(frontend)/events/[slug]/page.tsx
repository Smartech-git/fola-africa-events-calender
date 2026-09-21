import React from "react";

interface Props {
  params: Promise<{ slug: string }>;
}
export default async function Page({ params }: Props) {
  const { slug: _slug } = await params;

  return <div>page</div>;
}
