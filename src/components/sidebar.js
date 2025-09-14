import React, { useState, useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import "./sidebar.css";
import { fetchPrograms, fetchSchools, fetchCourses } from "../api/timetableAPI";
import { useAuth } from "./AuthContext";

const CourseButton = ({ course }) => {
  const [showTip, setShowTip] = useState(false);

  return (
    <div
      className="course-btn-wrapper"
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      style={{ position: "relative", width: "100%" }}
    >
      {showTip && <div className="drag-tip">Drag this course to the calendar</div>}
      <button
        className="fc-event course-btn"
        data-event-title={course.course_code || course}
        type="button"
        tabIndex={0}
      >
        {course.course_code || course}
      </button>
    </div>
  );
};

const Sidebar = ({ onSchoolSelect, onProgramSelect, onYearSelect }) => {
  const { isAuthenticated } = useAuth();

  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const university = "Copperbelt University";

  // Fetch schools on load
  useEffect(() => {
    if (!university || !isAuthenticated) return;

    fetchSchools(university)
      .then(data => {
        if (typeof data.schools === 'string') {
          setSchools([{ school_id: 1, school_name: data.schools }]);
        }
      })
      .catch(err => console.error("School fetch error:", err));
  }, []);

  // Fetch programs when school is selected
  useEffect(() => {
    if (!selectedSchool) return;

    fetchPrograms(selectedSchool)
      .then(data => setPrograms(data.programs))
      .catch(err => console.error("Program fetch error:", err));
  }, [selectedSchool]);

  // Fetch courses from admin backend when program AND year are selected
  useEffect(() => {
    if (!selectedProgram || !selectedYear) return;

    // Fetch courses from the admin endpoint
    fetchCourses(selectedProgram, selectedYear)
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.courses)) {
          const filteredCourses = data.courses.filter(course => 
            course.program_id == selectedProgram && course.year == selectedYear
          );
          setCourses(filteredCourses.length ? filteredCourses : data.courses);
        } else {
          setCourses([]);
        }
      })
      .catch(err => {
        console.error("Courses fetch error:", err);
        setCourses([]);
      });
  }, [selectedProgram, selectedYear]);

  // Setup draggable
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
  }, [courses]); // Re-initialize when courses change

  const handleSchoolChange = (e) => {
    const value = e.target.value;
    setSelectedSchool(value);
    setSelectedProgram("");
    setSelectedYear("");
    setCourses([]);
    onSchoolSelect?.(value);
  };

  const handleProgramChange = (e) => {
    const value = e.target.value;
    setSelectedProgram(value);
    setSelectedYear("");
    setCourses([]);
    const selected = programs.find(p => p.program_id === parseInt(value));
    onProgramSelect?.(value, selected ? selected.program_name : "");
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    setSelectedYear(value);
    onYearSelect?.(value);
  };

  return (
    <div className="sidebar" ref={sidebarRef}>
      <h2>School and Program</h2>

      <select
        id="schoolSelect"
        value={selectedSchool}
        onChange={handleSchoolChange}
        style={{
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        }}
      >
        <option value="">Select School</option>
        {schools.length === 1 ? (
          <option
            value={schools[0].school_id}
            style={{
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
            title={schools[0].school_name}
          >
            {schools[0].school_name.length > 30
              ? schools[0].school_name.slice(0, 30) + '...'
              : schools[0].school_name}
          </option>
        ) : (
          schools.map((school, i) => (
            <option
              key={i}
              value={school.school_id}
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }}
              title={school.school_name}
            >
              {school.school_name.length > 30
                ? school.school_name.slice(0, 30) + '...'
                : school.school_name}
            </option>
          ))
        )}
      </select>

      <select id="programSelect" value={selectedProgram} onChange={handleProgramChange} disabled={!selectedSchool}>
        <option value="">Select Program</option>
        {programs.map((program, i) => (
          <option key={i} value={program.program_id}>{program.program_name}</option>
        ))}
      </select>

      <select id="yearSelect" value={selectedYear} onChange={handleYearChange} disabled={!selectedProgram}>
        <option value="">Select Year</option>
        <option value="1">First Year</option>
        <option value="2">Second Year</option>
        <option value="3">Third Year</option>
        <option value="4">Fourth Year</option>
      </select>

      <h2>Courses</h2>
      <div className="course-list">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseButton 
              key={course.course_code} 
              course={course} 
            />
          ))
        ) : (
          <p className="no-courses-message">
            {selectedProgram && selectedYear ? "No courses found" : "Select program and year"}
          </p>
        )}
      </div>

      {<button
        className="admin-dashboard-btn"
        style={{ marginTop: "2rem", width: "100%" }}
        onClick={() => navigate("/dash")}
      >
        Admin Dashboard
      </button> }
    </div>
  );
};

export default Sidebar;