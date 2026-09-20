import { Suspense } from "react";

import Cities from "@/components/contents/home/cities";
import Hero from "@/components/contents/home/hero";
import { getCities } from "@/requests/get-cities";

export default async function Home() {
  const cities = await getCities({});

  return (
    <div className="flex min-h-dvh w-full flex-col items-center bg-primary-light">
      <Hero />
      <Suspense>
        <Cities cities={cities} />
      </Suspense>
    </div>
  );
}
