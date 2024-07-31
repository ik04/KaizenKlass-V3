import { Link } from "@remix-run/react";
import axios from "axios";
import React, { useContext } from "react";
import { GlobalContext } from "~/context/GlobalContext";

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

  const deleteOwnResource = async (uuid: string) => {
    const url = `${baseUrl}/api/v2/delete/subject-resource/${subject_resource_uuid}`;
    const resp = await axios.delete(url);
  };
  return (
    <Link
      target="_blank"
      to={content}
      className="bg-mainLighter h-32 flex flex-col justify-center rounded-2xl hover:border-highlight border border-mainLighter duration-150 transition-all p-5"
    >
      <Link
        target="_blank"
        to={content}
        className="flex items-center justify-between w-full"
      >
        <div className="flex flex-col font-base space-y-1">
          <h2 className="text-highlightSecondary text-4xl capitalize">
            {!isMobileViewport ? title : truncatedTitle}
          </h2>
          <div className="flex items-center space-x-1">
            <p className="text-highlight">Posted by {name.toUpperCase()}</p>
            {isAuthenticated && userUuid == user_uuid && (
              <img
                src="/assets/trash.png"
                onClick={() => deleteOwnResource(subject_resource_uuid)}
                className="w-8 md:w-5"
                alt=""
              />
            )}
          </div>
        </div>
        <img src="/assets/folder.png" className="md:w-12 w-8" alt="" />
      </Link>
    </Link>
  );
};
