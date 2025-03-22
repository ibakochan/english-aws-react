import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [lvl, setLvl] = useState(0);
  const [petLevel, setPetLevel] = useState(0);
  const [activeClassroomId, setActiveClassroomId] = useState(null);
  const [activeClassroomName, setActiveClassroomName] = useState("");
  const [activity, setActivity] = useState("");
  const [isEnglish, setIsEnglish] = useState(null);
  const userClassrooms = currentUser?.student?.classrooms || currentUser?.teacher?.classrooms || [];

  const fetchCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axios.get("/api/users/current-user/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Fetched current user:", response.data);
      setCurrentUser(response.data);
      const level = Math.floor((response.data.total_eiken_score + response.data.total_numbers_score + response.data.total_phonics_score) / 50);
      setPetLevel(level)
      const user_level = Math.floor((response.data.total_max_scores) / 50);
      setLvl(user_level)

      const classrooms = response.data?.teacher?.classrooms || response.data?.student?.classrooms;
      if (classrooms?.length > 0) {
        setActiveClassroomId(classrooms[0].id);
        setActiveClassroomName(classrooms[0].name);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
      setError("Failed to fetch current user.");
    } finally {
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <UserContext.Provider       
      value={{
        currentUser,
        setCurrentUser,
        lvl,
        setLvl,
        petLevel,
        setPetLevel,
        activeClassroomId,
        setActiveClassroomId,
        activeClassroomName,
        setActiveClassroomName,
        userClassrooms,
        activity,
        setActivity,
        isEnglish, 
        setIsEnglish,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}