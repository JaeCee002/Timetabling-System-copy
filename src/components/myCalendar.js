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
          // Pass raw dropped event to onEventAdd
          onEventAdd({
            title: info.event.title,
            date: info.event.startStr,
            start: info.event.start,
          });

          // Remove the temp event (it'll be replaced after modal)
          info.event.remove();
        }}
      />
    </div>
  );
}

export default MyCalendar;
