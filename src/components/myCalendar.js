import React, { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import bootstrap5Plugin from '@fullcalendar/bootstrap5'; // bootstrap5 version
import 'bootstrap/dist/css/bootstrap.min.css';
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
    
    <div className="container ms-10" style={{ marginLeft: '13rem' }}>
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          TIMETABLING SYSTEM
        </div>
    
    <div className="card-body">
    
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, bootstrap5Plugin]}
        themeSystem="bootstrap5"
        initialView="timeGridWeek"
        editable={true}
        eventResizableFromStart = {false}
        selectable={true}
        droppable={true} // Enable external event dropping
        firstDay={1}
        allDaySlot={false}
        headerToolbar={{
          left: '',
          center: '',
          right: ''
         }}
         dayHeaderFormat={{
          weekday: 'short'
          // month: 'short',
          // day: 'numeric'
        }}
         slotMinTime = "06:00:00"
         slotMaxTime = "21:00:00"
        events={events} // Use shared events state
        eventReceive={(info) => {
          // Pass raw dropped event to onEventAdd
          // onEventAdd({
          //   title: info.event.title,
          //   date: info.event.startStr,
          //   start: info.event.start,
          // });
          
            const start = info.event.start;
            const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 hours
          
            // Add new event with fixed 2-hour duration
            onEventAdd({
              title: info.event.title,
              date : info.event.startStr,
              start: info.event.start,
              
              end
            });

          // Remove the temp event (it'll be replaced after modal)
          info.event.remove();
        }}
      />
    </div>
  </div>
 </div>
  );
}

export default MyCalendar;
