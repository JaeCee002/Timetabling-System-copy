import React, { useState } from "react";
import { useDrag } from "react-dnd";
import "./sidebar.css";

// Draggable Course Component
const CourseButton = ({ course }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "COURSE",
    item: { course },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <button ref={drag} className={`course-btn ${isDragging ? "dragging" : ""}`}>
      {course}
    </button>
  );
};

const Sidebar = ({ selectedYear }) => {
  const [selectedSchool, setSelectedSchool] = useState("");
  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState(""); // State for selected program
  const [year, setYear] = useState(""); // State for selected year

  // Define programs for each school
  const schoolPrograms = {
    ict: ["Computer Science", "Information Systems", "Bio-Informatics"],
    business: ["Accounting", "Finance", "Marketing"],
  };

  // Handle school selection change
  const handleSchoolChange = (event) => {
    const school = event.target.value;
    setSelectedSchool(school);
    setPrograms(school ? schoolPrograms[school] || [] : []);
    setProgram(""); // Reset program when school changes
    setYear(""); // Reset year when school changes
  };

  // Handle program selection change
  const handleProgramChange = (event) => {
    setProgram(event.target.value);
    setYear(""); // Reset year when program changes
  };

  // Handle year selection change
  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  // Define courses for each year
  const yearCourses = {
    1: ["CS 120", "CS130", "CS150", "MA110", "PH110", "LA111"],
    2: ["CS220", "CS225", "CS230", "CS235", "CS250", "CS270", "MA210", "PH212"],
    3: ["CS301", "CS320", "CS345", "CS350", "CS351", "CS361", "MA320"],
    4: ["CS425", "CS430", "CS441", "CS450", "CS460", "CS470", "CS480"],
  };

  return (
    <div className="sidebar">
      {/* School & Program Selection */}
      <h2>School and Program</h2>
      <select id="schoolSelect" value={selectedSchool} onChange={handleSchoolChange}>
        <option value="">Select School</option>
        <option value="ict">School of ICT</option>
        <option value="business">School of Business</option>
      </select>

      <select
        id="programSelect"
        value={program}
        onChange={handleProgramChange}
        disabled={!selectedSchool} // Disable if no school is selected
      >
        <option value="">Select Program</option>
        {programs.map((program, index) => (
          <option key={index} value={program.toLowerCase().replace(/\s+/g, "-")}>
            {program}
          </option>
        ))}
      </select>

      <select
        id="yearSelect"
        value={year}
        onChange={handleYearChange}
        disabled={!program} // Disable if no program is selected
      >
        <option value="">Select Year</option>
        <option value="1">First Year</option>
        <option value="2">Second Year</option>
        <option value="3">Third Year</option>
        <option value="4">Fourth Year</option>
      </select>

      {/* Courses Section */}
      <h2>Courses</h2>
      <div className="course-list">
        {(yearCourses[year] || []).map((course) => (
          <CourseButton key={course} course={course} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;