import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import { About } from "~/components/landing/about";
import Contact from "~/components/landing/contact";
import { Landing } from "~/components/landing/landing";
import { useNavigate } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "KaizenKlass" },
    { property: "og:title", content: "KaizenKlass" },
    {
      name: "description",
      content:
        "a community of people who are willing to collaborate and help each other out with the ever pressing issue of assignments",
    },
    {
      property: "og:description",
      content:
        "a community of people who are willing to collaborate and help each other out with the ever pressing issue of assignments",
    },
    {
      property: "og:image",
      itemProp: "image",
      content: "https://kaizenklass.me/assets/meta.png",
    },
    {
      property: "og:image:width",
      content: "526",
    },
    {
      property: "og:image:height",
      content: "275",
    },
    {
      property: "og:site_name",
      content: "Kaizen Klass",
    },
  ];
};


export default function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      navigate("/subjects", { replace: true });
    }
  }, [navigate]);

  return (
    <main className="w-full min-h-screen">
      <Landing />
      <About />
      <Contact />
    </main>
  );
}
