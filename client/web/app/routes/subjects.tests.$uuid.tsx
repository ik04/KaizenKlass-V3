import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AddAssignmentButton } from "~/components/assignments/addAssignmentButton";
import { AssignmentCard } from "~/components/assignments/assignmentCard";
import { BackButton } from "~/components/utils/backButton";
import { Dashboard } from "~/components/layout/dashboard";
import { EmptyState } from "~/components/utils/emptyState";
import { GlobalContext } from "~/context/GlobalContext";
import Calendar from "react-calendar";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/components/ui/use-toast";
import { MetaFunction } from "@remix-run/node";
import { TestCard } from "~/components/tests/testCard";
import { AddTestButton } from "~/components/tests/addTestButton";
import { AddSubjectAssignmentButton } from "~/components/subjects/addSubjectAssignmentButton";
import { AddSubjectTestButton } from "~/components/tests/addSubjectTestButton";

function sanitizeAndCapitalizeSlug(slug: string) {
  let sanitizedSlug = slug.toLowerCase();
  sanitizedSlug = sanitizedSlug.replace(/-/g, " ");
  sanitizedSlug = sanitizedSlug.replace(/[^\w\s]/g, "");
  sanitizedSlug = sanitizedSlug.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

  return sanitizedSlug;
}

export default function subjectTests() {
  const { uuid, baseUrl }: { baseUrl: string; uuid: string } = useLoaderData();
  // ? directly set nextpage url?
  const { isAuthenticated, hasEditPrivileges } = useContext(GlobalContext);
  const [tests, setTests] = useState<Test[]>([]);
  const [nextPage, setNextPage] = useState("");
  const [isLastPage, setIsLastPage] = useState(true);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleTestAddition = (test: Test) => {
    setTests([test, ...tests]);
  };

  const callTestsWithSubjects = async () => {
    try {
      const url = `${baseUrl}/api/v2/get/subjects/${uuid}/tests?page=1`;
      const resp = await axios.get(url);
      if (resp.data.tests.data.length === 0) {
        setIsEmpty(true);
        setIsLoading(false);
      } else {
        setTests(resp.data.tests.data);
        setNextPage(resp.data.tests.next_page_url);
        setIsLoading(false);
      }
    } catch (err: any) {}
  };
  const callNextPage = async () => {
    const resp = await axios.get(nextPage);
    const newTests = resp.data.tests.data;
    setTests((prevTests) => [...prevTests, ...newTests]);
    setNextPage(resp.data.tests.next_page_url);
  };
  useEffect(() => {
    callTestsWithSubjects();
  }, [isAuthenticated]);

  useEffect(() => {
    console.log("Tests state updated:", tests);
  }, [tests]);

  return (
    <div className="bg-main h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="header w-full h-20 mb-10 flex justify-between items-center text-5xl">
          <div className="font-display text-highlightSecondary mb-7 text-5xl flex justify-between">
            <BackButton />
            <h2></h2>
          </div>
        </div>
        <div className="h-full">
          {!isLoading ? (
            <>
              {hasEditPrivileges && (
                <div className="mb-7">
                  <AddSubjectTestButton
                    uuid={uuid}
                    handleAddTest={handleTestAddition}
                    baseUrl={baseUrl}
                  />
                </div>
              )}
              {!isEmpty ? (
                <div className="flex flex-col space-y-7 mb-20">
                  {tests.map((test) => (
                    <TestCard
                      test_uuid={test.test_uuid}
                      subject={test.subject}
                      exam_date={test.exam_date}
                      title={test.title}
                      subject_uuid={test.subject_uuid}
                      key={test.test_uuid}
                    />
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
    { title: `${sanitizeAndCapitalizeSlug(uuid)} | Tests` },
    {
      property: "og:title",
      content: `${sanitizeAndCapitalizeSlug(uuid)} | Tests`,
    },
    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
  ];
};
