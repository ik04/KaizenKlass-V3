import React from "react";
import ogs from "open-graph-scraper";

export const OgImage = (url: string) => {
  const options = { url: url };
  ogs(options).then((data: any) => {
    console.log(data);
  });
  return <div></div>;
};
