import React from "react";
import MyCalendar from "./myCalendar";


function UserCalendar() {
  const fetchEvents = () => {
    // You can replace this with real data fetching
    return [
      {
        id: "1",
        title: "Math 101\n(Dr. Banda, C 208)",
        start: "2025-06-10T08:00:00",
        end: "2025-06-10T10:00:00",
        extendedProps: {
          lecturer: "Dr. Banda",
          classroom: "C 208"
        }
      },
      // more events...
    ];
  };

  const events = fetchEvents();

  return <MyCalendar events={events} mode="user" />;
}

export default UserCalendar;
