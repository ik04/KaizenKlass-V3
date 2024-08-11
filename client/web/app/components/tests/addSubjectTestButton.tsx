import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { SelectItem } from "@radix-ui/react-select";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "@remix-run/react";
import Calendar from "react-calendar";
import { formatDate } from "node_modules/react-calendar/dist/esm/shared/dateFormatter";
import { format } from "date-fns";
import { testTitles } from "~/data/constants";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

export const AddSubjectTestButton = ({
  baseUrl,
  uuid,
  handleAddTest,
}: {
  baseUrl: string;
  uuid: string;
  handleAddTest: (test: Test) => void;
}) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [date, setDate] = useState<Date | null>(null);
  const [isDatePicked, setIsDatePicked] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const addTest = async () => {
    try {
      if (title) {
        let combinedDeadline = null;
        if (date) {
          const deadlineDateTime = new Date(date);
          deadlineDateTime.setHours(23);
          deadlineDateTime.setMinutes(0);
          deadlineDateTime.setSeconds(0); // Ensure seconds are set to 0

          combinedDeadline = format(deadlineDateTime, "yyyy-MM-dd HH:mm:ss");
          console.log(combinedDeadline);
        }
        const resp = await axios.post(`${baseUrl}/api/v2/add/test`, {
          title,
          subject_uuid: uuid,
          exam_date: combinedDeadline,
        });
        toast({
          title: "Assignment Added!",
          description: `${title} has been added to the assignments`,
        });
        handleAddTest(resp.data.test);
        resetFields();
      } else {
        toast({
          title: "Required fields",
          variant: "destructive",
          description: `Add title`,
        });
      }
    } catch (error: any) {
      console.log(error.response);

      if (error.response && error.response.status === 400) {
        toast({
          title: "Error",
          description: error.response.data.error,
          variant: "destructive",
        });
      }
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
      setIsDatePicked(true);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setDate(value[0]);
      setIsDatePicked(true);
    }
  };

  const resetFields = () => {
    setSubject("");
    setTitle("");
    setDate(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <div className="h-32 flex rounded-2xl flex-col items-start justify-center border-dashed border-2 hover:border-highlight border-mainLighter duration-200 transition-all space-y-3 px-5">
          <p className="font-base text-highlightSecondary text-3xl">Add Test</p>
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="font-base flex flex-col space-y-1 md:block overflow-hidden">
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
        <div className="flex space-x-4 items-center">
          <div
            onClick={resetFields}
            className="hover:text-dashboard text-highlightSecondary text-xs md:text-base border border-highlightSecondary duration-150 cursor-pointer hover:bg-highlightSecondary w-[15%] justify-center items-center flex p-1 font-base"
          >
            Reset
          </div>
          <DialogClose>
            <div
              onClick={addTest}
              className="hover:text-dashboard w-full text-highlightSecondary text-xs md:text-base border border-highlightSecondary duration-150 cursor-pointer hover:bg-highlightSecondary  justify-center items-center flex p-1 font-base"
            >
              Submit
            </div>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
