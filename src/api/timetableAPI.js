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

export const saveAdminTimetable = async(payload) => {
    console.log("🌐 API: Sending payload:", payload);

    const response = await axios.post("/timetable/save", payload, {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true
    });
    return response.data;
};
//  export const saveAdminTimetable = async (payload) => {
//     try {
//         console.log("🌐 API: Sending payload:", payload);
        
//         // Create FormData to send as multipart/form-data (like a traditional form)
//         const formData = new FormData();
        
//         // Add individual fields that PHP expects in $_POST
//         formData.append('program_name', payload.program_name);
//         formData.append('year', payload.year);
        
//         // Add entries as JSON string (PHP will need to json_decode this)
//         formData.append('entries', JSON.stringify(payload.entries));

//         const response = await axios.post(
//             "/timetable/save",
//             formData,  // Changed from 'payload' to 'formData'
//             {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',  // Changed from 'application/json'
//                 },
//                 withCredentials: true
//             }
//         );

//         console.log("✅ API: Save successful:", response.data);
//         return response.data;
        
//     } catch (error) {
//         console.error("❌ API: Save failed:", error);
//         throw error;
//     }
// };

// export const saveAdminTimetable = async(school, program, year, events) => {
//     const response = await axios.post("/timetable/save", {
//         school,
//         program,
//         year,
//         events
//     });
//     return response.data;
// };
