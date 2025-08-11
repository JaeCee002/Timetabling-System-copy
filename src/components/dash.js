import React, { useState } from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./dash.css";

const tabs = ["courses", "classrooms"];

const tabFields = {
  courses: ["Course Name", "Course Code (e.g. CS120)", "Shared?"],
  classrooms: ["Classroom Name or Code", "Capacity", "Locked?"]
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

  const handleFormSubmit = (tab) => {
    const entry = {};
    tabFields[tab].forEach((field) => {
      if (field === "Capacity") {
        // Store capacity as number
        entry[field] = Number(formData[tab]?.[field]) || 0;
      } else {
        // Store string fields as-is
        entry[field] = formData[tab]?.[field] || "No";
      }
    });

    if (editIndex[tab] !== undefined && editIndex[tab] !== null) {
      setData((prev) => ({
        ...prev,
        [tab]: prev[tab].map((item, idx) =>
          idx === editIndex[tab] ? entry : item
        )
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [tab]: [...prev[tab], entry]
      }));
    }
    setFormVisible((prev) => ({ ...prev, [tab]: false }));
    setEditIndex((prev) => ({ ...prev, [tab]: null }));
    setFormData((prev) => ({ ...prev, [tab]: {} }));
  };

  const handleDelete = (tab, idx) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setData((prev) => ({
        ...prev,
        [tab]: prev[tab].filter((_, i) => i !== idx)
      }));
    }
  };

  const renderForm = (tab) => {
    return (
      <form
        className="form-container flex flex-col gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleFormSubmit(tab);
        }}
      >
        {tabFields[tab].map((field, index) => {
          // For Shared? and Locked? use dropdown
          if (field === "Shared?" || field === "Locked?") {
            return (
              <div key={index} className="flex flex-col">
                <label className="mb-1 font-medium">{field}</label>
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
          } else if (field === "Capacity") {
            return (
              <div key={index} className="flex flex-col">
                <label className="mb-1 font-medium">{field}</label>
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
            return (
              <div key={index} className="flex flex-col">
                <label className="mb-1 font-medium">{field}</label>
                <input
                  type="text"
                  placeholder={field}
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
  };

  return (
    <div className="admin-panel p-4 max-w-4xl mx-auto">
      {/* Back to AdminCalendar Link */}
      <div className="mb-4">
        <Link
          to="/adminCalendar"
          className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          ← Back to Main Page
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Data Management</h1>

      {/* Tabs */}
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

      {/* Tab Content */}
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
                      {field}
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
                          style={{ minWidth: field === "Capacity" ? "100px" : "auto" }}
                        >
                          {/* Special rendering for icons */}
                          {tab === "courses" && field === "Shared?" ? (
                            entry[field] === "Yes" ? (
                              <span className="flex items-center gap-1 text-green-600 font-semibold">
                                <i className="bi bi-people-fill"></i> Shared
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">No</span>
                            )
                          ) : tab === "classrooms" && field === "Locked?" ? (
                            entry[field] === "Yes" ? (
                              <i
                                title="Locked"
                                className="bi bi-lock-fill text-red-600"
                                style={{ fontSize: "1.3em" }}
                              ></i>
                            ) : (
                              <i
                                title="Unlocked"
                                className="bi bi-unlock-fill text-green-600"
                                style={{ fontSize: "1.3em" }}
                              ></i>
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
                          aria-label={`Edit ${tab} entry`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          onClick={() => handleDelete(tab, idx)}
                          aria-label={`Delete ${tab} entry`}
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
