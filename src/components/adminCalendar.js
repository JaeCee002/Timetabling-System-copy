import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "./sidebar"
import "./adminCalendar.css";
import MyCalendar from "./myCalendar"
import { v4 as uuidv4 } from 'uuid';
import { Modal, Button } from "react-bootstrap";
import { ToastContainer, Toast } from "react-bootstrap";
import UserAccount from "./UserAccount";
import { fetchAdminTimetable, fetchLecturers, fetchClassrooms, checkClash, lockClass, releaseClass, checkLock, rollbackTimetable, unrollbackTimetable, suggestSlots } from "../api/timetableAPI";
import { convertTimetableEntry } from "../utils/convertTimetableEntry";
import { convertSuggestedSlots } from '../utils/convertSlotSuggestions';
import { printCalendarAsPDF } from "../utils/printTimetable";
import { saveAdminTimetable } from "../api/timetableAPI";
import { useCalendarStore } from "./calendarStore";
import { useAuth } from "./AuthContext";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

import "./adminCalendar.css";


export default function AdminCalendar() {
    const calendarApi = useCalendarStore(state => state.calendarApi);
    const { isAuthenticated } = useAuth();

    // Lock state for class
    const [isClassLocked, setIsClassLocked] = useState(false);
    const [lockLoading, setLockLoading] = useState(false);

    // Check lock status on mount/login/refresh
    useEffect(() => {
        const checkClassroomLock = async () => {
            try {
                const res = await checkLock();
                if (res && res.status === "success" && res.locked === true) {
                    setIsClassLocked(true);
                } else {
                    setIsClassLocked(false);
                }
            } catch (err) {
                setIsClassLocked(false);
                console.error("Error checking classroom lock:", err);
            }
        };
        checkClassroomLock();
    }, [isAuthenticated]);

    // Lock/Unlock class handler
    const handleLockToggle = async () => {
        setLockLoading(true);
        try {
            let res;
            if (!isClassLocked) {
                // Lock class (no parameters needed)
                res = await lockClass();
                if (res && res.status === "success") {
                    setIsClassLocked(true);
                } else {
                    alert("Failed to lock class. Server did not return success.");
                }
            } else {
                // Release class (no parameters needed)
                res = await releaseClass();
                if (res && res.status === "success") {
                    setIsClassLocked(false);
                } else {
                    alert("Failed to unlock class. Server did not return success.");
                }
            }
            // Always fetch classrooms after lock/unlock
            try {
                const data = await fetchClassrooms();
                setClassrooms(data.classes);
            } catch (err) {
                console.error("Error fetching classrooms after lock/unlock:", err);
            }
        } catch (err) {
            alert("Failed to " + (isClassLocked ? "unlock" : "lock") + " class. See console for details.");
            console.error("Lock/Unlock error:", err);
        }
        setLockLoading(false);
    };

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
    const [persistentConflicts, setPersistentConflicts] = useState([]); //All conflicts (persistent)
    const [visibleNotifications, setVisibleNotifications] = useState([]); //Temporary notifications
    const [highlightedEvents, setHighlightedEvents] = useState([]);
    const [showClashDetailsModal, setShowClashDetailsModal] = useState(false);
    const [selectedClash, setSelectedClash] = useState(null);


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

        setEvents([]); // Clear previous entries before fetching
        setCurrentEvent(null); // Clear current event/course title

        fetchAdminTimetable(program, year)
            .then((data) => {
                const formatted = data.entries
                    .map(entry => convertTimetableEntry(entry))
                    .filter(e => e !== null);
                setEvents(formatted);
                setCurrentEvent(null); // Clear current event/course title after fetch
            })
            .catch(err => {
                console.error("Admin timetable fetch error:", err);
                setCurrentEvent(null); // Clear current event/course title on error
                // Optionally, show an error notification here
            });
    }, [program, year]);



    // Handle adding a new event
    const handleEventAdd = (event) => {
        const eventWithId = {
            ...event,
            id: uuidv4()
        };
        setCurrentEvent(eventWithId);
        setShowModal(true);
    };

    // Handle updating an existing event (when moved/resized)
    const handleEventUpdate = async (updatedEvent) => {
        if (!selectedLecturer || !selectedClassroom || !currentEvent) return;

        const payload = {
            id: currentEvent.id,
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
                // Create proper clash entry
                const clashEntry = {
                    eventId: currentEvent.id,
                    title: currentEvent.title,
                    message: res.message,
                    start: currentEvent.start,
                    end: currentEvent.end,
                    type: "drag",
                    timeSlot: `${currentEvent.start.toLocaleTimeString()} - ${currentEvent.end.toLocaleTimeString()}`
                };

                // Update all conflict states
                setPersistentConflicts(prev => {
                    const filtered = prev.filter(c => c.eventId !== currentEvent.id);
                    return [...filtered, clashEntry];
                });
                setClashEvents(prev => [...prev.filter(c => c.eventId !== currentEvent.id), clashEntry]);
                setVisibleNotifications(prev => [...prev, clashEntry]); // <-- Show toast notification for eventDrop

                // Highlight the dragged event
                if (calendarApi) {
                    const eventObj = calendarApi.getEventById(currentEvent.id);
                    if (eventObj) {
                        eventObj.setProp('backgroundColor', '#fff3cd');
                        eventObj.setProp('borderColor', '#ffc107');
                    }
                }
            } else {
                // No clash - clear any existing conflict for this event
                setIsClash(false);
                setClashMessage("");
                setPersistentConflicts(prev => prev.filter(c => c.eventId !== currentEvent.id));
                setClashEvents(prev => prev.filter(c => c.eventId !== currentEvent.id));

                // Remove highlight if exists
                if (calendarApi) {
                    const eventObj = calendarApi.getEventById(currentEvent.id);
                    if (eventObj) {
                        eventObj.setProp('classNames', '');
                        eventObj.setProp('backgroundColor', '');
                        eventObj.setProp('borderColor', '');
                    }
                }
            }

            // Rest of your existing update logic
            setEvents(prev => prev.map(e =>
                e.id === updatedEvent.id ? updatedEvent : e
            ));

            setDraggedEvents(prev => prev.map(e =>
                e.id === updatedEvent.id ? {
                    ...updatedEvent,
                    title: updatedEvent.extendedProps?.originalTitle || updatedEvent.title.split('\n')[0],
                    displayTitle: updatedEvent.extendedProps?.originalTitle || updatedEvent.title.split('\n')[0]
                } : e
            ));
        } catch (err) {
            console.error("Error checking clash:", err);
            setVisibleNotifications(prev => [...prev, {
                eventId: currentEvent.id,
                title: currentEvent.title,
                message: "Failed to check for conflicts",
                type: "error"
            }]);
        }
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
                    id: e.id, // Send unique event id to backend
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
            setCurrentEvent(null); // Clear current event/course title after save
        } catch (err) {
            console.error("❌ Failed to save events:", err);

            // Better error handling
            if (err.response?.data) {
                console.error("Server response:", err.response.data);
                alert(`Failed to save events: ${err.response.data.error || 'Server error'}`);
            } else {
                alert("Failed to save events. Please check the console for details.");
            }
            setCurrentEvent(null); // Clear current event/course title on error
        }
    };

    //Handle deleting an event
    const handleEventDelete = (eventId) => {
        // Remove from events state
        setEvents(prev => prev.filter(e => e.id !== eventId));

        // Remove from draggedEvents
        setDraggedEvents(prev => prev.filter(e => e.id !== eventId));

        // Remove from both conflict states
        setPersistentConflicts(prev => prev.filter(c => c.eventId !== eventId));
        setVisibleNotifications(prev => prev.filter(c => c.eventId !== eventId));
    };



    // Handle event deletion from calendar directly (for right-click delete, etc.)
    const handleEventRemove = (eventId) => {
        handleEventDelete(eventId);
    };

    // Handle modal submission
    const handleModalSubmit = async () => {
        if (!selectedLecturer || !selectedClassroom || !currentEvent) return;

        const payload = {
            id: currentEvent.id,
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
                setPersistentConflicts(prev => [...prev.filter(c => c.eventId !== currentEvent.id), clashEntry]);
                setVisibleNotifications(prev => [...prev, clashEntry]);
                setClashEvents(prev => {
                    const existingIndex = prev.findIndex(e => e.eventId === currentEvent.id);
                    if (existingIndex >= 0) {
                        return prev.map(e => e.eventId === currentEvent.id ? clashEntry : e);
                    }
                    return [...prev, clashEntry];
                });
            } else {
                // No clash
                setIsClash(false);
                setClashMessage("");
                // Remove any existing clash entry for this event
                setPersistentConflicts(prev => prev.filter(c => c.eventId !== currentEvent.id));
                setVisibleNotifications(prev => prev.filter(c => c.eventId !== currentEvent.id));
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
                }
                return [...prev, draggedEventVersion];
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



    const toggleConflictHighlight = () => {
        if (highlightedEvents.length > 0) {
            // Clear highlights
            setHighlightedEvents([]);
            if (calendarApi) {
                calendarApi.getEvents().forEach(event => {
                    event.setProp('classNames', '');
                    event.setProp('backgroundColor', '');
                    event.setProp('borderColor', '');
                });
            }
        } else {
            // Highlight conflicts from persistent state
            setHighlightedEvents(persistentConflicts.map(c => c.eventId));

            if (calendarApi) {
                calendarApi.getEvents().forEach(event => {
                    if (persistentConflicts.some(c => c.eventId === event.id)) {
                        event.setProp('classNames', 'conflict-glow');
                        event.setProp('backgroundColor', '#fff3cd');
                        event.setProp('borderColor', '#ffc107');
                    }
                });
            }
        }
    };

    const handleRollback = async () => {
        if (!program || !year) {
            alert("Please select a program and year before rolling back.");
            return;
        }
        if (!window.confirm("Are you sure you want to rollback to the previous timetable version? This cannot be undone.")) {
            return;
        }
        try {
            const data = await rollbackTimetable(program, year);
            if (data.status === "success") {
                const formatted = data.entries
                    .map(entry => convertTimetableEntry(entry))
                    .filter(e => e !== null);
                setEvents(formatted);
                alert("Timetable rolled back successfully!");
            } else {
                alert("Failed to rollback timetable. Please try again.");
            }
        } catch (err) {
            alert("Failed to rollback timetable. See console for details.");
            console.error("Rollback error:", err);
        }
    };

    const handleUnrollback = async () => {
        if (!program || !year) {
            alert("Please select a program and year before unrolling back.");
            return;
        }
        if (!window.confirm("Are you sure you want to move forward to the next timetable version?")) {
            return;
        }
        try {
            const data = await unrollbackTimetable(program, year);
            if (data.status === "success") {
                const formatted = data.entries
                    .map(entry => convertTimetableEntry(entry))
                    .filter(e => e !== null);
                setEvents(formatted);
                alert("Timetable moved forward to next version successfully!");
            } else {
                alert("Failed to move forward. Please try again.");
            }
        } catch (err) {
            alert("Failed to move forward. See console for details.");
            console.error("Unrollback error:", err);
        }
    };


const [suggestedSlots, setSuggestedSlots] = useState([]);
const [suggestionsLoading, setSuggestionsLoading] = useState(false);

const handleSuggestSlots = async () => {
  // 1. Validate prerequisites
  if (!currentEvent || !calendarApi) {
    console.warn(currentEvent ? "Calendar API not ready" : "No event selected");
    return;
  }

  setSuggestionsLoading(true);

  try {
    // 2. Find the actual event from state if needed, but use props from currentEvent
    const actualEvent = events.find(e => e.id === currentEvent.id);
    if (!actualEvent) {
      alert("Event not found. Please refresh and try again.");
      setSuggestionsLoading(false);
      return;
    }

    // 3. Check required assignments on the *actual* event object
    const { lecturer_id, classroom } = actualEvent.extendedProps || {};
    if (!lecturer_id && !classroom) {
      alert("Please assign a lecturer and classroom to the event first.");
      setSuggestionsLoading(false);
      return;
    }

    // 4. Prepare payload
    const payload = {
      ...(lecturer_id && { lecturer_id }),
      ...(classroom && { class: classroom })
    };

    // 5. Fetch suggestions
    const { success, suggested_slots = [], message } = await suggestSlots(payload);
    
    if (success && suggested_slots?.length > 0) {
      // 6. Clear previous suggestions before adding new ones
      clearSuggestions();
      
      // 7. Convert and add new suggestions using the calendar's API
      const calendarSlots = convertSuggestedSlots(suggested_slots);
      calendarApi.addEventSource(calendarSlots);
      setSuggestedSlots(suggested_slots); // Keep track of raw suggestions

      // 8. Optional: Zoom to first suggested slot
      if (calendarSlots[0]?.start) {
        calendarApi.scrollToTime(calendarSlots[0].start);
      }
    } else {
      alert(message || "No available time slots found.");
    }

  } catch (error) {
    console.error("Suggestion error:", error);
    alert(error.response?.data?.message || "Network error");
  } finally {
    setSuggestionsLoading(false);
  }
};

// Cleanup function
const clearSuggestions = () => {
  // Remove suggestion background events from the calendar
  if (calendarApi) {
    calendarApi.getEvents()
      .filter(e => e.extendedProps?.isSuggestion)
      .forEach(e => e.remove());
  }
  setSuggestedSlots([]);
};


    return (
        <div className="Container" style={{ display: "flex" }}>
            {/* Lock/Unlock Class Button */}
            <div style={{
                position: "absolute",
                bottom: "5px",
                left: "60px",
                zIndex: 1000,
                display: "flex",
                gap: "10px"
            }}>
                <i class="bi bi-lock-fill lock-icon" data-bs-toggle="tooltip" data-bs-placement="top" title="Secure"

                    variant={isClassLocked ? "danger" : "primary"}
                    onClick={handleLockToggle}
                    disabled={lockLoading || !program || !year}
                >
                    {lockLoading
                        ? (isClassLocked ? "Unlocking..." : "Locking...")
                        : (isClassLocked ? "Unlock Class" : "Lock Class")}

                </i>

                {/* <Button
                
                    variant={isClassLocked ? "danger" : "primary"}
                    onClick={handleLockToggle}
                >
                    {lockLoading
                        ? (isClassLocked ? "Unlocking..." : "Locking...")
                        : (isClassLocked ? "Unlock Class" : "Lock Class")}
                </Button>
                // Clear Timetable Button 
//                 <Button
//                     variant="outline-secondary"
//                     onClick={() => {
//                         setEvents([]);
//                         setDraggedEvents([]);
//                         setCurrentEvent(null);
//                     }}
//                     disabled={events.length === 0}
//                 >
//                     Clear Timetable
//                 </Button>

//                 </Button> */}

            </div>
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }} >
                {visibleNotifications.map((clash, index) => (
                    <Toast
                        key={index}
                        onClose={() => setVisibleNotifications(prev => prev.filter((_, i) => i !== index))}
                        bg="danger"
                        autohide
                        delay={5000}
                        className={clash.type === "conflict" ? "conflict-notification" : ""}
                    >
                        <Toast.Header>
                            <strong className="me-auto">Schedule Conflict</strong>
                        </Toast.Header>
                        <Toast.Body className="text-white">
                            <strong>{clash.title}</strong>:{clash.message}
                            <div className="small">{clash.timeSlot}</div>
                        </Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>



            <div style={{
                position: 'absolute',
                top: '10px',
                right: '20px',
                zIndex: 1000,
                
                //     width: '40px', // Fixed width
                //     height: '40px', // Fixed height to match width
                //     borderRadius: '0%', // This makes it circular
                //     overflow: 'hidden', // Ensures content stays within circle
                //     display: 'flex',
                //     alignItems: 'center',
                //     justifyContent: 'center',
                //     backgroundColor: '#f8f9fa', // Optional background color
                //     boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
                <UserAccount userRole="admin" />
            </div>

            <Sidebar
                onSchoolSelect={setSchool}
                onProgramSelect={(id, name) => {
                    console.log("Program selection:", { id, name });
                    setProgramId(id);
                    setProgram(name);
                    setYear(null);
                }}
                onYearSelect={(year) => {
                    console.log("Year selection:", year);
                    setYear(parseInt(year));
                }}
            />
            <div style={{
                position: "absolute",
                bottom: "4px",
                right: "5px",
                zIndex: "1000",
                display: "flex",
                gap: "10px"
            }}>
                <Button
                    variant={persistentConflicts.length ? "warning" : "outline-warning"}
                    onClick={toggleConflictHighlight}
                    className={`conflict-btn ${persistentConflicts.length ? 'has-conflicts' : ''}`}
                >
                    {persistentConflicts.length ? `⚠️ Conflicts (${persistentConflicts.length}) ⚠️` : "Show Conflicts"}
                </Button>

                <Button className=""
                    variant="outline-success"
                    onClick={hundleSaveAllEvents}
                    disabled={clashEvents.length > 0 || events.length === 0}
                >
                    <i className="bi bi-save text-dark"> </i>
                    Save Timetable
                </Button>

                <Button
                    className=""
                    variant="outline-success"
                    onClick={() => printCalendarAsPDF('.fc')}
                    disabled={events.length === 0}
                >
                    <i className="bi bi-printer text-dark"> </i>
                    Print Timetable
                </Button>

            </div>
            <div
    style={{
        position: "absolute",
        bottom: "4px",
        left: "200px",
        zIndex: "1000",
        display: "flex",
        gap: "10px"
    }}>
    <Button
        variant="outline-success"
        className="text-dark"
        onClick={handleSuggestSlots}
        disabled={!currentEvent || suggestionsLoading}
    >
        {suggestionsLoading ? "Loading..." : "Suggested Slots"}
    </Button>
    {suggestedSlots.length > 0 && (
        <Button
            variant="outline-secondary"
            className="text-dark"
            onClick={clearSuggestions}
            size="sm"
        >
            ✖️ Clear Suggestions
        </Button>
    )}
</div>
            <div
                style={{
                    position: "absolute",
                    bottom: "45px",
                    right: "60px",
                    zIndex: 1000,
                    display: "flex",
                    gap: "10px"
                }}>
                <i
                    className="bi bi-arrow-left-circle"
                    style={{
                        fontSize: "2rem",  // Larger icon (adjust as needed: 1.5rem, 2rem, 2.5rem, etc.)
                        color: "#12273aff",  // Bootstrap's "danger" red (optional)
                        cursor: "pointer"  // Hand cursor on hover
                    }}
                    onClick={handleRollback}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Rollback to previous version"
                />
            </div>
            <div
                style={{
                    position: "absolute",
                    bottom: "45px",
                    right: "20px",
                    zIndex: 1000,
                    display: "flex",
                    gap: "10px"
                }}>
                <i
                    className="bi bi-arrow-right-circle"
                    style={{
                        fontSize: "2rem",
                        color: "#12273aff",
                        cursor: "pointer"
                    }}
                    onClick={handleUnrollback}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Move forward to next version"
                />
            </div>


            {/* Wrap MyCalendar in a div with left margin for admin view */}
            <div
  style={{
    flexGrow: 1,
    marginLeft: '240px',
    marginTop: '50px',
    height: '100vh',
    overflow: 'hidden',
    paddingRight: '20px' // Optional padding for right spacing
  }}
>
                <MyCalendar
                    events={events}
                    onEventAdd={handleEventAdd}
                    onEventUpdate={handleEventUpdate}
                    onEventDelete={handleEventDelete}
                    onEventRemove={handleEventRemove}
                    draggedEvents={draggedEvents}
                    isAdmin={true}
                    conflicts={persistentConflicts}
                    onClashClick={(clash) => {
                        setSelectedClash(clash);
                        setShowClashDetailsModal(true);
                    }}
                    onClashDetected={(clash) => {
                        if (clash.type === "remove") {
                            // Remove clash entry for this event
                            setClashEvents(prev => prev.filter(e => e.eventId !== clash.eventId));
                            setPersistentConflicts(prev => prev.filter(e => e.eventId !== clash.eventId)); // <-- Clear persistentConflicts too
                        } else if (clash.type === "update") {
                            // Update or add clash entry
                            setClashEvents(prev => {
                                const existingIndex = prev.findIndex(e => e.eventId === clash.eventId);
                                if (existingIndex >= 0) {
                                    return prev.map(e => e.eventId === clash.eventId ? clash : e);
                                } else {
                                    return [...prev, clash];
                                }
                            });
                            setPersistentConflicts(prev => {
                                const existingIndex = prev.findIndex(e => e.eventId === clash.eventId);
                                if (existingIndex >= 0) {
                                    return prev.map(e => e.eventId === clash.eventId ? clash : e);
                                } else {
                                    return [...prev, clash];
                                }
                            });
                        }
                    }}
                />
            </div>


            {/* Clash Details Modal */}
            <Modal show={showClashDetailsModal} onHide={() => setShowClashDetailsModal(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Conflict Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>{selectedClash?.title}</h5>
                    <p><strong>Time:</strong> {selectedClash?.timeSlot}</p>
                    <p className="text-danger"><strong>Clash:</strong> {selectedClash?.message}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowClashDetailsModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>


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
