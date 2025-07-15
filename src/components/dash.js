import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchPendingUsers, updatePendingUser } from "../api/timetableAPI";
import { useAuth} from "./AuthContext";
import "./dash.css";

const tabs = ["departments", "programs", "courses", "lecturers", "classrooms"];

const tabFields = {
  departments: ["Department Name"],
  programs: ["Program Name"],
  courses: ["Course Name", "Course Code (e.g. CS120)"],
  lecturers: ["Lecturer Name", "Lecturer ID or Email"],
  classrooms: ["Classroom Name or Code"]
};

const AdminDashboard = () => {
  const {isAuthenticated} = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "departments";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formVisible, setFormVisible] = useState({});
  const [formData, setFormData] = useState({});
  const [data, setData] = useState({
    departments: [],
    programs: [],
    courses: [],
    lecturers: [],
    classrooms: [],
  });
  const [editIndex, setEditIndex] = useState({});

  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPendingUsers()
      .then((data) => {
        const formatted = data.users;
        setPendingUsers(formatted);
      })
      .catch((err) => console.error("Failed to fetch pending users:", err));
  }, [isAuthenticated]);


  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

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
    const fields = tabFields[tab];
    const entry = {};
    fields.forEach((placeholder, i) => {
      entry[placeholder] = formData[tab]?.[placeholder] || "";
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

  const handleEdit = (tab, idx) => {
    toggleForm(tab, idx);
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
        className="form-container flex flex-col gap-2 mb-2"
        onSubmit={e => {
          e.preventDefault();
          handleFormSubmit(tab);
        }}
      >
        {tabFields[tab].map((placeholder, index) => (
          <div key={index} className="flex flex-col">
            <label htmlFor={`${tab}-${placeholder}`} className="mb-1 font-medium">
              {placeholder}
            </label>
            <input
              id={`${tab}-${placeholder}`}
              type="text"
              placeholder={placeholder}
              className="input border rounded px-2 py-1"
              value={formData[tab]?.[placeholder] || ""}
              onChange={e => handleInputChange(tab, placeholder, e.target.value)}
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="btn submit bg-blue-600 text-white px-4 py-1 rounded mt-2"
        >
          {editIndex[tab] !== undefined && editIndex[tab] !== null ? "Update" : "Submit"}
        </button>
      </form>
    );
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSetRole = (userId) => {
    const role = selectedRoles[userId];
    if (!role) return alert("Please select a role.");

    updatePendingUser(userId, role)
      .then((res) => {
        if (res.status !== 'success') throw new Error("Failed to set role");
        // Remove user from pending list after update
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      })
      .catch((err) => {
        console.error("Role set error:", err);
        alert("Failed to set role.");
      });
  };


  return (
    <>
      {/* Back button outside the dashboard, top left */}
      <button
        className="btn bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => navigate("/adminCalendar")}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1000
        }}
      >
        ← Back to Main Page
      </button>

      {pendingUsers.length > 0 && (
        <div className="pending-users p-4 border border-gray-400 rounded mb-4">
          <h2 className="text-xl font-bold mb-2">Pending User Role Assignments</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Email</th>
                <th className="px-2 py-1 text-left">Assign Role</th>
                <th className="px-2 py-1 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-2 py-1">{user.email}</td>
                  <td className="px-2 py-1">
                    <select
                      className="border px-2 py-1 rounded"
                      value={selectedRoles[user.user_id] || ""}
                      onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="student">Student</option>
                    </select>
                  </td>
                  <td className="px-2 py-1">
                    <button
                      className="btn bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handleSetRole(user.user_id)}
                    >
                      Set Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <div className="admin-panel p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Data Management</h1>

        <div className="tabs mb-4 flex gap-2">
          {tabs.map((tab) => (
            <a
              key={tab}
              href={`?tab=${tab}`}
              className={`tab-btn px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </a>
          ))}
        </div>

        {tabs.map((tab) => (
          <div key={tab} className={`tab-content ${activeTab === tab ? 'block' : 'hidden'}`}>
            <h2 className="text-xl font-semibold mb-2 capitalize">{tab}</h2>
            <div className="actions mb-2 flex gap-2">
              <button
                className="btn bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => toggleForm(tab)}
              >
                Add New
              </button>
            </div>
            {formVisible[tab] && renderForm(tab)}
            <div className="placeholder border border-dashed border-gray-400 p-4 mt-2">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {tabFields[tab].map((field, idx) => (
                      <th key={idx} className="px-2 py-1 text-left">{field}</th>
                    ))}
                    <th className="px-2 py-1 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data[tab].length === 0 && (
                    <tr>
                      <td colSpan={tabFields[tab].length + 1} className="text-gray-500 italic">
                        No data yet.
                      </td>
                    </tr>
                  )}
                  {data[tab].map((entry, idx) => (
                    <tr key={idx} className="border-t">
                      {tabFields[tab].map((field, fidx) => (
                        <td
                          key={fidx}
                          className="px-4 py-2 font-bold text-xl text-white bg-blue-700 rounded shadow"
                          style={{
                            letterSpacing: "1px",
                            border: "2px solid #2563eb",
                            background: "#2563eb"
                          }}
                        >
                          {entry[field]}
                        </td>
                      ))}
                      <td className="px-2 py-1 flex gap-1">
                        <button
                          className="btn bg-yellow-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleEdit(tab, idx)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn bg-red-600 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleDelete(tab, idx)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminDashboard;