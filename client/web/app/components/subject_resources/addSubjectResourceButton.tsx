import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "../ui/use-toast";

export const AddSubjectResourceButton = ({
  subjectUuid,
  handleAddResource,
  baseUrl,
}: {
  subjectUuid: string;
  handleAddResource: (resource: SubjectResource) => void;
  baseUrl: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [content, setContent] = useState<string>();
  const [title, setTitle] = useState<string>();

  const addSubjectResource = async () => {
    const url = `${baseUrl}/api/v2/add/subject-resource`;
    const resp = await axios.post(url, {
      title,
      content,
      subject_uuid: subjectUuid,
    });
    handleAddResource(resp.data.subject_resource);
    setOpen(false);
    toast({
      title: "Resource Added!",
      description: `${title} has been added to the Subject Resources`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <div className="h-32 flex rounded-2xl flex-col items-start justify-center border-dashed border-2 hover:border-highlight border-mainLighter duration-200 transition-all space-y-3 px-5">
          <p className="font-base text-highlightSecondary text-3xl">
            Add Subject Resource
          </p>
        </div>
      </DialogTrigger>
      <DialogContent>
        <div className="">
          <Label>Title</Label>
          <Input
            placeholder="Title"
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <Label>Content</Label>
          <Input
            placeholder="Enter a valid link"
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <div
          onClick={addSubjectResource}
          className="hover:text-dashboard text-xs md:text-base text-highlightSecondary border border-highlightSecondary duration-150 cursor-pointer hover:bg-highlightSecondary w-[15%] justify-center items-center flex p-1 font-base"
        >
          Submit
        </div>
      </DialogContent>
    </Dialog>
  );
};
