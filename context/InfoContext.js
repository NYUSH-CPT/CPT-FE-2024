import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { requester } from "@/utils";

export const InfoContext = createContext();

export const InfoProvider = ({ children }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInfo = useCallback(async () => {
    try {
      const res = await requester.get("/info");
      setInfo(res.data);
    } catch (err) {
      console.error("fetchInfo failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem("access_token");
    if (token) {
      fetchInfo();
    } else {
      setLoading(false); 
    }
  }, [fetchInfo]);

  return (
    <InfoContext.Provider value={{ info, setInfo, loading, refresh: fetchInfo }}>
      {children}
    </InfoContext.Provider>
  );
};

export const useInfo = () => {
  const ctx = useContext(InfoContext);
  if (!ctx) throw new Error("useInfo must be used inside InfoProvider");
  return ctx;
};
