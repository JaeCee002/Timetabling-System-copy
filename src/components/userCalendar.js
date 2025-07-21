import React, { useEffect, useState } from "react";
import MyCalendar from "./myCalendar";
import { fetchUserTimetable } from "../api/timetableAPI";
import { convertTimetableEntry } from "../utils/convertTimetableEntry";

function UserCalendar() {
  const [entries, setEntries] = useState([]);
  console.log("Entries:", entries);

  useEffect(() => {
    console.log("UserCalendar mounted, fetching timetable...");
    fetchUserTimetable()
      .then((data) => {
        const formatted = data.entries
          .map(entry => convertTimetableEntry(entry))
          .filter(event => event !== null);

        setEntries(formatted);
      })
      .catch((err) => console.log("Fetch error:", err));
  }, []);

  return <MyCalendar events={entries} mode="user" />;
}

export default UserCalendar;