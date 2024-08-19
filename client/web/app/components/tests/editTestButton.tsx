import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import axios from "axios";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { toast } from "../ui/use-toast";
import { testTitles } from "~/data/constants";

export const EditTestButton = ({
  baseUrl,
  handleEditTest,
  test,
}: {
  baseUrl: string;
  handleEditTest: (test: Test) => void;
  test: Test;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subject, setSubject] = useState<string>(test.subject_uuid);
  const [title, setTitle] = useState<string>(test.title);
  const [date, setDate] = useState<Date | null>(null);

  type ValuePiece = Date | null;

  type Value = ValuePiece | [ValuePiece, ValuePiece];

  const getSubjects = async () => {
    const url = `${baseUrl}/api/v2/get/selected-subjects/all`;
    const resp = await axios.get(url);
    setSubjects(resp.data.selected_subjects);
  };
  useEffect(() => {
    getSubjects();
  }, []);
  const updateTest = async () => {
    try {
      let combinedDeadline = null;
      if (date) {
        const deadlineDateTime = new Date(date);
        deadlineDateTime.setHours(8);
        deadlineDateTime.setMinutes(0);
        deadlineDateTime.setSeconds(0); // Ensure seconds are set to 0
        combinedDeadline = format(deadlineDateTime, "yyyy-MM-dd HH:mm:ss");
        console.log(combinedDeadline);
      }

      const resp = await axios.put(
        `${baseUrl}/api/v2/update/test/${test.test_uuid}`,
        { title: title, subject_uuid: subject, exam_date: combinedDeadline }
      );
      toast({
        title: "Test Updated",
      });
      handleEditTest(resp.data.test);
      setOpen(false);
    } catch (error: any) {
      console.log(error.response);

      if (error.response && error.response.status === 422) {
        const errors = error.response.data.errors;

        if (errors) {
          let errorMessages = "";

          for (const [key, value] of Object.entries(errors)) {
            // Iterate through each error message for a specific key
            if (Array.isArray(value)) {
              errorMessages += `${key}: ${value.join(", ")}\n`;
            }
          }

          toast({
            title: "Invalid Fields Inputs",
            description: errorMessages.trim(),
            variant: "destructive",
          });
        } else {
          console.error("Unexpected error:", error);
        }
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };
  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setDate(value[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="">
        <img src="/assets/pencil.png" className="w-7" alt="" />
      </DialogTrigger>
      <DialogContent>
        <div className="font-base flex flex-col space-y-2">
          <Label>Subject</Label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            name=""
            className="py-2 my-2 bg-white text-sm rounded-sm"
            id=""
          >
            <option value="" className="text-[#737373]" disabled selected>
              Select Subject
            </option>
            {subjects.map((subject) => (
              <option className="p-4" value={subject.subject_uuid}>
                {subject.subject}
              </option>
            ))}
          </select>
          <div className="flex flex-col">
            <Label>Title</Label>
            <select
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="py-2 my-2 bg-white text-sm rounded-sm"
            >
              <option value="" className="text-[#737373]" disabled selected>
                Select Title
              </option>
              {testTitles.map((test) => (
                <option value={test}>{test}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="">
              <Label>Exam Date</Label>
              <div className="bg-highlightSecondary rounded-md p-5 flex space-y-7 flex-col">
                <Calendar onChange={handleDateChange} value={date} />
                {date && (
                  <p className="text-sm">
                    Selected date: {format(date, "yyyy-MM-dd")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          onClick={updateTest}
          className="hover:text-dashboard text-xs md:text-base text-highlightSecondary border border-highlightSecondary duration-150 cursor-pointer hover:bg-highlightSecondary w-[15%] justify-center items-center flex p-1 font-base"
        >
          Update
        </div>
      </DialogContent>
    </Dialog>
  );
};
