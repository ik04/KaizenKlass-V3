import { useLoaderData } from "@remix-run/react";
import axios from "axios";
import Fuse from "fuse.js";
import React, { useContext, useEffect, useState } from "react";
import { BackButton } from "~/components/utils/backButton";
import { Dashboard } from "~/components/layout/dashboard";
import { SubjectSelectionCard } from "~/components/subjects/subjectSelectionCard";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "~/components/ui/use-toast";
import { GlobalContext } from "~/context/GlobalContext";

export default function selectSubject() {
  const { baseUrl }: { baseUrl: string } = useLoaderData();
  const { isAuthenticated } = useContext(GlobalContext);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

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
    const getSelectedSubjects = async () => {
      if (isAuthenticated) {
        const url = `${baseUrl}/api/v2/get/selected-subjects`;
        try {
          const resp = await axios.get(url);
          let selectedSubjectSlugs: string[] = [];
          const selectedSubjectsArray: Subject[] =
            resp.data.selected_subjects.data;
          selectedSubjectsArray.forEach((subject) => {
            selectedSubjectSlugs.push(subject.subject_uuid);
          });
          setSelectedSubjects((prevSelectedSubjects) => {
            return [...prevSelectedSubjects, ...selectedSubjectSlugs];
          });
          console.log(selectedSubjects);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    callSubjectsEndpoint();
    getSelectedSubjects();
  }, [baseUrl, isAuthenticated]);

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

  const handleToggle = async (uuid: string) => {
    try {
      if (selectedSubjects.includes(uuid)) {
        await axios.post(`${baseUrl}/api/v2/delete/selected-subject/${uuid}`);
        setSelectedSubjects((prevSelectedSubjects) =>
          prevSelectedSubjects.filter((id) => id !== uuid)
        );
      } else {
        await axios.post(`${baseUrl}/api/v2/add/selected-subject/`, {
          subject_uuid: uuid,
        });
        setSelectedSubjects((prevSelectedSubjects) => [
          ...prevSelectedSubjects,
          uuid,
        ]);
      }
    } catch (error) {
      console.error("Error updating selected subjects:", error);
    }
  };

  return (
    <div className="bg-main min-h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="">
          <BackButton />
          <h1 className="text-highlight font-display text-6xl py-4 capitalize text-center">
            Welcome to the Selection page
          </h1>
          <p className="font-base text-highlightSecondary text-center text-2xl">
            Please select or remove your subjects
          </p>
          <div className="">
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
                    {(searchQuery ? filteredSubjects : subjects).map(
                      (subject) => (
                        <div
                          key={subject.subject}
                          onClick={() => handleToggle(subject.subject_uuid)}
                          className={`md:m-8 my-8 ${
                            selectedSubjects.includes(subject.subject_uuid) &&
                            "border-2 border-highlight rounded-3xl"
                          }`}
                        >
                          <SubjectSelectionCard
                            subject={subject.subject}
                            uuid={subject.subject_uuid}
                          />
                        </div>
                      )
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
          </div>
        </div>{" "}
      </Dashboard>
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
