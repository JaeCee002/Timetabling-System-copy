import React, { useState } from "react";
import TimeSlot from "./TimeSlot";
import "./template.css";

const Template = () => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [times, setTimes] = useState([
    "08:00 - 10:00",
    "10:00 - 12:00",
    "12:00 - 14:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
  ]);

  const [schedule, setSchedule] = useState({});
  const [popupData, setPopupData] = useState({ visible: false, type: "", options: [] });

  // Replace the popup with a dropdown list
  const handleDropCourse = (day, time, course) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [`${day}-${time}`]: { course, class: null, lecturer: null },
    }));

    // Set dropdown data for available classes
    setPopupData({
      visible: true,
      type: "class",
      options: ["C301", "C302", "C303", "C304", "C305", "C208"],
      cellKey: `${day}-${time}`, // Track the cell being updated
    });
  };

  // Handle dropdown selection
  const handleDropdownChange = (e) => {
    const selection = e.target.value;
    const { cellKey } = popupData;

    if (popupData.type === "class") {
      // Update the selected class for the cell
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [cellKey]: {
          ...prevSchedule[cellKey],
          class: selection,
        },
      }));

      // Set dropdown data for lecturers
      setPopupData({
        visible: true,
        type: "lecturer",
        options: ["Dr. Smith", "Prof. Johnson", "Ms. Davis", "Mr. Brown"],
        cellKey,
      });
    } else if (popupData.type === "lecturer") {
      // Update the selected lecturer for the cell
      setSchedule((prevSchedule) => ({
        ...prevSchedule,
        [cellKey]: {
          ...prevSchedule[cellKey],
          lecturer: selection,
        },
      }));

      // Close the dropdown
      setPopupData({ visible: false, type: "", options: [] });
    }
  };

  // Handle manual editing of time slots
  const handleTimeEdit = (index, newTime) => {
    const updatedTimes = [...times];
    updatedTimes[index] = newTime;
    setTimes(updatedTimes);
  };

  return (
    <div className="timetable-container">
      <h1>CBU School Timetabling System</h1>
      <table className="timetable">
        <thead>
          <tr>
            <th>Days/Time</th>
            {times.map((time, index) => (
              <th key={index}>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => handleTimeEdit(index, e.target.value)}
                  className="time-input"
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td>{day}</td>
              {times.map((time) => (
                <TimeSlot
                  key={`${day}-${time}`}
                  time={time}
                  day={day}
                  assignedData={schedule[`${day}-${time}`]} // Pass the full data (course, class, lecturer)
                  onDropCourse={handleDropCourse}
                  type="COURSE"
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {popupData.visible && (
        <div className="dropdown-container">
          <h2>Select {popupData.type === "class" ? "Class" : "Lecturer"}</h2>
          <select onChange={handleDropdownChange} defaultValue="">
            <option value="" disabled>
              Select an option
            </option>
            {popupData.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default Template;