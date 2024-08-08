import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import Fuse from "fuse.js";
import { Skeleton } from "~/components/ui/skeleton";
import { SubjectSelectionCard } from "~/components/subjects/subjectSelectionCard";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/use-toast";
import { GlobalContext } from "~/context/GlobalContext";

export default function onboard() {
  const { baseUrl }: { baseUrl: string } = useLoaderData();
  const { isOnBoard } = useContext(GlobalContext);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const onboard = async () => {
    try {
      if (selectedSubjects.length == 0) {
        toast({
          title: "Please Select Subjects",
          description: "there are no subjects selected",
          variant: "destructive",
        });
        return;
      }
      const resp = await axios.post(`${baseUrl}/api/v2/onboard`, {
        subject_uuid: selectedSubjects,
      });
      toast({
        title: "Subjects Selected!",
        description: "You have been Onboarded!",
        variant: "default",
      });
      location.href = "/subjects";
    } catch (err) {}
  };

  useEffect(() => {
    const callSubjectsEndpoint = async () => {
      const url = `${baseUrl}/api/v1/get-subjects`;
      try {
        const resp = await axios.get(url);
        setSubjects(resp.data.subjects);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    callSubjectsEndpoint();
  }, [baseUrl]);

  useEffect(() => {
    console.log(isOnBoard);

    if (isOnBoard == 1) {
      location.href = "/subjects";
    }
  }, [isOnBoard]);

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

  const handleToggle = (uuid: string) => {
    setSelectedSubjects((prevSelectedSubjects) => {
      if (prevSelectedSubjects.includes(uuid)) {
        return prevSelectedSubjects.filter((id) => id !== uuid);
      } else {
        return [...prevSelectedSubjects, uuid];
      }
    });
  };
  return (
    <div className="bg-main min-h-screen">
      <h1 className="text-highlight font-display text-2xl md:text-6xl py-4 capitalize text-center px-2 md:px-0">
        Welcome to the onboarding page
      </h1>
      <p className="font-base text-highlightSecondary text-center text-sm md:text-2xl px-3 md:px-0">
        Please select your subjects to get started with using the site and track
        your subjects
      </p>
      <div className="flex flex-row-reverse">
        <div className="fixed h-[80%] text-highlightSecondary uppercase font-base justify-center flex flex-col mr-5 text-3xl space-y-5">
          <button onClick={() => setSelectedSubjects([])}>Clear All</button>
          <button
            onClick={onboard}
            className="bg-highlight text-main p-2 rounded-2xl"
          >
            Finish
          </button>
        </div>
        <div className="flex flex-col items-center">
          {!isLoading && (
            <div className="flex items-center space-x-3 text-xl md:w-[50%] mt-5">
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
                  className="font-base font-extrabold text-highlightSecondary cursor-pointer"
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
                  <div
                    key={subject.subject}
                    onClick={() => handleToggle(subject.subject_uuid)}
                    className={`md:m-8 md:px-0 px-4 my-8 ${
                      selectedSubjects.includes(subject.subject_uuid) &&
                      "border-2 border-highlight rounded-3xl"
                    }`}
                  >
                    <SubjectSelectionCard
                      subject={subject.subject}
                      uuid={subject.subject_uuid}
                    />
                  </div>
                ))}
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
      </div>
    </div>
  );
}

export async function loader() {
  const data = {
    baseUrl: process.env.PUBLIC_DOMAIN,
  };
  console.log(process.env.PUBLIC_DOMAIN);
  return data;
}
