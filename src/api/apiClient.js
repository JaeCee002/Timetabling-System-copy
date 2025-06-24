import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost/timetable_backend",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

export default instance;