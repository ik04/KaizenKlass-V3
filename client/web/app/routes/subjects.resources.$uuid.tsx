import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Dashboard } from "~/components/layout/dashboard";
import { AddSubjectResourceButton } from "~/components/subject_resources/addSubjectResourceButton";
import { SubjectResourceCard } from "~/components/subject_resources/subjectResourceCard";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/components/ui/use-toast";
import { BackButton } from "~/components/utils/backButton";
import { EmptyState } from "~/components/utils/emptyState";
import { GlobalContext } from "~/context/GlobalContext";

function sanitizeAndCapitalizeSlug(slug: string) {
  let sanitizedSlug = slug.toLowerCase();
  sanitizedSlug = sanitizedSlug.replace(/-/g, " ");
  sanitizedSlug = sanitizedSlug.replace(/[^\w\s]/g, "");
  sanitizedSlug = sanitizedSlug.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

  return sanitizedSlug;
}

export default function subjectsResources() {
  const { uuid, baseUrl }: { baseUrl: string; uuid: string } = useLoaderData();
  const { isAuthenticated, hasEditPrivileges, userUuid } =
    useContext(GlobalContext);
  const [resources, setResources] = useState<SubjectResource[]>([]);
  const [nextPage, setNextPage] = useState("");
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const callSubjectResources = async () => {
    const url = `${baseUrl}/api/v2/get/subjects/${uuid}/resources`;
    const resp = await axios.get(url);
    if (resp.data.subject_resources.data.length === 0) {
      setIsEmpty(true);
      setIsLoading(false);
    } else {
      setResources(resp.data.subject_resources.data);
      setNextPage(resp.data.subject_resources.next_page_url);
      setIsLoading(false);
    }
  };
  const callNextPage = async () => {
    const resp = await axios.get(nextPage);
    const newResources = resp.data.tests.data;
    setResources((prevResources) => [...prevResources, ...newResources]);
    setNextPage(resp.data.tests.next_page_url);
  };

  const deleteOwnResource = async (uuid: string) => {
    const url = `${baseUrl}/api/v2/delete/subject-resource/${uuid}`;
    const resp = await axios.delete(url);
    setResources((prevResources) =>
      prevResources.filter(
        (resource) => resource.subject_resource_uuid !== uuid
      )
    );
    toast({
      title: "Solution deleted!",
      description: `the solution has been deleted`,
    });
  };

  useEffect(() => {
    callSubjectResources();
  }, []);

  const handleAddResource = (resource: SubjectResource) => {
    setResources((prev) => [resource, ...prev]);
  };

  return (
    <div className="bg-main h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="header w-full h-20 mb-10 flex justify-between items-center text-5xl">
          <div className="font-display text-highlightSecondary mb-7 text-5xl w-full flex justify-between">
            <BackButton />
            <h2 className="font-display text-xl md:text-5xl text-highlightSecondary">
              {sanitizeAndCapitalizeSlug(uuid)}
            </h2>
          </div>
        </div>
        <div className="h-full">
          {!isLoading ? (
            <>
              {/* make add button and delete button only */}
              {isAuthenticated && (
                <div className="mb-7">
                  <AddSubjectResourceButton
                    subjectUuid={uuid}
                    handleAddResource={handleAddResource}
                    baseUrl={baseUrl}
                  />
                </div>
              )}
              {!isEmpty ? (
                <div className="flex flex-col space-y-7 mb-20">
                  {resources.map((resource) => (
                    <div className="flex items-center space-x-2">
                      <SubjectResourceCard
                        content={resource.content}
                        name={resource.name}
                        subject_resource_uuid={resource.subject_resource_uuid}
                        title={resource.title}
                        key={resource.subject_resource_uuid}
                        user_uuid={resource.user_uuid}
                        baseUrl={baseUrl}
                      />
                      {isAuthenticated && resource.user_uuid == userUuid && (
                        <img
                          src="/assets/trash.png"
                          onClick={() =>
                            deleteOwnResource(resource.subject_resource_uuid)
                          }
                          className="w-12 md:w-5"
                          alt=""
                        />
                      )}
                    </div>
                  ))}
                  {nextPage != null && (
                    <div className="load-more flex mb-20 justify-center items-center cursor-pointer">
                      <div
                        className="uppercase hover:text-dashboard hover:bg-highlightSecondary duration-150 font-base text-highlightSecondary border-highlightSecondary border-2 w-[40%] flex justify-center items-center text-2xl p-2"
                        onClick={callNextPage}
                      >
                        load more
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState />
              )}
            </>
          ) : (
            <>
              {" "}
              <div className="flex flex-col space-y-7">
                <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
                <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
                <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
                <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
              </div>
            </>
          )}
        </div>
      </Dashboard>
    </div>
  );
}

export const loader = async ({ params }: any) => {
  const { uuid } = params;
  const baseUrl: string = process.env.PUBLIC_DOMAIN || "";
  const data = {
    uuid,
    baseUrl,
  };
  return data;
};

export const meta: MetaFunction<typeof loader> = ({ data }: { data: any }) => {
  const { uuid } = data;
  return [
    { title: `${sanitizeAndCapitalizeSlug(uuid)} | Resources` },
    {
      property: "og:title",
      content: `${sanitizeAndCapitalizeSlug(uuid)} | Resources`,
    },
    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
  ];
};
