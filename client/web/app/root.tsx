import stylesheet from "~/tailwind.css";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { GlobalState } from "./context/GlobalState";
import axios from "axios";
import { Toaster } from "./components/ui/toaster";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

// Ensure Axios credentials are included
axios.defaults.withCredentials = true;

export default function App() {
  const { baseUrl } = useLoaderData<{ baseUrl: string }>();
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5217417672318463"
          crossOrigin="anonymous"
        ></script>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta />
        <Links />
      </head>
      <body>
        <GlobalState baseUrl={baseUrl}>
          <Toaster />
          <Outlet />
        </GlobalState>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export const loader = async () => {
  const baseUrl: string = process.env.PUBLIC_DOMAIN || "";
  return { baseUrl };
};
