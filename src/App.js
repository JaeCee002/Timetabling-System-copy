import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './components/sidebar';
import MyCalendar from './components/myCalendar';
import "./App.css";

function App() {
  const [events, setEvents] = useState([]); // Shared state for calendar events

  // Function to add a new event
  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  return (
    <div className='Container' style={{ display: 'flex' }}>
      {/* Sidebar for draggable events */}
      <Sidebar />

      {/* Calendar to drop events */}
      <MyCalendar events={events} onEventAdd={addEvent} />
    </div>
  );
}

export default App;
