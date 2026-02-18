const API_URL = 'https://attendance-backend-gljr.onrender.com/api';


export const OrbitAPI = {
    
    fetchData: async () => {
        const res = await fetch(`${API_URL}/data`);
        return await res.json();
    },

   
    syncMembers: async (members) => {
        await fetch(`${API_URL}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(members)
        });
    },

    
    syncAttendance: async (attendance) => {
        await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendance)
        });
    }
};