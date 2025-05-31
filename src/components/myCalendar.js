import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";
import bootstrap5Plugin from '@fullcalendar/bootstrap5'; // bootstrap5 version
import 'bootstrap/dist/css/bootstrap.min.css';
import {Trash} from 'react-bootstrap-icons';
import "./myCalendar.css";

function MyCalendar({ events, onEventAdd, onEventDelete }) {
  const calendarRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, message: "", x: 0, y: 0 });

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

  // Hide alert after 2 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ ...alert, show: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Helper to show alert above event
  const showAlertAboveEvent = (info, message) => {
    // Try to get event element's position
    const eventEl = info.el;
    if (eventEl) {
      const rect = eventEl.getBoundingClientRect();
      setAlert({
        show: true,
        message,
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 40 // 40px above event
      });
    } else {
      setAlert({
        show: true,
        message,
        x: window.innerWidth / 2 - 100,
        y: 100
      });
    }
  };

  return (
    <div className="container ms-10" style={{ marginLeft: '13rem', position: "relative" }}>
      {/* Alert Popup */}
      {alert.show && (
        <div
          style={{
            position: "absolute",
            left: alert.x,
            top: alert.y,
            zIndex: 2000,
            background: "#fff0f0",
            color: "#b91c1c",
            border: "2px solid #b91c1c",
            borderRadius: "8px",
            padding: "10px 18px 10px 14px",
            fontWeight: "bold",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            minWidth: "220px"
          }}
        >
          <span style={{ fontSize: "1.5rem", marginRight: "10px", color: "#b91c1c" }}>✖</span>
          {alert.message}
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          TIMETABLING SYSTEM
        </div>
        <div className="card-body">
          <div className="added-courses"></div>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, bootstrap5Plugin]}
            themeSystem="bootstrap5"
            initialView="timeGridWeek"
            editable={true}
            eventResizableFromStart={false}
            selectable={true}
            droppable={true}
            firstDay={1}
            allDaySlot={false}
            headerToolbar={{
              left: '',
              center: '',
              right: ''
            }}
            dayHeaderFormat={{
              weekday: 'short'
            }}
            eventDragStart={(info) => {
              const trash = document.getElementById("delete-zone");
              trash.classList.add("hovered");
            }}
            eventDragStop={(info) => {
              const trash = document.getElementById("delete-zone");
              trash.classList.remove("hovered");

              const rect = trash.getBoundingClientRect();
              const { clientX: x, clientY: y } = info.jsEvent;

              const inTrash =
                x >= rect.left &&
                x <= rect.right &&
                y >= rect.top &&
                y <= rect.bottom;

              if (inTrash) {
                if (window.confirm(`Delete event "${info.event.title}"?`)) {
                  info.event.remove();
                  if (onEventDelete) {
                    onEventDelete(info.event.id);
                  }
                }
              }
            }}
            eventResize={(info) => {
              // Restrict resizing to a maximum of 2 hours
              const start = info.event.start;
              const end = info.event.end;
              if (start && end) {
                const diffMs = end.getTime() - start.getTime();
                const maxDurationMs = 2 * 60 * 60 * 1000; // 2 hours in ms
                if (diffMs > maxDurationMs) {
                  info.revert(); // Cancel the resize
                  showAlertAboveEvent(info, "✖ Maximum allowed duration is 2 hours.");
                }
              }
            }}
            eventDrop={(info) => {
              // Also restrict moving events so they can't be extended beyond 2 hours
              const start = info.event.start;
              const end = info.event.end;
              if (start && end) {
                const diffMs = end.getTime() - start.getTime();
                const maxDurationMs = 2 * 60 * 60 * 1000; // 2 hours in ms
                if (diffMs > maxDurationMs) {
                  info.revert();
                  showAlertAboveEvent(info, "✖ Maximum allowed duration is 2 hours.");
                }
              }
            }}
            height={450}
            slotMinTime="06:00:00"
            slotMaxTime="21:00:00"
            slotDuration="00:30:00"
            expandRows={false}
            events={events}
            eventReceive={(info) => {
              const start = info.event.start;
              const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 hours

              onEventAdd({
                id: String(Date.now()),
                title: info.event.title,
                date: info.event.startStr,
                start: info.event.start,
                end
              });

              info.event.remove();
            }}
          />
        </div>
        <div id="delete-zone" className="delete-zone">
          <Trash size={28} />
        </div>
      </div>
    </div>
  );
}

export default MyCalendar;
