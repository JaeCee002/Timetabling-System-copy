import React, { useEffect, useState } from "react";
import MyCalendar from "./myCalendar";
import { fetchUserTimetable } from "../api/timetableAPI";
import { convertTimetableEntry } from "../utils/convertTimetableEntry";

function UserCalendar() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchUserTimetable()
      .then((data) => {
        const formatted = data
          .map(entry => convertTimetableEntry(entry))
          .filter(event => event !== null);

        setEntries(formatted);
      })
      .catch((err) => console.log("Fetch error:", err));
  }, []);

  return <MyCalendar events={entries} mode="user" />;
}

export default UserCalendar;