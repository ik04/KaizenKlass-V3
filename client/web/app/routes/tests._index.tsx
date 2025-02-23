import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AddTestButton } from "~/components/tests/addTestButton";
import { TestCard } from "~/components/tests/testCard";
import { Dashboard } from "~/components/layout/dashboard";
import { EmptyState } from "~/components/utils/emptyState";
import { GlobalContext } from "~/context/GlobalContext";
import { Skeleton } from "~/components/ui/skeleton";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Tests | KaizenKlass" },
    { property: "og:title", content: "Tests | KaizenKlass" },
    { property: "og:site_name", content: "Kaizen Klass" },
  ];
};

export default function TestsPage() {
  const { baseUrl, debug }: { baseUrl: string; debug: boolean } =
    useLoaderData();
  const { isAuthenticated, hasEditPrivileges } = useContext(GlobalContext);

  const [tests, setTests] = useState<Test[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [isLastPage, setIsLastPage] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleTestAddition = (test: Test) => {
    setTests((prev) => [test, ...prev]);
  };

  const sanitizeUrl = (url: string) => {
    if (!debug) {
      return url.replace("http://", "https://");
    }
    return url;
  };

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const url = isAuthenticated
        ? `${baseUrl}/api/v2/get/selected-subjects/tests?page=1`
        : `${baseUrl}/api/v2/get/tests?page=1`;

      const { data } = await axios.get(url);

      if (!data.tests.data.length) {
        setIsEmpty(true);
      } else {
        setTests(data.tests.data);
        setNextPage(
          data.tests.next_page_url
            ? sanitizeUrl(data.tests.next_page_url)
            : null
        );
        setIsLastPage(data.tests.next_page_url === null);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const callNextPage = async () => {
    if (!nextPage || isLastPage) return;

    try {
      const { data } = await axios.get(nextPage);

      if (!data.tests.data.length) {
        setIsLastPage(true);
      } else {
        setTests((prevTests) => [...prevTests, ...data.tests.data]);
        setNextPage(
          data.tests.next_page_url
            ? sanitizeUrl(data.tests.next_page_url)
            : null
        );
        setIsLastPage(data.tests.next_page_url === null);
      }
    } catch (err) {
      console.error("Error fetching next page:", err);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [isAuthenticated]);

  return (
    <div className="bg-main h-screen">
      <Dashboard
        baseUrl={baseUrl}
        infiniteLoaderData={{ callNextPage, nextPage, length: tests.length }}
      >
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
                      key={test.test_uuid}
                      test_uuid={test.test_uuid}
                      subject={test.subject}
                      exam_date={test.exam_date}
                      title={test.title}
                      subject_uuid={test.subject_uuid}
                    />
                  ))}
                  {nextPage && !isLastPage && (
                    <div
                      className="load-more flex mb-20 justify-center items-center cursor-pointer"
                      onClick={callNextPage}
                    >
                      <div className="uppercase hover:text-dashboard hover:bg-highlightSecondary duration-150 font-base text-highlightSecondary border-highlightSecondary border-2 w-[40%] flex justify-center items-center text-2xl p-2">
                        Load More
                      </div>
                    </div>
                  )}
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

export const loader = async () => {
  return {
    baseUrl: process.env.PUBLIC_DOMAIN || "",
    debug: process.env.DEBUG,
  };
};
