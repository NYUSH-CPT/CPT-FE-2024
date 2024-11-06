// /context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { requester } from '@/utils';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [group, setGroup] = useState(null);

  const loginUser = async () => {
    try {
      const response = await requester.get("/info");
      const groupData = response.data.group;
      setGroup(groupData);
      if (typeof window !== "undefined") { // Check if running in the browser
        localStorage.setItem("group", groupData); // Persist `group` in localStorage
      }
    } catch (error) {
      console.error("Error fetching group info:", error);
    }
  };

  const logoutUser = () => {
    setGroup(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("group");
    }
  };

  // Load `group` from localStorage on app startup, only on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedGroup = localStorage.getItem("group");
      if (storedGroup) {
        setGroup(storedGroup);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ group, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);