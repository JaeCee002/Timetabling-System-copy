import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "./sidebar"
import MyCalendar from "./myCalendar"
import { v4 as uuidv4 } from 'uuid';
import { Modal, Button } from "react-bootstrap";
import UserAccount from "./UserAccount";
import { fetchAdminTimetable, fetchLecturers, fetchClassrooms, checkClash } from "../api/timetableAPI";
import { convertTimetableEntry } from "../utils/convertTimetableEntry";
import { saveAdminTimetable } from "../api/timetableAPI";
import { useCalendarStore } from "./calendarStore";
import { useAuth } from "./AuthContext";



export default function AdminCalendar() {
    const calendarApi = useCalendarStore(state => state.calendarApi);
    const { isAuthenticated } = useAuth();
    // const calendarRef = useRef();


    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [lecturers, setLecturers] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedLecturer, setSelectedLecturer] = useState("");
    const [selectedClassroom, setSelectedClassroom] = useState("");
    const [draggedEvents, setDraggedEvents] = useState([]);

    const [school, setSchool] = useState(null);
    const [programId, setProgramId] = useState(null);
    const [program, setProgram] = useState(null);
    const [year, setYear] = useState(null);

    const [isClash, setIsClash] = useState(false);
    const [clashMessage, setClashMessage] = useState("");
    const [clashEvents, setClashEvents] = useState([]);



    useEffect(() => {
        if (!isAuthenticated) return;

        fetchLecturers()
            .then((data) => {
                const formatted = data.lecturers;
                setLecturers(formatted);
            })
            .catch(err => console.error("Lecturer fetch error:", err));

        fetchClassrooms()
            .then((data) => {
                const formatted = data.classes;
                setClassrooms(formatted);
            })
            .catch(err => console.error("Classroom fetch error:", err));
    }, [isAuthenticated]);

    useEffect(() => {
        if (!program || !year) return;

        fetchAdminTimetable(program, year)
            .then((data) => {
                const formatted = data.entries
                    .map(entry => convertTimetableEntry(entry))
                    .filter(e => e !== null);
                setEvents(formatted);
            })
            .catch(err => console.error("Admin timetable fetch error:", err));
    }, [program, year]);

    // Handle adding a new event
    const handleEventAdd = (event) => {
        const eventWithId = {
            ...event,
            id: uuidv4() // Add a unique ID to the event
        };
        setCurrentEvent(eventWithId);
        setShowModal(true);
    };

    // Handle updating an existing event (when moved/resized)
    const handleEventUpdate = async (updatedEvent) => {
        if (!selectedLecturer || !selectedClassroom || !currentEvent) return;

        const payload = {
            lecturer_id: selectedLecturer.user_id,
            room_id: selectedClassroom.room_id,
            day_of_week: currentEvent.start.toLocaleDateString("en-US", { weekday: "long" }),
            start_time: currentEvent.start.toTimeString().slice(0, 8),
            end_time: currentEvent.end.toTimeString().slice(0, 8)
        };

        const res = await checkClash(payload);

        if (res.status === "failure") {
                setClashMessage(res.message);
                setIsClash(true);
                setClashEvents(prev => [...prev, clashEvents]);
                alert(`Clash detected for ${currentEvent.title}: ${res.message}`);
            }

            // No clash
            setIsClash(false);
            setClashMessage("");
        
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

    //handle saving all events

    const hundleSaveAllEvents = async () => {
        try {
            if (!calendarApi) {
                alert("Calendar not ready");
                return;
            }
            // Validate required selections first
            if (!program || !year) {
                alert("Program and Year are empty");
                return;
            }

            const events = calendarApi.getEvents();
            console.log("📅 Events from calendar:", events);

            if (events.length === 0) {
                alert("There are no events to save");
                return;
            }

            // Format structure that matches the PHP backend 
            const entries = events.map(e => {
                const courseId = e.extendedProps?.course_id || e.title.split('\n')[0];
                const lecturerId = e.extendedProps?.lecturer_id;
                const roomId = e.extendedProps?.classroom;

                return {
                    course_id: courseId,
                    program_name: program,
                    year: parseInt(year),
                    day_of_week: e.start.toLocaleDateString("en-US", { weekday: "long" }),
                    start_time: e.start.toTimeString().slice(0, 8),
                    end_time: e.end.toTimeString().slice(0, 8),
                    room_id: roomId,
                    lecturer_id: lecturerId
                };
            });


            console.log("📤 Entries to be sent:", entries);

            // Validate required fields
            const invalidEntries = entries.filter(e =>
                !e.course_id || !e.program_name || !e.year ||
                !e.start_time || !e.end_time || !e.lecturer_id || !e.room_id
            );

            if (invalidEntries.length > 0) {
                console.log("❌ Invalid entries:", invalidEntries);
                alert(`${invalidEntries.length} events are missing required fields (lecturer or classroom). Please assign all events before saving.`);
                return;
            }

            if (clashEvents.length > 0) {
                alert(
                    "Cannot save. There are clashes:\n\n" +
                    clashEvents.map(c => `${c.title} at ${c.timeSlot}: ${c.message}`).join("\n")
                );
                return;
            }

            // Send the data with the correct structure
            const payload = {
                entries: entries,
                program_name: program,
                year: parseInt(year) // Ensure year is included and is a number
            };

            console.log("📤 Final payload:", payload);

            await saveAdminTimetable(payload);
            alert("Events saved successfully!");
        } catch (err) {
            console.error("❌ Failed to save events:", err);

            // Better error handling
            if (err.response?.data) {
                console.error("Server response:", err.response.data);
                alert(`Failed to save events: ${err.response.data.error || 'Server error'}`);
            } else {
                alert("Failed to save events. Please check the console for details.");
            }
        }
    };

    //Handle deleting an event
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

        // Remove from draggedEvents
        setDraggedEvents(prev => prev.filter(e => e.id !== eventId));
        
        // Remove any clash entries for this event
        setClashEvents(prev => prev.filter(e => e.eventId !== eventId));
    };

    // Handle event deletion from calendar directly (for right-click delete, etc.)
    const handleEventRemove = (eventId) => {
        handleEventDelete(eventId);
    };

    // Handle modal submission
    const handleModalSubmit = async () => {
        if (!selectedLecturer || !selectedClassroom || !currentEvent) return;

        const payload = {
            lecturer_id: selectedLecturer.user_id,
            room_id: selectedClassroom.room_id,
            day_of_week: currentEvent.start.toLocaleDateString("en-US", { weekday: "long" }),
            start_time: currentEvent.start.toTimeString().slice(0, 8),
            end_time: currentEvent.end.toTimeString().slice(0, 8)
        };

        try {
            const res = await checkClash(payload);

            if (res.status === "failure") {
                setClashMessage(res.message);
                setIsClash(true);
                const clashEntry = {
                    eventId: currentEvent.id,
                    title: currentEvent.title,
                    message: res.message,
                    start: currentEvent.start,
                    end: currentEvent.end,
                    type: "update",
                    timeSlot: `${currentEvent.start.toLocaleTimeString()} - ${currentEvent.end.toLocaleTimeString()}, ${currentEvent.start.toLocaleDateString("en-US", { weekday: "long" })}`
                };
                setClashEvents(prev => {
                    const existingIndex = prev.findIndex(e => e.eventId === currentEvent.id);
                    if (existingIndex >= 0) {
                        return prev.map(e => e.eventId === currentEvent.id ? clashEntry : e);
                    } else {
                        return [...prev, clashEntry];
                    }
                });
                alert(`Clash detected for ${currentEvent.title} at ${clashEntry.timeSlot}: ${res.message}`);
            } else {
                // No clash
                setIsClash(false);
                setClashMessage("");
                // Remove any existing clash entry for this event
                setClashEvents(prev => prev.filter(e => e.eventId !== currentEvent.id));
            }

            // Always allow assignment, even if there is a clash
            const updatedEvent = {
                ...currentEvent,
                title: `${currentEvent.title}\n(${selectedLecturer.name}, ${selectedClassroom.room_id})`,
                extendedProps: {
                    ...currentEvent.extendedProps,
                    lecturer: selectedLecturer.name,
                    lecturer_id: selectedLecturer.user_id,
                    classroom: selectedClassroom.room_id,
                    course_id: currentEvent.title,
                    originalTitle: currentEvent.title
                }
            };

            const existingEventIndex = events.findIndex(e => e.id === updatedEvent.id);
            if (existingEventIndex >= 0) {
                setEvents(prev => prev.map(e => e.id === updatedEvent.id ? { ...e, title: updatedEvent.title, extendedProps: updatedEvent.extendedProps } : e));
            } else {
                setEvents(prev => [...prev, updatedEvent]);
            }

            setDraggedEvents(prev => {
                const existingIndex = prev.findIndex(e => e.id === updatedEvent.id);
                const draggedEventVersion = {
                    ...updatedEvent,
                    title: currentEvent.title,
                    displayTitle: currentEvent.title
                };

                if (existingIndex >= 0) {
                    return prev.map(e => e.id === updatedEvent.id ? { ...e, title: currentEvent.title, displayTitle: currentEvent.title, extendedProps: updatedEvent.extendedProps } : e);
                } else {
                    return [...prev, draggedEventVersion];
                }
            });

            setSelectedLecturer("");
            setSelectedClassroom("");
            setShowModal(false);
        } catch (err) {
            console.error("Clash check failed:", err);
            setClashMessage("Failed to verify clash. Please try again.");
            setIsClash(true);
        }
    };

    // Reset modal state on close
    const handleModalClose = () => {
        setShowModal(false);
        setIsClash(false);
        setClashMessage("");
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

            <Sidebar
                onSchoolSelect={setSchool}
                onProgramSelect={(id, name) => {
                    console.log("Program selection:", { id, name });
                    setProgramId(id);
                    setProgram(name);
                }}
                onYearSelect={(year) => {
                    console.log("Year selection:", year);
                    setYear(parseInt(year));
                }}
            />
            {/*Adding a save button*/}
            <button
                className="bg-dark text-white"
                onClick={hundleSaveAllEvents}
                // Button is always enabled, but visually dimmed if there are clashes
                style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "20px",
                    zIndex: "1000",
                    opacity: clashEvents.length > 0 ? 0.5 : 1,
                    cursor: clashEvents.length > 0 ? "not-allowed" : "pointer"
                }}
            >
                Save Timetable
            </button>

            <MyCalendar
                events={events}
                onEventAdd={handleEventAdd}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
                onEventRemove={handleEventRemove}
                draggedEvents={draggedEvents}
                isAdmin={true}
                onClashDetected={(clash) => {
                    if (clash.type === "remove") {
                        // Remove clash entry for this event
                        setClashEvents(prev => prev.filter(e => e.eventId !== clash.eventId));
                    } else if (clash.type === "update") {
                        // Update or add clash entry
                        setClashEvents(prev => {
                            const existingIndex = prev.findIndex(e => e.eventId === clash.eventId);
                            if (existingIndex >= 0) {
                                // Replace existing clash
                                return prev.map(e => e.eventId === clash.eventId ? clash : e);
                            } else {
                                // Add new clash
                                return [...prev, clash];
                            }
                        });
                    }
                }}
            />



            {/* Styled Modal for assigning lecturer and classroom */}
            <Modal show={showModal} onHide={handleModalClose} centered size="sm" dialogClassName="dark-modal">
                <Modal.Header closeButton className="bg-dark text-white border-0">
                    <Modal.Title>Assign Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    {isClash && (
                        <div className="alert alert-danger" style={{ marginTop: "10px" }}>
                            {clashMessage}
                        </div>
                    )}

                    {/* Lecturer Dropdown */}
                    <div className="custom-dropdown mb-4">
                        <div className="dropdown-label">Lecturer</div>
                        <div className="dropdown-selected" tabIndex={0}>
                            {selectedLecturer.name || "Select lecturer"}
                            <div className="dropdown-list">
                                {lecturers.map((lec, i) => (
                                    <div
                                        key={i}
                                        className={`dropdown-item${lec.user_id === selectedLecturer?.user_id ? " selected" : ""}`}
                                        onClick={() => setSelectedLecturer(lec)}
                                    >
                                        {lec.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Classroom Dropdown */}
                    <div className="custom-dropdown mb-2">
                        <div className="dropdown-label">Classroom</div>
                        <div className="dropdown-selected" tabIndex={0}>
                            {selectedClassroom.room_id || "Select classroom"}
                            <div className="dropdown-list">
                                {classrooms.map((room, i) => (
                                    <div
                                        key={i}
                                        className={`dropdown-item${room.room_id === selectedClassroom?.room_id ? " selected" : ""}`}
                                        onClick={() => setSelectedClassroom(room)}
                                    >
                                        {room.room_id}
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

