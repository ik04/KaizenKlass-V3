import axios from "axios";
import { toast } from "../ui/use-toast";

export const AddEndsemButton = ({
  baseUrl,
  uuid,
}: {
  baseUrl: string;
  uuid: string;
}) => {
  const addEndsemWithCts = async () => {
    try {
      const resp = await axios.post(
        `${baseUrl}/api/v2/add/test/endsem-with-cts/${uuid}`,
        {}
      );
      toast({
        title: "Assignment Added!",
        description: `End-sem has been added for this subject`,
      });
      location.reload();
    } catch (error: any) {
      if (error.response) {
        toast({
          title: "Error",
          description:
            error.response.data.error ||
            "Failed to add End-Sem. Please try again later.",
          variant: "destructive",
        });
      } else if (error.request) {
        toast({
          title: "Network Error",
          description:
            "Unable to connect to the server. Check your internet connection.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div
      className="bg-dashboard rounded-lg h-20 px-5 text-center text-highlightSecondary flex justify-start items-center hover:text-dashboard hover:bg-highlightSecondary duration-150 transition-all"
      onClick={addEndsemWithCts}
    >
      <p className="font-base  text-2xl">
        Add Hydrated Endsem For this subject
      </p>
    </div>
  );
};
