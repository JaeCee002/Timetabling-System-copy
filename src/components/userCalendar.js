import React, { useEffect, useState } from "react";
import MyCalendar from "./myCalendar";
import { fetchUserTimetable } from "../api/timetableAPI";
import UserAccount from "./UserAccount";
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

  return (
    <div style={{ position: "relative" }}>
      {/* Profile at top right */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        zIndex: 1000,
      }}>
        <UserAccount userRole="user" />
      </div>
      <MyCalendar events={entries} mode="user" />
    </div>
  );
}

export default UserCalendar;