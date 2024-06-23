import { Link, useLoaderData } from "@remix-run/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Dashboard } from "~/components/dashboard";
import { SplashScreen } from "~/components/splashScreen";
import { SubjectCard } from "~/components/subjectCard";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import Fuse from "fuse.js";
import { MetaFunction } from "@remix-run/node";
import { GlobalContext } from "~/context/GlobalContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Subjects | KaizenKlass" },
    { property: "og:title", content: "Subjects | KaizenKlass" },
    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
    // <meta property="og:site_name" content="Site Name" />
  ];
};

export default function Subjects() {
  const { baseUrl }: { baseUrl: string } = useLoaderData();
  const { isAuthenticated } = useContext(GlobalContext);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [nextPage, setNextPage] = useState<string>("");

  useEffect(() => {
    const callSubjectsEndpoint = async () => {
      let url;
      if (isAuthenticated) {
        url = `${baseUrl}/api/v2/get/selected-subjects`;
        try {
          const resp = await axios.get(url);
          setSubjects(resp.data.selected_subjects.data);
          setNextPage(resp.data.selected_subjects.next_page_url);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      } else {
        url = `${baseUrl}/api/v2/get-subjects`;
        try {
          const resp = await axios.get(url);
          setSubjects(resp.data.subjects.data);
          setNextPage(resp.data.subjects.next_page_url);
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    callSubjectsEndpoint();
  }, [baseUrl, isAuthenticated]);

  const callNextPage = async () => {
    if (nextPage != null) {
      const resp = await axios.get(nextPage);
      const newSubs = resp.data.subjects.data;
      setSubjects((prevSubs) => [...prevSubs, ...newSubs]);
      setNextPage(resp.data.subjects.next_page_url);
    }
  };

  // * implement the search better, using the backend
  useEffect(() => {
    const filterSubjects = () => {
      if (!searchQuery) {
        setIsSearching(false);
        setFilteredSubjects(subjects);
        return;
      }

      const fuse = new Fuse(subjects, {
        keys: ["subject"],
      });

      const result = fuse.search(searchQuery);
      const filtered = result.map(({ item }) => item);
      setFilteredSubjects(filtered);
      setIsSearching(true);
    };

    filterSubjects();
  }, [searchQuery, subjects]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSearching(true);
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
  };

  return (
    <div className="bg-main min-h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="flex flex-col">
          {!isLoading && (
            <div className="flex items-center space-x-3 text-xl md:w-full">
              <Input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={handleInputChange}
                className="p-2 rounded-md font-base font-bold bg-highlightSecondary text-mainLighter"
              />
              {isSearching && (
                <p
                  onClick={clearSearch}
                  className="font-base font-extrabold text-highlightSecondary"
                >
                  X
                </p>
              )}
            </div>
          )}
          <div className="flex flex-col md:flex md:justify-center md:items-center md:flex-row md:flex-wrap md:w-full">
            {!isLoading ? (
              <>
                {(searchQuery ? filteredSubjects : subjects).map((subject) => (
                  <div key={subject.subject} className="md:m-8 my-8">
                    <SubjectCard
                      subject={subject.subject}
                      uuid={subject.subject_uuid}
                    />
                  </div>
                ))}
                <div className="md:m-8 my-8">
                  <Link
                    to={`/subjects/select`}
                    className="hover:border-highlight p-5 flex justify-between items-center md:p-2 border border-mainLighter md:w-80 md:h-80 rounded-3xl md:flex md:flex-col md:justify-center md:items-center md:space-y-5 bg-mainLighter transition-all"
                  >
                    <div className="font-base w-full text-highlightSecondary md:p-0 p-4 font-semibold text-center md:text-7xl">
                      +
                    </div>
                  </Link>
                </div>
                {nextPage != null && (
                  <div className="load-more flex mb-20 justify-center items-center cursor-pointer">
                    <div
                      className="uppercase hover:text-dashboard hover:bg-highlightSecondary duration-150 font-base text-highlightSecondary border-highlightSecondary border-2 flex justify-center items-center text-2xl p-2"
                      onClick={callNextPage}
                    >
                      load more
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {Array.from({ length: 12 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="p-5 mb-11 md:m-8 my-8 md:mb-14 h-28 md:p-2 border border-mainLighter md:w-80 md:h-80 rounded-3xl bg-mainLighter transition-all"
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </Dashboard>
    </div>
  );
}

// todo: make an actual dashboard with useful info to replace subjects page and make subjects page its own thing
// todo: handle server errors (get help)

export async function loader() {
  const data = {
    baseUrl: process.env.PUBLIC_DOMAIN,
  };
  console.log(process.env.PUBLIC_DOMAIN);
  return data;
}
