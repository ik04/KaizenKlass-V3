import { Link, useLoaderData } from "@remix-run/react";
import { BackButton } from "~/components/utils/backButton";
import { Dashboard } from "~/components/layout/dashboard";

function sanitizeAndCapitalizeSlug(slug: string) {
  let sanitizedSlug = slug.toLowerCase();
  sanitizedSlug = sanitizedSlug.replace(/-/g, " ");
  sanitizedSlug = sanitizedSlug.replace(/[^\w\s]/g, "");
  sanitizedSlug = sanitizedSlug.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );

  return sanitizedSlug;
}

export default function subjectPage() {
  const {
    baseUrl,
    uuid,
  }: {
    baseUrl: string;
    uuid: string;
  } = useLoaderData();
  const sections = [
    {
      name: "assignments",
      href: `/subjects/assignments/${uuid}`,
      img: "/assets/assignments.svg",
    },
    { name: "tests", href: `/subjects/tests/${uuid}`, img: "/assets/exam.png" },
    // {
    //   name: "syllabus",
    //   href: `/subjects/syllabus/${uuid}`,
    //   img: "/assets/syllabus.svg",
    // },
    {
      name: "resources",
      href: `/subjects/resources/${uuid}`,
      img: "/assets/resources.png",
    },
  ];
  return (
    <div className="bg-main h-screen">
      <Dashboard baseUrl={baseUrl}>
        <div className="flex justify-between">
          <BackButton />
          <h1 className="font-display text-end md:text-5xl text-highlightSecondary">
            {sanitizeAndCapitalizeSlug(uuid)}
          </h1>
        </div>
        <div className="flex md:flex-row flex-col md:flex-wrap md:basis-2/4 md:h-[80%] h-[82%] space-y-4 md:space-y-0 md:space-x-4 my-10">
          {sections.map((section) => (
            <Link
              to={section.href}
              className="text-highlightSecondary bg-mainLighter flex-1 rounded-3xl flex flex-col justify-center items-center space-y-5 hover:border hover:border-highlight duration-75"
            >
              <img src={section.img} className="w-12 md:w-16" alt="" />
              <h1 className="font-base capitalize font-bold text-xl md:text-3xl">
                {section.name}
              </h1>
            </Link>
          ))}
        </div>
      </Dashboard>
    </div>
  );
}

export const loader = async ({ params }: any) => {
  const { uuid } = params;
  const data = {
    baseUrl: process.env.PUBLIC_DOMAIN,
    uuid: uuid,
  };
  return data;
};
