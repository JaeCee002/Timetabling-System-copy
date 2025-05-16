import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import AdminDashboard from './components/dash';
import { Modal, Button } from 'react-bootstrap';
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");

  const lecturers = [
    "Dr. Banda", "Mr. Zulu", "Prof. Phiri", "Ms. Mwansa",
    "Mr. Chanda", "Dr. Kafwimbi", "Prof. Mbewe", "Ms. Chibale"
  ];
  const classrooms = [
    "C 208", "C 301", "C 302", "C 303",
    "C 305", "C 306", "C 307", "C 308"
  ];

  // Handle adding a new event
  const handleEventAdd = (event) => {
    setCurrentEvent(event);
    setShowModal(true);
  };

  // Handle deleting an event
  const handleEventDelete = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Handle modal submission
  const handleModalSubmit = () => {
    if (!selectedLecturer || !selectedClassroom) return;
    const updatedEvent = {
      ...currentEvent,
      title: `${currentEvent.title}\n(${selectedLecturer}, ${selectedClassroom})`,
      extendedProps: {
        ...currentEvent.extendedProps,
        lecturer: selectedLecturer,
        classroom: selectedClassroom
      }
    };
    setEvents(prev => [...prev, updatedEvent]);
    setSelectedLecturer("");
    setSelectedClassroom("");
    setShowModal(false);
  };

  // Reset modal state on close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedLecturer("");
    setSelectedClassroom("");
    setCurrentEvent(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className='Container' style={{ display: 'flex' }}>
              <Sidebar />
              <MyCalendar
                events={events}
                onEventAdd={handleEventAdd}
                onEventDelete={handleEventDelete}
              />

              {/* Styled Modal for assigning lecturer and classroom */}
              <Modal show={showModal} onHide={handleModalClose} centered size="sm" dialogClassName="dark-modal">
                <Modal.Header closeButton className="bg-dark text-white border-0">
                  <Modal.Title>Assign Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                  {/* Lecturer Dropdown */}
                  <div className="custom-dropdown mb-4">
                    <div className="dropdown-label">Lecturer</div>
                    <div className="dropdown-selected" tabIndex={0}>
                      {selectedLecturer || "Select lecturer"}
                      <div className="dropdown-list">
                        {lecturers.map((lec, i) => (
                          <div
                            key={i}
                            className={`dropdown-item${lec === selectedLecturer ? " selected" : ""}`}
                            onClick={() => setSelectedLecturer(lec)}
                          >
                            {lec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Classroom Dropdown */}
                  <div className="custom-dropdown mb-2">
                    <div className="dropdown-label">Classroom</div>
                    <div className="dropdown-selected" tabIndex={0}>
                      {selectedClassroom || "Select classroom"}
                      <div className="dropdown-list">
                        {classrooms.map((room, i) => (
                          <div
                            key={i}
                            className={`dropdown-item${room === selectedClassroom ? " selected" : ""}`}
                            onClick={() => setSelectedClassroom(room)}
                          >
                            {room}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer className="bg-dark border-0">
                  <Button variant="secondary" onClick={handleModalClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleModalSubmit}
                    disabled={!selectedLecturer || !selectedClassroom}
                  >
                    Assign
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          }
        />
        <Route path="/dash" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;