// Sidebar.js

import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";

const CourseButton = ({ course }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="course-btn-wrapper"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      style={{ position: "relative", width: "100%" }}
    >
      {showTip && (
        <div className="drag-tip">
          Drag this course to the calendar
        </div>
      )}
      <button
        className="fc-event course-btn"
        data-event-title={course}
        type="button"
        tabIndex={0}
      >
        {course}
      </button>
    </div>
  );
};

const Sidebar = () => {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState("");
  const [year, setYear] = useState("");

  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const schoolPrograms = {
    ict: ["Computer Science", "Information Systems", "Bio-Informatics"],
    business: ["Accounting", "Finance", "Marketing"],
  };

  const handleSchoolChange = (event) => {
    const school = event.target.value;
    setSelectedSchool(school);
    setPrograms(school ? schoolPrograms[school] || [] : []);
    setProgram("");
    setYear("");
  };

  const handleProgramChange = (event) => {
    setProgram(event.target.value);
    setYear("");
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const yearCourses = {
    1: ["CS120", "CS130", "CS150", "MA110", "PH110", "LA111"],
    2: ["CS220", "CS225", "CS230", "CS235", "CS250", "CS270", "MA210", "PH212"],
    3: ["CS301", "CS320", "CS345", "CS350", "CS351", "CS361", "MA320"],
    4: ["CS425", "CS430", "CS441", "CS450", "CS460", "CS470", "CS480"],
  };

  // ✅ Hook FullCalendar's Draggable to sidebar courses
  useEffect(() => {
    if (sidebarRef.current) {
      new Draggable(sidebarRef.current, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          return {
            title: eventEl.getAttribute("data-event-title"),
          };
        },
      });
    }
  }, []);

  return (
    <div className="sidebar" ref={sidebarRef}>
      <h2>School and Program</h2>
      <select id="schoolSelect" value={selectedSchool} onChange={handleSchoolChange}>
        <option value="">Select School</option>
        <option value="ict">School of ICT</option>
        <option value="business">School of Business</option>
      </select>

      <select id="programSelect" value={program} onChange={handleProgramChange} disabled={!selectedSchool}>
        <option value="">Select Program</option>
        {programs.map((program, index) => (
          <option key={index} value={program.toLowerCase().replace(/\s+/g, "-")}>
            {program}
          </option>
        ))}
      </select>

      <select id="yearSelect" value={year} onChange={handleYearChange} disabled={!program}>
        <option value="">Select Year</option>
        <option value="1">First Year</option>
        <option value="2">Second Year</option>
        <option value="3">Third Year</option>
        <option value="4">Fourth Year</option>
      </select>

      <h2>Courses</h2>
      <div className="course-list">
        {(yearCourses[year] || []).map((course) => (
          <CourseButton key={course} course={course} />
        ))}
      </div>
      <button
        className="admin-dashboard-btn"
        style={{ marginTop: "2rem", width: "100%" }}
        onClick={() => navigate("/dash")}
      >
        Admin Dashboard
      </button>
    </div>
  );
};

export default Sidebar;
