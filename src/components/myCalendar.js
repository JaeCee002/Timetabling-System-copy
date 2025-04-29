import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./myCalendar.css"

function App() {
  return (
    <div className="calendar">
      <h1>My Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        editable = {true}
        selctable = {true}
        events={[
          { title: "Meeting", date: "2025-04-27" },
          { title: "Conference", date: "2025-04-28" }]}

          dateClick={(info)=>{
           //lert(`you clicked on ${info.dateStr}`);
          }}
          eventDrop={(info)=>{
           //alert(`event moved to ${info.event.start.toISOString().slice(0,10)}`);
          }}

      />
    </div>
  );
}

export default App;
