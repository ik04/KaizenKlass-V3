import React, { ReactNode, useEffect, useState } from "react";
import { GlobalContext } from "./GlobalContext";
import axios from "axios";
import { redirect } from "@remix-run/react";

export const GlobalState = ({
  children,
  baseUrl,
}: {
  children: ReactNode;
  baseUrl?: string;
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(0);
  const [userUuid, setUserUuid] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasEditPrivileges, setHasEditPrivileges] = useState(false);
  const [isOnboard, setIsOnboard] = useState<number>(0);
  // ? should i rename this to name or keep as username
  const AdminRole = 0;
  const CrossCheckerRole = 1;

  const callUserData = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/api/v1/user-data`);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${resp.data.access_token}`;
      setIsOnboard(resp.data.is_onboard);
      setIsAuthenticated(true);
      setUsername(resp.data.name);
      setEmail(resp.data.email);
      setRole(resp.data.role);
      setUserUuid(resp.data.uuid);
      setIsAdmin(resp.data.role === AdminRole);
      setHasEditPrivileges(
        resp.data.role === AdminRole || resp.data.role === CrossCheckerRole
      );
      localStorage.setItem("isLoggedIn", "true");
    } catch (error) {}
  };

  useEffect(() => {
    const handleTabFocus = () => {
      const lastRefresh = localStorage.getItem("lastRefresh");
      const now = new Date().getTime();
      const fiveMinutes = 300000; // 5 minutes in milliseconds

      if (!lastRefresh || now - parseInt(lastRefresh) > fiveMinutes) {
        location.reload();
        localStorage.setItem("lastRefresh", now.toString());
      }
    };

    document.addEventListener("focus", handleTabFocus);

    return () => {
      document.removeEventListener("focus", handleTabFocus);
    };
  }, []);

  useEffect(() => {
    callUserData();
  }, []);

  const checkIsOnboard = () => {
    if (isAuthenticated && !(location.pathname === "/onboard")) {
      if (isOnboard == 0) {
        location.href = "/onboard";
      }
    }
  };

  useEffect(() => {
    checkIsOnboard();
  }, [isAuthenticated, checkIsOnboard]);

  return (
    <GlobalContext.Provider
      value={{
        isAuthenticated,
        role,
        username,
        userUuid,
        email,
        isSidebarExpanded,
        setSidebarExpanded,
        isAdmin,
        hasEditPrivileges,
        isOnBoard: isOnboard,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export async function loader() {
  return process.env.PUBLIC_DOMAIN;
}
