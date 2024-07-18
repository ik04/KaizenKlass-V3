import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { AddAssignmentButton } from "~/components/addAssignmentButton";
import { AssignmentCard } from "~/components/assignmentCard";
import { BackButton } from "~/components/backButton";
import { Dashboard } from "~/components/dashboard";
import { EmptyState } from "~/components/emptyState";
import { GlobalContext } from "~/context/GlobalContext";
import Calendar from "react-calendar";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/components/ui/use-toast";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Tests | KaizenKlass" },
    { property: "og:title", content: "Tests | KaizenKlass" },
    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
    // <meta property="og:site_name" content="Site Name" />
  ];
};

export default function tests() {
  // const { assignments }: { assignments: Assignment[] } = useLoaderData();
  // ? directly set nextpage url?
  const { baseUrl }: { baseUrl: string } = useLoaderData();
  const { isAuthenticated, role, hasEditPrivileges } =
    useContext(GlobalContext);
  const [tests, setTests] = useState<Test[]>([]);
  const [nextPage, setNextPage] = useState("");
  const [isLastPage, setIsLastPage] = useState(true);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const callTestsWithSubjects = async () => {
    try {
      if (isAuthenticated) {
        // const url = `${baseUrl}/api/v2/get/tests?page=1`;
        const url = isAuthenticated
          ? `${baseUrl}/api/v2/get/selected-subjects/tests?page=1`
          : `${baseUrl}/api/v2/get/tests?page=1`;
        const resp = await axios.get(url);
        console.log(resp.data.tests);
        if (resp.data.tests.data.length === 0) {
          setIsEmpty(true);
          setIsLoading(false);
        } else {
          setTests(resp.data.tests.data);
          setIsLoading(false);
        }

        if (resp.data.tests.next_page_url === null) {
          setIsLastPage(true);
        } else {
          setNextPage(resp.data.tests.next_page_url);
          setIsLastPage(false);
        }
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

  return (
    <div className="bg-main h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="header w-full h-20 mb-10 flex justify-between items-center text-5xl">
          <div className="font-display text-highlightSecondary mb-7 text-5xl">
            Tests
          </div>
        </div>
      </Dashboard>
    </div>
  );
}

export const loader = async () => {
  const baseUrl: string = process.env.PUBLIC_DOMAIN || "";
  return { baseUrl };
};
