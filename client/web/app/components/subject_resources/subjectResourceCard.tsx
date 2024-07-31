import { Link } from "@remix-run/react";
import axios from "axios";
import React, { useContext } from "react";
import { GlobalContext } from "~/context/GlobalContext";
import { toast } from "../ui/use-toast";

export const SubjectResourceCard = ({
  content,
  name,
  subject_resource_uuid,
  title,
  user_uuid,
  baseUrl,
}: SubjectResource & { baseUrl: string }) => {
  const { isAuthenticated, userUuid } = useContext(GlobalContext);
  const isMobileViewport =
    typeof window !== "undefined" && window.innerWidth < 768;
  const truncatedTitle = title.length > 10 ? title.slice(0, 10) + "..." : title;

  return (
    <Link
      target="_blank"
      to={content}
      className="bg-mainLighter w-full h-32 flex flex-col justify-center rounded-2xl hover:border-highlight border border-mainLighter duration-150 transition-all p-5"
    >
      <Link
        target="_blank"
        to={content}
        className="flex items-center justify-between w-full"
      >
        <div className="flex flex-col font-base space-y-1">
          <h2 className="text-highlightSecondary md:text-4xl text-2xl capitalize">
            {!isMobileViewport ? title : title}
          </h2>
          <p className="text-highlight">Posted by {name.toUpperCase()}</p>
        </div>
        <img src="/assets/folder.png" className="md:w-12 w-8" alt="" />
      </Link>
    </Link>
  );
};
