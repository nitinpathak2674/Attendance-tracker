/**
 * ============================================================
 *  PROJECT SETUP & RUN INSTRUCTIONS (BACKEND)
 * ============================================================
 * * STEP 1: Open a NEW terminal in the 'backend' folder. (cd backend)
 * STEP 2: Copy and paste the following commands:
 * * npm install && node server.js
 * * ------------------------------------------------------------
 *  WHAT THIS DOES:
 * 1. 'npm install' - Installs Express, CORS, and Body-parser.
 * 2. 'node server.js' - Starts the API server on http://localhost:5000.
 * *  
 * ============================================================
 */


const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5000;

// MIDDLEWARE: Essential for cross-origin requests and parsing JSON payloads
app.use(cors());
app.use(express.json());

const DATA_FILE = './data.json';

// Safe Read Function
const getData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const initialData = { members: [], attendance: {} };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const content = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(content || '{"members":[], "attendance":{}}');
    } catch (err) {
        console.error("Read Error:", err);
        return { members: [], attendance: {} };
    }
};

// Safe Write Function ensures data is physically persisted to the disk
const saveData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Write Error:", err);
    }
};

// API ROUTES: Clean set of endpoints for CRUD and Attendance marking
app.get('/api/data', (req, res) => res.json(getData()));

// Sync Member list (Add/Remove operations)
app.post('/api/members', (req, res) => {
    try {
        const data = getData();
        data.members = req.body;
        saveData(data);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save members" });
    }
});


// Sync Attendance records for specific dates
app.post('/api/attendance', (req, res) => {
    try {
        const data = getData();
        data.attendance = req.body;
        saveData(data);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save attendance" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));