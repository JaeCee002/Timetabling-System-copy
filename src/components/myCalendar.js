import React, { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import "./myCalendar.css";

function MyCalendar({ events, onEventAdd }) {
  const calendarRef = useRef(null);

  useEffect(() => {
    let calendarEl = calendarRef.current;
    if (calendarEl) {
      new Draggable(calendarEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          return {
            title: eventEl.innerText,
          };
        },
      });
    }
  }, []);

  return (
    <div className="calendar">
      <h1>My Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        editable={true}
        selectable={true}
        droppable={true} // Enable external event dropping
        events={events} // Use shared events state
        eventReceive={(info) => {
          // Notify parent component about the new event
          onEventAdd({
            title: info.event.title,
            date: info.event.startStr, // The date the event was dropped on
          });
        }}
      />
    </div>
  );
}

export default MyCalendar;
