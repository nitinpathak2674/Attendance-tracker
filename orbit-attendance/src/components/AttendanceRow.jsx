import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const AttendanceRow = ({ member, status, onToggle }) => {
    const isPresent = status === 'present';
    
   // UI CONSISTENCY: Applied a unified light-blue theme with bold, high-contrast text to ensure visual clarity and a professional admin experience.
    const avatarStyle = "-[#eef2ff] text-[#4f46e5] font-bold text-sm border border-[#e0e7ff]";

    return (
        <div 
            onClick={() => onToggle(member.id)} 
            className={`p-4 flex items-center justify-between cursor-pointer border-b border-slate-100 last:border-0 transition-all ${
                isPresent ? 'bg-blue-50/50' : 'hover:bg-gray-50'
            }`}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/*  Avatar Circle: High-contrast Avatar icons with bold typography */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${avatarStyle}`}>
                    {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                </div>
                
                <div className="flex-1 min-w-0">
                   
                    <p className="font-bold text-slate-700 truncate pr-12 text-sm md:text-base" title={member.name}>
                        {member.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate pr-12 uppercase" title={member.role}>
                        {member.role}
                    </p>
                </div>
            </div>

            <div className="flex-shrink-0 ml-2">
                {isPresent ? (
                    <CheckCircle2 className="text-blue-500" size={22} />
                ) : (
                    <Circle className="text-slate-200" size={22} />
                )}
            </div>
        </div>
    );
};

export default AttendanceRow;