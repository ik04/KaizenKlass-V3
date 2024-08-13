import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";

export const DeadlineCard = ({
  title,
  assignment_uuid,
  deadline,
  subject,
  subject_uuid,
}: {
  title: string;
  assignment_uuid: string;
  deadline?: string;
  subject: string;
  subject_uuid: string;
}) => {
  const [readableDeadline, setReadableDeadline] = useState<string>();
  const [isDanger, setIsDanger] = useState<boolean>(false);

  const calculateTimeUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDifference = deadlineDate.getTime() - now.getTime();

    const daysUntilDeadline = Math.floor(
      timeDifference / (1000 * 60 * 60 * 24)
    );
    const hoursUntilDeadline = Math.floor(
      (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutesUntilDeadline = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (daysUntilDeadline > 0) {
      setIsDanger(false);
      setReadableDeadline(
        `${daysUntilDeadline} day${
          daysUntilDeadline === 1 ? "" : "s"
        } ${hoursUntilDeadline} hour${hoursUntilDeadline === 1 ? "" : "s"}`
      );
    } else if (hoursUntilDeadline > 0) {
      setIsDanger(true);
      setReadableDeadline(
        `${hoursUntilDeadline} hour${
          hoursUntilDeadline === 1 ? "" : "s"
        } ${minutesUntilDeadline} min${minutesUntilDeadline === 1 ? "" : "s"}`
      );
    } else {
      setIsDanger(true);
      setReadableDeadline(`Passed On ${formatDate(deadlineDate)}`);
    }
  };

  function parseDateForIndia(dateString: string): string {
    const parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    };

    const formattedDate = parsedDate.toLocaleString("en-IN", options);
    return formattedDate;
  }

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    if (deadline != null) {
      calculateTimeUntilDeadline(deadline);
    }
  }, [deadline]);

  const isMobileViewport =
    typeof window !== "undefined" && window.innerWidth < 768;
  const truncatedTitle = title.length > 10 ? title.slice(0, 10) + "..." : title;

  return (
    <Link
      to={`/assignments/${assignment_uuid}`}
      className="bg-mainLighter h-32 flex rounded-2xl flex-col items-start justify-center hover:border-highlight border border-mainLighter duration-150 transition-all space-y-1 p-5"
    >
      <Link to={`/assignments/${assignment_uuid}`} className="">
        <h2 className="text-4xl font-base text-highlight">
          {!isMobileViewport ? title : truncatedTitle}
        </h2>
      </Link>
      {subject && subject_uuid && (
        <Link
          to={`/subjects/${subject_uuid}`}
          className="text-highlightSecondary font-base"
        >
          <div className="flex space-x-1">
            <p>{subject}</p>
            <img src="/assets/book.svg" alt="" />
          </div>
        </Link>
      )}
      {deadline != null && (
        <div
          className={`flex justify-between w-full text-sm md:text-base space-x-0 md:justify-start md:space-x-2 ${
            !isDanger ? "text-highlightSecondary" : "text-[#B13232]"
          } font-base`}
        >
          <p>{readableDeadline}</p>
          <p>{parseDateForIndia(deadline)}</p>
        </div>
      )}
    </Link>
  );
};
