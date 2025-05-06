import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import { Modal, Button, Form } from 'react-bootstrap';
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
      <MyCalendar events={events} onEventAdd={handleEventAdd} />

      {/* Modal for assigning lecturer and class */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Lecturer and Classroom</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formLecturer">
              <Form.Label>Select Lecturer</Form.Label>
              <Form.Control
                as="select"
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
              >
                <option value="">Choose...</option>
                {lecturers.map((lec, i) => (
                  <option key={i} value={lec}>{lec}</option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="formClassroom" className="mt-3">
              <Form.Label>Select Classroom</Form.Label>
              <Form.Control
                as="select"
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                <option value="">Choose...</option>
                {classrooms.map((room, i) => (
                  <option key={i} value={room}>{room}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
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
