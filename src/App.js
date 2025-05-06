import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import { Modal, Button, Form } from 'react-bootstrap'; // Import Bootstrap modal
import "./App.css";

function App() {
  const [events, setEvents] = useState([]); // Shared state for calendar events
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedEvent, setSelectedEvent] = useState(null); // State to store the event being edited
  const [availableClasses] = useState(["Classroom A", "Classroom B", "Classroom C"]); // Example classes
  const [availableLecturers] = useState(["Dr. Smith", "Prof. Johnson", "Ms. Lee"]); // Example lecturers
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");

  // Function to add a new event
  const addEvent = (event) => {
    setSelectedEvent(event); // Store the dropped event
    setShowModal(true); // Show the modal
  };

  // Function to handle modal submission
  const handleModalSubmit = () => {
    if (selectedEvent) {
      const updatedEvent = {
        ...selectedEvent,
        class: selectedClass,
        lecturer: selectedLecturer,
      };
      setEvents((prevEvents) => [...prevEvents, updatedEvent]); // Update the events list
    }
    setShowModal(false); // Close the modal
    setSelectedClass(""); // Reset the selected class
    setSelectedLecturer(""); // Reset the selected lecturer
  };

  return (
    <div className='Container' style={{ display: 'flex' }}>
      {/* Sidebar for draggable events */}
      <Sidebar />

      {/* Calendar to drop events */}
      <MyCalendar events={events} onEventAdd={addEvent} />

      {/* Modal for selecting class and lecturer */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Assign Class and Lecturer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formClass">
              <Form.Label>Select Classroom</Form.Label>
              <Form.Control
                as="select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">-- Select a Classroom --</option>
                {availableClasses.map((cls, index) => (
                  <option key={index} value={cls}>
                    {cls}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formLecturer" className="mt-3">
              <Form.Label>Select Lecturer</Form.Label>
              <Form.Control
                as="select"
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
              >
                <option value="">-- Select a Lecturer --</option>
                {availableLecturers.map((lecturer, index) => (
                  <option key={index} value={lecturer}>
                    {lecturer}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalSubmit}>
            Assign
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
