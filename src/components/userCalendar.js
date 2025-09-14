import React, { useEffect, useState } from "react";
import MyCalendar from "./myCalendar";
import { useAuth } from "./AuthContext";
import { fetchUserTimetable } from "../api/timetableAPI";
import UserAccount from "./UserAccount";
import { convertTimetableEntry } from "../utils/convertTimetableEntry";
import { printCalendarAsPDF } from "../utils/printTimetable";
import { Button } from "react-bootstrap";

function UserCalendar() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  console.log("Entries:", entries);

  useEffect(() => {
    fetchUserTimetable()
      .then((data) => {
        const formatted = data.entries.map(convertTimetableEntry).filter(Boolean);
        setEntries(formatted);
      })
      .catch((err) => console.log("Fetch error:", err));
  }, [user]);

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      {/* Profile at top right */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        zIndex: 1000,
      }}>
        <UserAccount userRole="user" />
      </div> 
      <div style={{
        position: "absolute",
        bottom: "10px",
        right: "20px",
        zIndex: 1000,
        display: "flex",
        gap: "10px"
      }}>
        <Button
          className=""
          variant="outline-success"
          onClick={() => printCalendarAsPDF('.fc')}
          disabled={entries.length === 0} // <-- Use entries, not events
        >
          <i className="bi bi-printer text-dark"> </i>
          Print Timetable
        </Button>
      </div>
      <MyCalendar events={entries} mode="user" />
    </div>
  );
}

export default UserCalendar;