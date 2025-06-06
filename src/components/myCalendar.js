import React, { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { } from "@fullcalendar/interaction";
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from "react-bootstrap";
import "./myCalendar.css";

function MyCalendar({ events, onEventAdd, onEventDelete, onEventEdit }) {
  const calendarRef = useRef();
  const [alert, setAlert] = useState({ show: false, message: "", x: 0, y: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLecturer, setEditLecturer] = useState("");
  const [editClassroom, setEditClassroom] = useState("");

  const lecturers = [
    "Dr. Banda", "Mr. Zulu", "Prof. Phiri", "Ms. Mwansa",
    "Mr. Chanda", "Dr. Kafwimbi", "Prof. Mbewe", "Ms. Chibale"
  ];
  const classrooms = [
    "C 208", "C 301", "C 302", "C 303",
    "C 305", "C 306", "C 307", "C 308"
  ];

  // Hide alert after 2 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => setAlert({ ...alert, show: false }), 2000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Helper to show alert above event
  const showAlertAboveEvent = (info, message) => {
    const eventEl = info.el;
    if (eventEl) {
      const rect = eventEl.getBoundingClientRect();
      setAlert({
        show: true,
        message,
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 40
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

  // Handle event click
  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setEditLecturer(info.event.extendedProps?.lecturer || "");
    setEditClassroom(info.event.extendedProps?.classroom || "");
    setShowEventModal(true);
    setEditMode(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedEvent) {
      selectedEvent.remove();
      if (onEventDelete) onEventDelete(selectedEvent.id);
      setShowEventModal(false);
    }
  };

  // Handle edit save
  const handleEditSave = () => {
    if (selectedEvent) {
      selectedEvent.setProp(
        "title",
        `${selectedEvent.title.split('\n')[0]}\n(${editLecturer}, ${editClassroom})`
      );
      selectedEvent.setExtendedProp("lecturer", editLecturer);
      selectedEvent.setExtendedProp("classroom", editClassroom);
      setShowEventModal(false);
    }
  };

  return (
    <div className="container ms-10" style={{ marginLeft: '13rem', position: "relative" }}>
      {/* Alert Popup */}
      {alert.show && (
        <div className="delete-zone"
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
            minWidth: "220px",
          }}
        > 
          <span style={{ fontSize: "1.5rem", marginRight: "10px", color: "#b91c1c" }}>✖</span>
          {alert.message}
        </div>
      )}
      {/* Delete Zone
        Delete Zone
<div
  id="delete-zone"
  style={{
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "100px",
    height: "100px",
    backgroundColor: "#ffdddd",
    border: "2px dashed #ff0000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    fontSize: "50px",
    fontWeight: "bold",
    color: "#ff0000",
    zIndex: 2000
  }}
>
  <i className="bi bi-trash"></i>
</div> */}


      {/* Event Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? "Edit Event" : "Event Options"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editMode ? (
            <>
              <div>
                <strong>Title:</strong> {selectedEvent?.title.split('\n')[0]}
              </div>
              <div>
                <strong>Lecturer:</strong> {selectedEvent?.extendedProps?.lecturer || "Not set"}
              </div>
              <div>
                <strong>Classroom:</strong> {selectedEvent?.extendedProps?.classroom || "Not set"}
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Lecturer</label>
                <select
                  className="form-select"
                  value={editLecturer}
                  onChange={e => setEditLecturer(e.target.value)}
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((lec, i) => (
                    <option key={i} value={lec}>{lec}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Classroom</label>
                <select
                  className="form-select"
                  value={editClassroom}
                  onChange={e => setEditClassroom(e.target.value)}
                >
                  <option value="">Select Classroom</option>
                  {classrooms.map((room, i) => (
                    <option key={i} value={room}>{room}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!editMode ? (
            <>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
              <Button variant="primary" onClick={() => setEditMode(true)}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleEditSave}
                disabled={!editLecturer || !editClassroom}
              >
                Save
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          TIMETABLING SYSTEM
        </div>
        <div className="card-body">
          <div className="added-courses"></div>

<FullCalendar
            ref={calendarRef}
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
            eventClick={handleEventClick}
            eventDragStart={(info) => {
              // const trash = document.getElementById("delete-zone");
              // trash.classList.add("hovered");
            }}
            eventDragStop={(info) => {
              const calendarEl = calendarRef.current?.elRef?.current;
              if (!calendarEl) return;

              const calendarRect = calendarEl.getBoundingClientRect();
              const { clientX: x, clientY: y } = info.jsEvent;

              const insideCalendar =
                x >= calendarRect.left &&
                x <= calendarRect.right &&
                y >= calendarRect.top &&
                y <= calendarRect.bottom;

              if (!insideCalendar) {
                  const confirmDelete = window.confirm(`Delete "${info.event.title}"?`);
                  if (confirmDelete) {
                    const el = info.el;
                    el.classList.add("deleting");
                    setTimeout(() => {
                      info.event.remove();
                      if (onEventDelete) onEventDelete(info.event.id);
                    }, 300); // match animation duration
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
      </div>
    </div>
  );
}

export default MyCalendar;
