import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./dash.css";
import { Button } from "react-bootstrap";
import { 
  fetchCourses,
  fetchClassrooms,
  fetchPrograms,
  fetchSchools,
} from "../api/timetableAPI"; 

const tabs = ["courses", "classrooms"];

const tabFields = {
  courses: ["name", "code", "year"],  // Added year field
  classrooms: ["id", "capacity", "locked"]
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("courses");
  const [formVisible, setFormVisible] = useState({});
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({
    courses: [],
    classrooms: []
  });
  const [editIndex, setEditIndex] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesData = await fetchCourses();
        
        // Fetch classrooms
        const classroomsData = await fetchClassrooms();
        
        setData({
          courses: Array.isArray(coursesData?.courses) ? 
            coursesData.courses.map(c => ({
              name: c.course_name,
              code: c.course_code,
              year: c.year || "1"
            })) : [],
          classrooms: Array.isArray(classroomsData?.classrooms) ? 
            classroomsData.classrooms.map(r => ({
              id: r.room_id,
              capacity: r.capacity,
              locked: r.locked ? "Yes" : "No"
            })) : []
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(`Error loading data: ${error.message}`);
        setData({
          courses: [],
          classrooms: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleForm = (tab, index = null) => {
    setFormVisible((prev) => ({ ...prev, [tab]: !prev[tab] }));
    setEditIndex((prev) => ({ ...prev, [tab]: index }));

    if (index !== null && data[tab][index]) {
      setFormData((prev) => ({
        ...prev,
        [tab]: { ...data[tab][index] }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [tab]: {}
      }));
    }
  };

  const handleInputChange = (tab, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value
      }
    }));
  };

    const handleFormSubmit = async (tab) => {
    try {
      if (tab === "courses") {
        // Create or update course
        const response = await fetch('/admin.php?action=addCourse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: formData[tab]?.code || "",
            name: formData[tab]?.name || "",
            year: formData[tab]?.year || "1"
          })
        });
        
        const result = await response.json();
        if (result.status !== 'success') {
          throw new Error(result.error || 'Failed to save course');
        }
      } else {
        // Create or update classroom
        const response = await fetch('/admin.php?action=addClass', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: formData[tab]?.id || "",
            capacity: Number(formData[tab]?.capacity) || 0,
            locked: formData[tab]?.locked === "Yes" ? 1 : 0,
            school_id: 1
          })
        });
        
        const result = await response.json();
        if (result.status !== 'success') {
          throw new Error(result.error || 'Failed to save classroom');
        }
      }

      // Refresh data
      const [newCoursesData, newClassroomsData] = await Promise.all([
        fetchCourses(),
        fetchClassrooms()
      ]);
      
      setData({
        courses: Array.isArray(newCoursesData?.courses) ? 
          newCoursesData.courses.map(c => ({
            name: c.course_name,
            code: c.course_code,
            year: c.year || "1"
          })) : [],
        classrooms: Array.isArray(newClassroomsData?.classrooms) ? 
          newClassroomsData.classrooms.map(r => ({
            id: r.room_id,
            capacity: r.capacity,
            locked: r.locked ? "Yes" : "No"
          })) : []
      });
      
      setFormVisible((prev) => ({ ...prev, [tab]: false }));
      setEditIndex((prev) => ({ ...prev, [tab]: null }));
      setFormData((prev) => ({ ...prev, [tab]: {} }));
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (tab, idx) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const item = data[tab][idx];
        const endpoint = tab === "courses" ? "deleteCourse" : "deleteClassroom";
        const key = tab === "courses" ? "code" : "id";
        
        const response = await fetch(`/admin.php?action=${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [key]: item[key]
          })
        });

        const result = await response.json();
        if (result.status === 'success') {
          // Refresh data
          const newData = {...data};
          newData[tab] = newData[tab].filter((_, i) => i !== idx);
          setData(newData);
        } else {
          alert('Error: ' + (result.error || 'Failed to delete'));
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const renderForm = (tab) => (
    <form
      className="form-container flex flex-col gap-2 mb-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleFormSubmit(tab);
      }}
    >
      {tabFields[tab].map((field, index) => {
        if (field === "locked") {
          return (
            <div key={index} className="flex flex-col">
              <label className="mb-1 font-medium">Locked</label>
              <select
                className="input border rounded px-2 py-1"
                value={formData[tab]?.[field] || "No"}
                onChange={(e) => handleInputChange(tab, field, e.target.value)}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          );
        } else if (field === "year") {
          return (
            <div key={index} className="flex flex-col">
              <label className="mb-1 font-medium">Year</label>
              <select
                className="input border rounded px-2 py-1"
                value={formData[tab]?.[field] || "1"}
                onChange={(e) => handleInputChange(tab, field, e.target.value)}
                required
              >
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
          );
        } else if (field === "capacity") {
          return (
            <div key={index} className="flex flex-col">
              <label className="mb-1 font-medium">Capacity</label>
              <input
                type="number"
                min={1}
                className="input border rounded px-2 py-1"
                value={formData[tab]?.[field] || ""}
                onChange={(e) => handleInputChange(tab, field, e.target.value)}
                required
              />
            </div>
          );
        } else {
          const label = field === "id" ? "Classroom ID" : 
                      field === "code" ? "Course Code" : 
                      field.charAt(0).toUpperCase() + field.slice(1);
          return (
            <div key={index} className="flex flex-col">
              <label className="mb-1 font-medium">{label}</label>
              <input
                type="text"
                placeholder={label}
                className="input border rounded px-2 py-1"
                value={formData[tab]?.[field] || ""}
                onChange={(e) => handleInputChange(tab, field, e.target.value)}
                required
              />
            </div>
          );
        }
      })}
      <button
        type="submit"
        className="btn submit bg-blue-600 text-white px-4 py-1 rounded mt-2"
      >
        {editIndex[tab] !== undefined && editIndex[tab] !== null
          ? "Update"
          : "Submit"}
      </button>
    </form>
  );

  if (loading) {
    return <div className="p-4 text-center">Loading data...</div>;
  }

  return (
    <div className="admin-panel p-4 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link to="/adminCalendar">
          <Button variant="secondary">← Back to Main Page</Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Data Management</h1>

      <div className="tabs mb-6 flex gap-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn px-5 py-2 rounded font-semibold transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab} className={activeTab === tab ? "block" : "hidden"}>
          <h2 className="text-2xl font-semibold mb-4 capitalize">{tab}</h2>

          <button
            className="btn bg-green-600 text-white px-4 py-2 rounded mb-4"
            onClick={() => toggleForm(tab)}
          >
            Add New
          </button>

          {formVisible[tab] && renderForm(tab)}

          <div className="overflow-x-auto border border-gray-300 rounded shadow">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  {tabFields[tab].map((field, idx) => (
                    <th
                      key={idx}
                      className="text-left px-4 py-2 font-semibold text-gray-700"
                    >
                      {field === "id" ? "Classroom ID" : 
                       field === "code" ? "Course Code" : 
                       field === "year" ? "Year" :
                       field.charAt(0).toUpperCase() + field.slice(1)}
                    </th>
                  ))}
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data[tab].length === 0 ? (
                  <tr>
                    <td
                      colSpan={tabFields[tab].length + 1}
                      className="text-center text-gray-500 italic py-6"
                    >
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  data[tab].map((entry, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {tabFields[tab].map((field, fidx) => (
                        <td
                          key={fidx}
                          className="px-4 py-3 align-middle"
                          style={{ minWidth: field === "capacity" ? "100px" : "auto" }}
                        >
                          {field === "year" ? (
                            `Year ${entry[field]}`
                          ) : field === "locked" ? (
                            entry[field] === "Yes" ? (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                Locked
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">No</span>
                            )
                          ) : (
                            entry[field]
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          className="btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          onClick={() => toggleForm(tab, idx)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          onClick={() => handleDelete(tab, idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;