import React from "react";
import { useDrop } from "react-dnd";
import "./template.css";

const TimeSlot = ({ time, day, assignedData, onDropCourse, type }) => {
  const [{ isOver }, drop] = useDrop({
    accept: type,
    drop: (item) => onDropCourse(day, time, item.course),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <td ref={drop} className={`time-slot ${isOver ? "highlight" : ""}`}>
      {assignedData ? (
        <div>
          <div><strong>Course:</strong> {assignedData.course || "N/A"}</div>
          <div><strong>Class:</strong> {assignedData.class || "N/A"}</div>
          <div><strong>Lecturer:</strong> {assignedData.lecturer || "N/A"}</div>
        </div>
      ) : null /* Render nothing if no data is assigned */}
    </td>
  );
};

export default TimeSlot;