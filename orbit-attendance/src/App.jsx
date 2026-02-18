/**
 * ============================================================
 * PROJECT SETUP & RUN INSTRUCTIONS (FRONTEND)
 * ============================================================
 * STEP 1: Open a NEW terminal in the 'orbit-attendance' folder (cd orbit-attendance). Frontend folder is 'orbit-attendance'.
 * STEP 2: Install dependencies: 
 * Run 'npm install' to install React, Lucide-React, and Recharts. 
 * STEP 3: Launch the application:
 * Run 'npm run dev' to start the Vite development server. 
 * ------------------------------------------------------------
 * NOTE: The app will typically run on http://localhost:5173.
 * ============================================================
 */



import React, { useState, useEffect } from 'react';
import { OrbitAPI } from './utils/storage';
import AttendanceRow from './components/AttendanceRow';
import Dashboard from './components/Dashboard';
import { Save, Users, Trash2, CheckCircle, AlertCircle, Plus, Info } from 'lucide-react';

/**
 * MAIN COMPONENT: Manages application state for members, attendance records, 
 * and handles core CRUD operations with real-time UI synchronization.  
 */

function App() {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [members, setMembers] = useState([]);
    const [records, setRecords] = useState({});
    const [allAttendance, setAllAttendance] = useState({});
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState(''); 
    const [isDirty, setIsDirty] = useState(false);


    // PERSISTENCE: Fetches existing member and attendance data from the backend API 
     const loadEverything = async () => {
        try {
            const data = await OrbitAPI.fetchData();
            setMembers(data.members || []);
            setAllAttendance(data.attendance || {});
        } catch (error) { console.error("Load Error"); }
    };

    useEffect(() => { loadEverything(); }, []);

    // STATE SYNC: Synchronizes local attendance records when date or member list changes
    useEffect(() => {
        const currentDayData = allAttendance[date] || {};
        const initialRecords = {};
        members.forEach(m => { initialRecords[m.id] = currentDayData[m.id] || 'absent'; });
        setRecords(initialRecords);
        setIsDirty(false); 
    }, [date, members, allAttendance]);

    // BULK ACTIONS: Provides quick "All Present/Absent" functionality as per requirements
    const markAll = (status) => {
        const updated = {};
        members.forEach(m => updated[m.id] = status);
        setRecords(updated);
        setIsDirty(true); 
    };

    // STATE UPDATE: Toggles individual attendance status and flags the date as "unsaved" (isDirty)

    const handleToggle = (id) => {
        setRecords(prev => ({...prev, [id]: prev[id] === 'present' ? 'absent' : 'present'}));
        setIsDirty(true); 
    };

    // MEMBER MANAGEMENT: Handles addition and deletion of members with backend sync
    const handleDeleteMember = async (id) => {
        if (window.confirm("Are you sure you want to remove this member?")) {
            try {
                const updatedMembers = members.filter(m => m.id !== id);
                await OrbitAPI.syncMembers(updatedMembers);
                setMembers(updatedMembers);
                setSuccessMsg("Member removed successfully!");
                setTimeout(() => setSuccessMsg(''), 3000);
            } catch (error) {
                alert("Unable to delete member. Connection lost with server!");
            }
        }
    };
    

    // VALIDATION & ADDITION: Ensures required fields are present and syncs the new member to the backend.
    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newName.trim() || !newRole.trim()) {
            setError("Name and Role are required"); 
            setTimeout(() => setError(''), 3000);
            return;
        }
        try {
            const newMember = { id: Date.now().toString(), name: newName.trim(), role: newRole.trim(), deleted: false };
            const updatedMembers = [...members, newMember];
            await OrbitAPI.syncMembers(updatedMembers);
            setMembers(updatedMembers);
            setError(''); 
            setSuccessMsg("Member Added!"); 
            setTimeout(() => setSuccessMsg(''), 3000);
            setNewName(''); setNewRole('');
        } catch (error) { alert("Add failed!"); }
    };

    // DATA PERSISTENCE: Synchronizes local state with the backend server to ensure permanent storage of attendance records.
    const handleSave = async () => {
        try {
            const updatedAttendance = { ...allAttendance, [date]: records };
            await OrbitAPI.syncAttendance(updatedAttendance);
            setAllAttendance(updatedAttendance);
            setIsDirty(false); 
            setSuccessMsg("Attendance Saved!");
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) { alert("Saver failed! Please check server is running"); }
    };
    
// DATA MODELING: Transforms raw records into chart-ready stats for the dashboard
    const stats = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(date);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayData = (dateStr === date) ? records : allAttendance[dateStr];
        return {
            date: dateStr.split('-').slice(1).join('/'),
            count: Object.values(dayData || {}).filter(s => s === 'present').length
        };
    });


    // UX FEEDBACK: Renders animated success notifications for user actions (Add, Delete, Save) with auto-hide logic.
    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            
            {successMsg && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <CheckCircle className="text-emerald-400" size={18} />
                    <span className="text-sm font-bold">{successMsg}</span>
                </div>
            )}

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    {/* Integrating chart library for actionable insights */}
                    <h1 className="text-3xl font-black text-slate-900 uppercase">Attendance Tracker</h1>
                    <Dashboard data={stats} />
                    
                    <form onSubmit={handleAddMember} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={16}/> Add Member</h3>
                        {error && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}
                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" className="w-full mb-3 p-3 bg-slate-50 border rounded-xl" />
                        <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role" className="w-full mb-4 p-3 bg-slate-50 border rounded-xl" />
                        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Add to Team</button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 flex flex-col min-h-[650px]">
                    <div className="p-8 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-[2rem]">
                        <span className="font-bold text-lg flex items-center gap-2"><Users size={20} /> Team ({members.length})</span>
                        <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="bg-slate-100 px-4 py-2 rounded-xl font-bold outline-none cursor-pointer" />
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="flex gap-4 p-6 bg-slate-50/50 border-b">
                            <button onClick={() => markAll('present')} className="flex-1 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100">
                                <CheckCircle size={14} /> All Present
                            </button>
                            <button onClick={() => markAll('absent')} className="flex-1 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100">
                                <AlertCircle size={14} /> All Absent
                            </button>
                        </div>

                        {/*  YELLOW WARNING: When data is not available */}
                        {!allAttendance[date] && !isDirty && members.length > 0 && (
                            <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-medium flex items-center justify-center gap-2 animate-pulse">
                                <AlertCircle size={14} /> No saved record for this date.
                            </div>
                        )}

                        {isDirty && (
                            <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-xs font-medium flex items-center gap-2">
                                <Info size={14} /> Reminder: Changes for this date are not saved yet.
                            </div>
                        )}

                        {/*  ALL ABSENT MESSAGE: */}
                        {allAttendance[date] && !isDirty && members.length > 0 && !Object.values(records).includes('present') && (
                            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                                <AlertCircle size={14} /> All members were absent on this date.
                            </div>
                        )}

                        <div className="p-4">
                            {members.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 italic">No members found.</div>
                            ) : (
                                members.map((m) => (
                                    <div key={m.id} className="relative group border-b border-slate-50 flex items-center justify-between">
                                        <div className="flex-1">
                                            <AttendanceRow member={m} status={records[m.id]} onToggle={() => handleToggle(m.id)} />
                                        </div>
                                        <button onClick={() => handleDeleteMember(m.id)} className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all ml-2 mr-4">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-8 border-t rounded-b-[2rem]">
                        <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg">
                            <Save size={18} /> Sync & Save Attendance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;