import axios from "./apiClient";

export const login = async(email, password) => {
    const response = await axios.post("/", {email, password});
    return response.data;
}

export const fetchAdminTimetable = async() => {
    const response = await axios.get("/timetable", {
        params: {},
    });
    return response.data;
}

export const fetchUserTimetable = async() => {
    const response = await axios.get("/timetable", {
        params: {},
    });
    return response.data;
}

export const fetchLecturers = async() => {
    const response = await axios.get("/timetable/lecturers", {
        params: {},
    });
    return response.data;
}

export const fetchClassrooms = async() => {
    const response = await axios.get("/timetable/classes", {
        params: {},
    });
    return response.data;
}

export const fetchSchools = async(university) => {
    const response = await axios.get("/timetable/schools", {
        params: {university},
    });
    return response.data;
}

export const fetchPrograms = async(school) => {
    const response = await axios.get("/timetable/programs", {
        params: {school},
    });
    return response.data;
}

export const fetchCourses = async(program, year) => {
    const response = await axios.get("/timetable/courses", {
        params: {program, year},
    });
    return response.data;
}

export const fetchPendingUsers = async() => {
    const response = await axios.get("/pending", {
        params: {},
    });
    return response.data;
}

export const saveTimetable = async(entries) => {
    const response = await axios.post("/timetable/save", {entries});
    return response.data;
}