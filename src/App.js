import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import { Modal, Button} from 'react-bootstrap';
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");

  const lecturers = ["Dr. Banda", "Mr. Zulu", "Prof. Phiri", "Ms. Mwansa", "Mr. Chanda", "Dr. Kafwimbi", "Prof. Mbewe", "Ms. Chibale"];
  const classrooms = ["C 208", "C 301", "C 302", "C 303","C 305","C 306","C 307","C 308"];

  const handleEventAdd = (event) => {
    setCurrentEvent(event);
    setShowModal(true);
  };
  
  const handleEventDelete = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleModalSubmit = () => {
    const updatedEvent = {
      ...currentEvent,
      title: `${currentEvent.title}\n(${selectedLecturer}, ${selectedClassroom})`,
    };
    setEvents(prev => [...prev, updatedEvent]);

    // Reset
    setSelectedLecturer("");
    setSelectedClassroom("");
    setShowModal(false);
  };

  return (
    <div className='Container' style={{ display: 'flex' }}>
      <Sidebar />
      <MyCalendar events={events} onEventAdd={handleEventAdd} onEventDelete={handleEventDelete} />

      {/* Modal for assigning lecturer and class */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered dialogClassName="dark-modal" size="sm">
        <Modal.Header closeButton className="bg-dark text-white border-0">
          <Modal.Title>Assign Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          <div className="hover-select-container">
            <div className="hover-label">Lecturer</div>
            <div className="hover-select">
              {lecturers.map((lec, i) => (
                <div
                  key={i}
                  className={`dropdown-item text-white ${lec === selectedLecturer ? 'active' : ''}`}
                  onClick={() => setSelectedLecturer(lec)}
                >
                  {lec}
                </div>
              ))}
            </div>
            <div className="selected-option">{selectedLecturer || "Hover to select"}</div>
          </div>

          <div className="hover-select-container mt-4">
            <div className="hover-label">Classroom</div>
            <div className="hover-select">
              {classrooms.map((room, i) => (
                <div
                  key={i}
                  className={`dropdown-item text-white ${room === selectedClassroom ? 'active' : ''}`}
                  onClick={() => setSelectedClassroom(room)}
                >
                  {room}
                </div>
              ))}
            </div>
            <div className="selected-option">{selectedClassroom || "Hover to select"}</div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
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
  );
}

export default App;
