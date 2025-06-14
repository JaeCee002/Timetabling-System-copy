import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "./sidebar"
import MyCalendar from "./myCalendar"
import { Modal, Button } from "react-bootstrap";
import UserAccount from "./UserAccount";

function AdminCalendar(){

    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [selectedLecturer, setSelectedLecturer] = useState("");
    const [selectedClassroom, setSelectedClassroom] = useState("");
    const [draggedEvents, setDraggedEvents] = useState([]);

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

    // Handle updating an existing event (when moved/resized)
    const handleEventUpdate = (updatedEvent) => {
        setEvents(prev => prev.map(e => 
            e.id === updatedEvent.id ? updatedEvent : e
        ));
        
        // Also update in draggedEvents if it exists there
        setDraggedEvents(prev => prev.map(e => 
            e.id === updatedEvent.id ? {
                ...updatedEvent,
                title: updatedEvent.extendedProps?.originalTitle || updatedEvent.title.split('\n')[0],
                displayTitle: updatedEvent.extendedProps?.originalTitle || updatedEvent.title.split('\n')[0]
            } : e
        ));
    };

    // Handle deleting an event
    const handleEventDelete = (eventId) => {
        // Store current positions of all events before deletion
        setEvents(prev => {
            const eventToDelete = prev.find(e => e.id === eventId);
            if (!eventToDelete) return prev;
            
            // Filter out the deleted event while maintaining array structure
            const updatedEvents = prev.filter(e => e.id !== eventId);
            
            // Return the updated array
            return updatedEvents;
        });
        
        // Also remove from draggedEvents
        setDraggedEvents(prev => prev.filter(e => e.id !== eventId));
    };

    // Handle event deletion from calendar directly (for right-click delete, etc.)
    const handleEventRemove = (eventId) => {
        handleEventDelete(eventId);
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
                classroom: selectedClassroom,
                originalTitle: currentEvent.title
            }
        };
        
        // Check if this is an update to an existing event or a new event
        const existingEventIndex = events.findIndex(e => e.id === updatedEvent.id);
        
        if (existingEventIndex >= 0) {
            // Update existing event while preserving its current position/time
            setEvents(prev => prev.map(e => 
                e.id === updatedEvent.id ? {
                    ...e, // Keep existing position data (start, end, etc.)
                    title: updatedEvent.title,
                    extendedProps: updatedEvent.extendedProps
                } : e
            ));
        } else {
            // Add new event
            setEvents(prev => [...prev, updatedEvent]);
        }

        // Update draggedEvents
        setDraggedEvents(prev => {
            const existingIndex = prev.findIndex(e => e.id === updatedEvent.id);
            const draggedEventVersion = {
                ...updatedEvent,
                title: currentEvent.title,
                displayTitle: currentEvent.title
            };
            
            if (existingIndex >= 0) {
                // Update existing dragged event
                return prev.map(e => 
                    e.id === updatedEvent.id ? {
                        ...e, // Preserve position
                        title: currentEvent.title,
                        displayTitle: currentEvent.title,
                        extendedProps: updatedEvent.extendedProps
                    } : e
                );
            } else {
                // Add new dragged event
                return [...prev, draggedEventVersion];
            }
        });
        
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
        <div className="Container" style={{ display: "flex" }}>
        
        {/* Add this header */}
        <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            zIndex: 1000,
        }}>
            <UserAccount userRole="admin" />
        </div>
        
        <Sidebar />
        <MyCalendar
            events={events}
            onEventAdd={handleEventAdd}
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            onEventRemove={handleEventRemove}
            draggedEvents={draggedEvents}
            isAdmin={true}
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
    );
}

export default AdminCalendar;