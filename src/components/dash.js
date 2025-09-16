import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./dash.css";
import { Button } from "react-bootstrap";
import { 
  fetchAllCourses,
  fetchClassrooms,
  fetchAllPrograms,
  addCourse,
  addClass,
  deleteClass,
  deleteCourse,
  editClass,
  editCourse
} from "../api/timetableAPI"; 
import { Card } from "react-bootstrap";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";

const tabs = ["courses", "classrooms"];

const tabFields = {
  courses: ["name", "code"],
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
  const [programs, setPrograms] = useState([]);
  const [editIndex, setEditIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [showProgramsModal, setShowProgramsModal] = useState(false);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);
  const formRef = useRef(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch programs
        const programsData = await fetchAllPrograms();
        setPrograms(Array.isArray(programsData?.programs) ? programsData.programs : []);

        // Fetch courses
        const coursesData = await fetchAllCourses();
        
        // Fetch classrooms
        const classroomsData = await fetchClassrooms();
        
        setData({
          courses: Array.isArray(coursesData?.courses) ? 
            coursesData.courses.map(c => ({
              name: c.course_name,
              code: c.course_code,
              programYears: c.programs || []
            })) : [],
          classrooms: Array.isArray(classroomsData?.classes) ? 
            classroomsData.classes.map(r => ({
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

  // Function to refresh data after successful operations
  const refreshData = async () => {
    try {
      const coursesData = await fetchAllCourses();
      const classroomsData = await fetchClassrooms();
      
      setData({
        courses: Array.isArray(coursesData?.courses) ? 
          coursesData.courses.map(c => ({
            name: c.course_name,
            code: c.course_code,
            programYears: c.programs || []
          })) : [],
        classrooms: Array.isArray(classroomsData?.classes) ? 
          classroomsData.classes.map(r => ({
            id: r.room_id,
            capacity: r.capacity,
            locked: r.locked ? "Yes" : "No"
          })) : []
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Form management functions
  const toggleForm = (tab, index = null) => {
  setFormVisible((prev) => ({ ...prev, [tab]: !prev[tab] }));
  setEditIndex((prev) => ({ ...prev, [tab]: index }));

  if (tab === "courses") {
    if (index !== null && data[tab][index]) {
      const course = data[tab][index];
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...course,
          oldCode: course.code,
          programYears: (course.programYears && course.programYears.length > 0)
            ? course.programYears.map(py => ({
                program: py.program_name || py.program || "",
                year: String(py.year || "1")
              }))
            : [{ program: "", year: "1" }]
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [tab]: { programYears: [{ program: "", year: "1" }] }
      }));
    }
  } else if (index !== null && data[tab][index]) {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...data[tab][index] }
    }));
  }

  // Scroll to top of the page when editing
  if (index !== null) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  //scroll the form into view if needed
  if (index !== null && formRef.current) {
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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

  // Program/Year pair management for courses
  const addProgramYearPair = () => {
    const currentProgramYears = formData.courses?.programYears || [];
    const newProgramYears = [...currentProgramYears, { program: "", year: "1" }];
    handleInputChange("courses", "programYears", newProgramYears);
  };

  const removeProgramYearPair = (index) => {
    const currentProgramYears = formData.courses?.programYears || [];
    const newProgramYears = currentProgramYears.filter((_, i) => i !== index);
    handleInputChange("courses", "programYears", newProgramYears);
  };

  const updateProgramYearPair = (index, field, value) => {
    const currentProgramYears = [...(formData.courses?.programYears || [])];
    currentProgramYears[index] = {
      ...currentProgramYears[index],
      [field]: value
    };
    handleInputChange("courses", "programYears", currentProgramYears);
  };

  // Form submission
  const handleFormSubmit = async (tab) => {
    try {
      const isEditing = editIndex[tab] !== undefined && editIndex[tab] !== null;

      if (tab === "courses") {
        // Build payload for add/edit course
        const course = formData.courses || {};
        let response;
        if (isEditing) {
          // For editing, send old code under code, new code under newCode, and program/year pairs
          const editPayload = {
            code: course.oldCode || course.code,
            newCode: course.code,
            name: course.name || null,
            programs: {}
          };
          (course.programYears || []).forEach(pair => {
            if (pair.program) {
              editPayload.programs[pair.program] = pair.year;
            }
          });
          response = await editCourse(editPayload);
        } else {
          // For adding, keep original payload structure
          const addPayload = {
            code: course.code,
            name: course.name,
            programYears: (course.programYears || []).map(pair => ({
              program: pair.program,
              year: parseInt(pair.year)
            }))
          };
          response = await addCourse(addPayload);
        }

        if (response.status !== 'success') {
          throw new Error(response.error || `Failed to ${isEditing ? 'update' : 'save'} course`);
        }
      } else {
        const payload = {
          id: formData[tab]?.id || "",
          capacity: Number(formData[tab]?.capacity) || 0,
          locked: formData[tab]?.locked === "Yes" ? 1 : 0
        };
        
        let response;
        if (isEditing) {
          // For editing classrooms, we only need id and capacity based on the PHP code
          response = await editClass({
            id: payload.id,
            capacity: payload.capacity
          });
        } else {
          response = await addClass(payload);
        }

        if(response.status === 'error'){
          throw new Error(response.message);
        } else if (response.status !== 'success') {
          throw new Error(response.error || `Failed to ${isEditing ? 'update' : 'save'} classroom`);
        }
      }

      // Refresh data after successful submission
      await refreshData();

      setFormVisible((prev) => ({ ...prev, [tab]: false }));
      setEditIndex((prev) => ({ ...prev, [tab]: null }));
      setFormData((prev) => ({ ...prev, [tab]: {} }));
      
      alert(`${tab.slice(0, -1)} ${isEditing ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Delete functionality
  const handleDelete = async (tab, idx) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const item = data[tab][idx];
        let response;

        if (tab === "courses") {
          response = await deleteCourse({ course: item.code });
        } else {
          response = await deleteClass({ class: item.id });
        }

        if (response && response.status === 'success') {
          await refreshData();
          alert(`${tab.slice(0, -1)} deleted successfully!`);
        } else {
          throw new Error(response?.error || 'Failed to delete');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert(`Failed to delete ${tab.slice(0, -1)}: ${error.message}`);
      }
    }
  };

  // Handler to open modal for programs sharing a course
  const handleShowProgramsModal = (course) => {
    setSelectedCourseForModal(course);
    setShowProgramsModal(true);
  };

  // Helper function to determine if course is shared
  const isCourseShared = (course) => {
    return course.programYears && course.programYears.length > 1;
  };

  // Render program/year inputs for course form
  const renderProgramYearInputs = () => {
    const programYears = formData.courses?.programYears || [];
    
    return (
      <div className="program-years-section mb-4">
        {programYears.length > 0 && (
          <label className="mb-2 fw-bold">Programs and Years</label>
        )}
        {programYears.map((pair, idx) => (
          <div key={idx} className="d-flex align-items-center mb-2 gap-2">
            <div className="flex-grow-1">
              <input
                type="text"
                list={`programOptions-${idx}`}
                placeholder="Search Program..."
                className="form-control"
                value={pair.program}
                onChange={(e) => updateProgramYearPair(idx, "program", e.target.value)}
                required
              />
              <datalist id={`programOptions-${idx}`}>
                {programs
                  .filter(p => p.program_name.toLowerCase().includes(pair.program.toLowerCase()))
                  .map((p, i) => (
                    <option key={i} value={p.program_name} />
                  ))}
              </datalist>
            </div>
            <select
              className="form-select ms-2"
              value={pair.year}
              onChange={(e) => updateProgramYearPair(idx, "year", e.target.value)}
              required
              style={{ maxWidth: 140 }}
            >
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>
            {programYears.length > 1 && (
              <button
                type="button"
                className="btn btn-danger ms-2"
                onClick={() => removeProgramYearPair(idx)}
                style={{ fontWeight: "bold", fontSize: "1.2rem", lineHeight: "1" }}
                aria-label="Remove Program/Year"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-primary rounded px-4 py-2 shadow-sm fw-semibold mt-2"
          onClick={addProgramYearPair}
        >
          {programYears.length > 0 ? "Add Another Program/Year" : "Add Program/Year"}
        </button>
      </div>
    );
  };

  // Render form based on tab
  const renderForm = (tab) => {
    const isEditing = editIndex[tab] !== undefined && editIndex[tab] !== null;
    
    return (
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
                  readOnly={false} // Always editable
                />
              </div>
            );
          }
        })}
        
        {tab === "courses" && renderProgramYearInputs()}
        
        <button
          type="submit"
          className="btn submit bg-blue-600 text-white px-4 py-1 rounded mt-2"
        >
          {isEditing ? "Update" : "Submit"}
        </button>
        
        <button
          type="button"
          className="btn bg-gray-500 text-white px-4 py-1 rounded"
          onClick={() => {
            setFormVisible((prev) => ({ ...prev, [tab]: false }));
            setEditIndex((prev) => ({ ...prev, [tab]: null }));
            setFormData((prev) => ({ ...prev, [tab]: {} }));
          }}
        >
          Cancel
        </button>
      </form>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-panel p-4 max-w-6xl mx-auto">
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
            Add New {tab.slice(0, -1)}
          </button>

          {formVisible[tab] && (
            <div ref={formRef}>
              {renderForm(tab)}
            </div>
          )}

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
                       field.charAt(0).toUpperCase() + field.slice(1)}
                    </th>
                  ))}
                  {tab === "courses" && (
                    <th className="text-left px-4 py-2 font-semibold text-gray-700">
                      Shared?
                    </th>
                  )}
                  <th className="text-left px-4 py-2 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data[tab].length === 0 ? (
                  <tr>
                    <td
                      colSpan={tabFields[tab].length + (tab === "courses" ? 2 : 1)}
                      className="text-center text-gray-500 italic py-6"
                    >
                      No {tab} found. Add some data to get started.
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
                          {field === "locked" ? (
                            entry[field] === "Yes" ? (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                Locked
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">Unlocked</span>
                            )
                          ) : (
                            entry[field]
                          )}
                        </td>
                      ))}
                      
                      {/* Show shared status for courses */}
                      {tab === "courses" && (
                        <td className="px-4 py-3 align-middle">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShowProgramsModal(entry)}
                            style={{ padding: "2px 8px", fontSize: "0.95em" }}
                          >
                            {isCourseShared(entry) ? "Yes" : "No"}
                          </Button>
                        </td>
                      )}
                      
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

      {/* Programs Modal */}
      <Modal show={showProgramsModal} onHide={() => setShowProgramsModal(false)} centered>
        <ModalHeader closeButton>
          <ModalTitle>
            Programs using {selectedCourseForModal?.name}
          </ModalTitle>
        </ModalHeader>
        <ModalBody>
          {Array.isArray(selectedCourseForModal?.programYears) && selectedCourseForModal.programYears.length > 0 ? (
            selectedCourseForModal.programYears.map((py, idx) => (
              <div key={idx} className="mb-2 p-2 border rounded d-flex justify-content-between align-items-center">
                <span>{py.program_name || py.program || 'Unknown Program'}</span>
                <span>Year: {py.year}</span>
              </div>
            ))
          ) : (
            <div>No programs found for this course.</div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AdminDashboard;