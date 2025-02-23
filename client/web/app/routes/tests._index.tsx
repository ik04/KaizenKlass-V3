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
import { MetaFunction, LoaderFunction } from "@remix-run/node";
import { TestCard } from "~/components/tests/testCard";
import { AddTestButton } from "~/components/tests/addTestButton";
import { Test, TestsResponse } from "~/types/api";

interface LoaderData {
  baseUrl: string;
  debug: string;
}

interface InfiniteLoaderData {
  callNextPage: () => Promise<void>;
  nextPage: string | null;
  length: number;
}

export default function Tests() {
  const { baseUrl, debug } = useLoaderData<LoaderData>();
  const { isAuthenticated, hasEditPrivileges } = useContext(GlobalContext);
  const [tests, setTests] = useState<Test[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleTestAddition = (test: Test) => {
    setTests([test, ...tests]);
  };

  const sanitizeUrl = (url: string | null): string | null => {
    if (!url) return null;
    return debug !== "true" ? url.replace("http://", "https://") : url;
  };

  const callTestsWithSubjects = async (): Promise<void> => {
    try {
      const url = isAuthenticated
        ? `${baseUrl}/api/v2/get/selected-subjects/tests?page=1`
        : `${baseUrl}/api/v2/get/tests?page=1`;

      const resp = await axios.get<TestsResponse>(url);

      if (resp.data.tests.data.length === 0) {
        setIsEmpty(true);
      } else {
        setTests(resp.data.tests.data);
        setNextPage(sanitizeUrl(resp.data.tests.next_page_url));
      }
      setIsLoading(false);
    } catch (err: unknown) {
      console.error("Error fetching tests:", err);
      setIsLoading(false);
    }
  };

  const callNextPage = async (): Promise<void> => {
    if (!nextPage) return;

    try {
      const resp = await axios.get<TestsResponse>(nextPage);
      const newTests = resp.data.tests.data;
      setTests((prevTests) => [...prevTests, ...newTests]);
      setNextPage(sanitizeUrl(resp.data.tests.next_page_url));
    } catch (err: unknown) {
      console.error("Error fetching next page:", err);
    }
  };

  useEffect(() => {
    callTestsWithSubjects();
  }, [isAuthenticated]);

  const infiniteLoaderData: InfiniteLoaderData = {
    callNextPage,
    nextPage,
    length: tests.length,
  };

  return (
    <div className="bg-main h-screen">
      <Dashboard baseUrl={baseUrl} infiniteLoaderData={infiniteLoaderData}>
        <div className="header w-full h-20 mb-10 flex justify-between items-center text-5xl">
          <div className="font-display text-highlightSecondary mb-7 text-5xl">
            Tests
          </div>
        </div>
        <div className="h-full">
          {!isLoading ? (
            <>
              {hasEditPrivileges && (
                <div className="mb-7">
                  <AddTestButton
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
                </div>
              ) : (
                <EmptyState />
              )}
            </>
          ) : (
            <div className="flex flex-col space-y-7">
              <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
              <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
              <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
              <Skeleton className="h-32 px-5 rounded-2xl bg-mainLighter" />
            </div>
          )}
        </div>
      </Dashboard>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    { title: "Tests | KaizenKlass" },
    { property: "og:title", content: "Tests | KaizenKlass" },
    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
  ];
};

export const loader: LoaderFunction = async () => {
  const baseUrl: string = process.env.PUBLIC_DOMAIN || "";
  const debug: string = process.env.DEBUG || "";
  return { baseUrl, debug };
};
