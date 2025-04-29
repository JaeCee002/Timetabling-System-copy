import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from './components/sidebar';
//import Template from './components/template';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from  "@fullcalendar/daygrid";
import MyCalendar from './components/myCalendar';
import "./App.css";



function App() {

  //const onDropCourse = (day, time, course) => {
 //   console.log(`Dropped course: ${course} on ${day} at ${time}`);
 // };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='Container'>

        <MyCalendar />
        <Sidebar />
        {/*<Template onDropCourse={onDropCourse}/>*/}
        

      </div>
    </DndProvider>
  );
}

export default App;
