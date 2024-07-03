import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Dashboard } from "~/components/dashboard";

export default function tests() {
  const { baseUrl }: { baseUrl: string } = useLoaderData();

  return (
    <div className="bg-main min-h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="">
          <div className="font-display text-highlightSecondary mb-7 text-5xl">
            Tests
          </div>
        </div>
      </Dashboard>
    </div>
  );
}

export async function loader() {
  const data = {
    baseUrl: process.env.PUBLIC_DOMAIN,
  };
  console.log(process.env.PUBLIC_DOMAIN);
  return data;
}
