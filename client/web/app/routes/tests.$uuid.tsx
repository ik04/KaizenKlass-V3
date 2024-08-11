import { Link, useLoaderData } from "@remix-run/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { BackButton } from "~/components/utils/backButton";
import { Dashboard } from "~/components/layout/dashboard";
import { AddSolutionButton } from "~/components/assignments/addSolutionButton";
import { GlobalContext } from "~/context/GlobalContext";
import { EditAssignmentButton } from "~/components/assignments/editAssignmentButton";
import { toast } from "~/components/ui/use-toast";
import { EditSolutionButton } from "~/components/assignments/editSolutionButton";
import { EditOwnSolutionButton } from "~/components/assignments/editOwnSolutionButton";
import { MetaFunction, redirect } from "@remix-run/node";
import { AddTestResourceButton } from "~/components/tests/addTestResourceButton";
import { EditTestResourceButton } from "~/components/tests/editTestResourceButton";
import { EditTestButton } from "~/components/tests/editTestButton";

export default function tests() {
  const {
    storedTest,
    resources,
    baseUrl,
    uuid,
    currentDomain,
  }: {
    storedTest: Test;
    resources: TestResource[];
    baseUrl: string;
    uuid: string;
    currentDomain: string;
  } = useLoaderData();
  const { userUuid, hasEditPrivileges, isAuthenticated, role } =
    useContext(GlobalContext);

  const handleAddResource = (resources: TestResource) => {
    setTestResources((prevResources) => [resources, ...prevResources]);
  };
  const handleEditAssignment = (assignment: Test) => {
    setTest(assignment);
  };

  const handleEditTestResource = (updatedResource: TestResource) => {
    setTestResources((prevResources: TestResource[]) =>
      prevResources.map((resource) =>
        resource.test_resource_uuid === updatedResource.test_resource_uuid
          ? updatedResource
          : resource
      )
    );
  };

  const [readableDeadline, setReadableDeadline] = useState<string>();
  const [isDanger, setIsDanger] = useState<boolean>(false);
  const [test, setTest] = useState<Test>(storedTest);
  const [testResources, setTestResources] = useState<TestResource[]>(resources);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const calculateTimeUntilDeadline = (deadline: string) => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const timeDifference = deadlineDate.getTime() - now.getTime();
      if (timeDifference <= 0) {
        setIsDanger(true);
        setReadableDeadline(`${formatDate(deadlineDate)}`);
        clearInterval(interval); // Stop the interval if deadline has passed
      } else {
        const daysUntilDeadline = Math.floor(
          timeDifference / (1000 * 60 * 60 * 24)
        );
        const hoursUntilDeadline = Math.floor(
          (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutesUntilDeadline = Math.floor(
          (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const secondsUntilDeadline = Math.floor(
          (timeDifference % (1000 * 60)) / 1000
        );

        if (daysUntilDeadline > 0) {
          setIsDanger(false);
          setReadableDeadline(
            `${daysUntilDeadline} day${
              daysUntilDeadline === 1 ? "" : "s"
            } ${hoursUntilDeadline} hour${
              hoursUntilDeadline === 1 ? "" : "s"
            } ${minutesUntilDeadline} min${
              minutesUntilDeadline === 1 ? "" : "s"
            } `
          );
        } else {
          setIsDanger(true);
          setReadableDeadline(
            `${hoursUntilDeadline} Hour${
              hoursUntilDeadline === 1 ? "" : "s"
            } ${minutesUntilDeadline} Min${
              minutesUntilDeadline === 1 ? "" : "s"
            } ${secondsUntilDeadline} Sec${
              secondsUntilDeadline === 1 ? "" : "s"
            }`
          );
        }
      }
    };

    if (test.exam_date) {
      const deadlineString = test.exam_date;
      calculateTimeUntilDeadline(deadlineString);
      if (new Date(deadlineString) > new Date()) {
        interval = setInterval(() => {
          calculateTimeUntilDeadline(deadlineString);
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [test.exam_date]);

  const deleteTest = async () => {
    try {
      const resp = await axios.delete(`${baseUrl}/api/v2/delete/test/${uuid}`);

      //   console.log("deleted assignment!");
      history.back();
    } catch (error) {
      toast({
        title: "Error Deleting Assignment",
        description: `An error occurred while deleting the solution`,
        variant: "destructive",
      });
      console.error(error);
    }
  };
  // ? limit to 1 answer per assignment
  // todo: add dates
  // todo: ideate on figma design for divisions

  function parseDateTimeForIndia(dateTimeString: string): string {
    const parsedDate = new Date(dateTimeString);

    if (isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    };

    const formattedDateTime = parsedDate.toLocaleString("en-IN", options);

    return formattedDateTime;
  }

  function convertLinksToAnchors(text: string, currentDomain: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, function (url) {
      if (url === currentDomain || url.startsWith(currentDomain + "/")) {
        return ` <a href="${url}" style="color: #D5CEA3; cursor: pointer; font-weight: bold;">Visit Source -></a>`;
      } else {
        return `<a href="${url}" style="color: #3A84CE; cursor: pointer;" target="_blank">${url}</a>`;
      }
    });
  }

  const deleteOwnResource = async (resourceUuid: string) => {
    try {
      const resp = await axios.delete(
        `${baseUrl}/api/v2/delete/test-resource/${resourceUuid}`
      );
      setTestResources((prevSolutions: TestResource[]) =>
        prevSolutions.filter(
          (solution) => solution.test_resource_uuid !== resourceUuid
        )
      );
      toast({
        title: "Resource deleted!",
        description: `the test resource has been deleted`,
      });
    } catch (error) {
      toast({
        title: "Error Request Failed",
        description: "An error occurred while deleting the test resource",
        variant: "destructive",
      });
      console.error("Error deleting solution:", error);
    }
  };
  const deleteSolution = async (solutionUuid: string) => {
    try {
      const { userUuid, hasEditPrivileges, isAuthenticated, role } =
        useContext(GlobalContext);

      const resp = await axios.delete(
        `${baseUrl}/api/v1/delete-solution/${solutionUuid}`
      );
      setTestResources((prevResources: TestResource[]) =>
        prevResources.filter(
          (resource) => resource.test_resource_uuid !== solutionUuid
        )
      );
      toast({
        title: "Solution deleted!",
        description: `the solution has been deleted`,
      });
      console.log("deleted solution!");
    } catch (error) {
      toast({
        title: "Error Request Failed",
        description: "An error occurred while deleting the solution",
        variant: "destructive",
      });
      console.error("Error deleting solution:", error);
    }
  };

  const convertToViewLink = (link: string) => {
    // Extracting the file ID from the download link
    const startIndex = link.indexOf("id=") + 3;
    const endIndex = link.length;
    const fileId = link.substring(startIndex, endIndex);
    // Constructing the view link
    const viewLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    return viewLink;
  };
  const handleEditTest = (test: Test) => {
    setTest(test);
  };
  // todo: finish solution components
  // todo: redo assignments page with new design
  return (
    <div className="bg-main h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="flex flex-col space-y-4 pb-5">
          {<BackButton />}
          <div className="md:flex md:justify-center md:items-center md:w-full">
            <div className="md:flex md:flex-col md:space-y-9 md:w-4/5">
              <div className="md:flex md:space-x-4 md:items-start">
                <div className="icon md:flex w-16 hidden justify-center p-3 items-center bg-mainLighter rounded-full">
                  <img
                    src="/assets/examIcon.png"
                    className="md:w-10"
                    alt="assignment"
                  />
                </div>
                <div className="assignment flex flex-col md:w-full space-y-1 md:space-y-0">
                  <div className="flex items-center justify-between">
                    <h1 className="text-highlight font-base text-2xl md:text-4xl">
                      {test.title}
                    </h1>
                    <div className="flex space-x-2">
                      {hasEditPrivileges && (
                        <EditTestButton
                          baseUrl={baseUrl}
                          test={test}
                          handleEditTest={handleEditTest}
                        />
                      )}

                      {hasEditPrivileges && (
                        <img
                          src="/assets/trash.png"
                          onClick={deleteTest}
                          className="w-7"
                          alt=""
                        />
                      )}
                    </div>
                  </div>
                  <a
                    href={`/subjects/${test.subject_uuid}`}
                    className="text-highlightSecondary text-start text-sm md:text-2xl font-base"
                  >
                    {test.subject}
                  </a>
                  {test.exam_date !== null && (
                    <div className="flex items-center justify-between">
                      <p className="text-highlightSecondary text-xs cursor-default font-base md:text-base transition-all duration-150 hover:text-red-500">
                        {test.exam_date &&
                          parseDateTimeForIndia(test.exam_date)}
                      </p>
                      <p
                        className={`${
                          !isDanger
                            ? "text-highlightSecondary font-light"
                            : "text-red-500 font-semibold"
                        } font-base font-bold md:text-3xl text-xs md:p-0`}
                      >
                        {readableDeadline}
                      </p>
                    </div>
                  )}{" "}
                </div>
              </div>
              <p className="md:hidden text-highlightSecondary font-base my-5">
                Solutions:assignment
              </p>
              <div className="solutions flex flex-col space-y-5 md:space-y-7">
                {testResources.map((resource) => (
                  <div className="md:flex md:space-x-4 md:items-start">
                    <div className="icon md:flex w-16 hidden justify-center p-3 items-center bg-mainLighter rounded-full">
                      <img
                        src="/assets/testResources.png"
                        className="md:w-16"
                        alt="lightbulb"
                      />
                    </div>
                    <div className="solution flex flex-col space-y-1 md:space-x-0 md:w-full w-[300px] break-words overflow-hidden whitespace-wrap overflow-ellipsis md:whitespace-normal md:overflow-visible md:text-overflow-clip">
                      <div className="flex justify-between">
                        <h1 className="text-highlightSecondary font-base text-xl md:text-2xl">
                          Posted by: {resource.username}
                        </h1>
                        <div className="flex space-x-3 items-start">
                          {isAuthenticated &&
                            userUuid == resource.user_uuid && (
                              <EditTestResourceButton
                                handleEditTestResource={handleEditTestResource}
                                baseUrl={baseUrl}
                                originalDescription={resource.description}
                                testResourceUuid={resource.test_resource_uuid}
                              />
                            )}

                          {isAuthenticated &&
                            userUuid == resource.user_uuid && (
                              <img
                                src="/assets/trash.png"
                                onClick={() =>
                                  deleteOwnResource(resource.test_resource_uuid)
                                }
                                className="w-5 md:w-7"
                                alt=""
                              />
                            )}
                        </div>
                      </div>
                      <div
                        className="text-highlight text-sm md:text-lg font-base whitespace-pre-line"
                        dangerouslySetInnerHTML={{
                          __html: convertLinksToAnchors(
                            resource.description,
                            currentDomain
                          ),
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        {resource.content && (
                          <a
                            href={`${resource.content}`}
                            className="flex items-center space-x-2"
                          >
                            <img
                              src="/assets/download.svg"
                              className="md:w-10"
                              alt=""
                            />
                            <p className="text-highlight font-base text-xs md:text-lg font-bold">
                              Download Content
                            </p>
                          </a>
                        )}
                        {resource.content && (
                          <a
                            target="_blank"
                            href={`${convertToViewLink(resource.content)}`}
                            className="flex items-center space-x-2"
                          >
                            <img
                              src="/assets/link.svg"
                              className="md:w-10"
                              alt=""
                            />
                            <p className="text-highlight font-base text-xs md:text-lg font-bold">
                              View Content
                            </p>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {isAuthenticated && (
                <div className="my-10">
                  <AddTestResourceButton
                    testResourceUuid={uuid}
                    handleTestResourceAddition={handleAddResource}
                    baseUrl={baseUrl}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Dashboard>
    </div>
  );
}

export const loader = async ({ params }: any) => {
  const { uuid } = params;
  try {
    const url = `${process.env.PUBLIC_DOMAIN}/api/v2/get/test/${uuid}`;
    const resp = await axios.get(url);
    const data = {
      resources: resp.data.resources,
      storedTest: resp.data.test,
      baseUrl: process.env.PUBLIC_DOMAIN,
      currentDomain: process.env.CURRENT_DOMAIN,
      uuid: uuid,
    };
    return data;
  } catch (error) {
    console.log(error);
    return redirect("/not-found");
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }: { data: any }) => {
  const { storedTest } = data;
  return [
    { title: `${storedTest.title} | ${storedTest.subject}` },
    {
      property: "og:title",
      content: `${storedTest.title} | ${storedTest.subject}`,
    },

    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
  ];
};
