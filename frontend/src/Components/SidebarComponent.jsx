import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeContext } from './ThemeContext';
import { getActiveEmployees, getDepartements } from './API';
import { FiSearch, FiFilter, FiUser, FiClock } from 'react-icons/fi'; // Cleaner icons
import { BiChevronDown, BiLogOutCircle } from 'react-icons/bi';

const SidebarComponent = () => {
  const { theme } = useContext(ThemeContext);
  
  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // status configuration (Colors and Labels)
  const getStatusConfig = (status) => {
    switch (status) {
      case 'on-time': return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'On Time' };
      case 'late': return { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: 'Late' };
      case 'early-leave': return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Early Leave' };
      case 'absent': return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Absent' };
      case 'leave': return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'On Leave' };
      default: return { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', label: 'Present' };
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatTime = (timeInput) => {
    if (!timeInput) return '--:--';
    if (typeof timeInput === 'string' && timeInput.includes(':') && timeInput.length <= 8) return timeInput;
    
    const date = new Date(timeInput);
    return isNaN(date.getTime()) 
      ? '--:--' 
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // data processins
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesDept = selectedDept === 'All' || emp.departmentId === parseInt(selectedDept);
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [employees, selectedDept, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: employees.length,
      onTime: employees.filter(e => e.status === 'on-time').length,
      late: employees.filter(e => e.status === 'late').length,
      earlyLeave: employees.filter(e => e.status === 'early-leave').length,
      other: employees.filter(e => !['on-time', 'late', 'early-leave'].includes(e.status)).length
    };
  }, [employees]);

  const departmentLookup = useMemo(() => {
    const lookup = {};
    departments.forEach(d => { lookup[d.id] = d.name; });
    return lookup;
  }, [departments]);

  // --- Effects ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        getActiveEmployees(),
        getDepartements()
      ]);

      
      if (deptRes.status === true || Array.isArray(deptRes)) {
          const data = deptRes.data; 
          setDepartments(data);
      }

      if (empRes.status === true || Array.isArray(empRes)) {
          const data = empRes.data;
          // Process initial data
          const processed = Array.isArray(data) ? data.map(emp => ({
            ...emp,
            status: emp.status || 'present', 
            loginTime: emp.timestamp || new Date() 
          })) : [];
          setEmployees(processed);
      } else {
          setEmployees([]);
      }
    } catch (err) {
      setError('Connection lost');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchData();

    // Event Listener for real-time updates
    const handlePresenceUpdate = () => {
      fetchData();
    };

    window.addEventListener('presenceUpdate', handlePresenceUpdate);
    return () => window.removeEventListener('presenceUpdate', handlePresenceUpdate);
  }, [fetchData]);

  // --- Render Sub-components ---
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );


  // --- Main Render ---
  return (
    <div className={`h-full flex flex-col w-72 xl:w-80 shadow-2xl transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-100'}`}>
      
      {/* 1. Header & Stats */}
      <div className={`p-5 pb-2 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} z-10`}>
        <div className="flex justify-between items-baseline mb-4">
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Live Attendance
          </h2>
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {stats.total} Present
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
           <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
              <span className="text-lg font-bold text-emerald-500">{stats.onTime}</span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-600/70 font-bold">On Time</span>
           </div>
           <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${theme === 'dark' ? 'bg-orange-900/10 border-orange-900/30' : 'bg-orange-50 border-orange-100'}`}>
              <span className="text-lg font-bold text-orange-500">{stats.late}</span>
              <span className="text-[10px] uppercase tracking-wider text-orange-600/70 font-bold">Late</span>
           </div>
           <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${theme === 'dark' ? 'bg-yellow-900/10 border-yellow-900/30' : 'bg-yellow-50 border-yellow-100'}`}>
              <span className="text-lg font-bold text-yellow-500">{stats.earlyLeave}</span>
              <span className="text-[10px] uppercase tracking-wider text-yellow-600/70 font-bold">Early</span>
           </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search employee..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-xl transition-all outline-none border ${
                theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50'
              }`}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`appearance-none block w-full pl-10 pr-8 py-2.5 text-sm rounded-xl cursor-pointer outline-none border ${
                theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-gray-300 focus:border-blue-500' 
                : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white focus:border-blue-400'
              }`}
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <BiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Employee List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        {loading ? (
           <SkeletonLoader />
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-40 text-red-500 text-sm">
             <BiLogOutCircle className="w-6 h-6 mb-2" />
             {error}
           </div>
        ) : filteredEmployees.length === 0 ? (
           <div className="text-center py-10 opacity-50">
             <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-400" />
             <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>No active employees found.</p>
           </div>
        ) : (
          <div className="space-y-3 mt-2">
            {filteredEmployees.map((emp, index) => {
              const statusInfo = getStatusConfig(emp.status);
              
              return (
                <div 
                  key={index} 
                  className={`group relative flex items-center p-3 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                    theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                    : 'bg-white border-gray-100 hover:border-blue-200'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mr-4">
                    <div 
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    >
                      {getInitials(emp.firstName, emp.lastName)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className={`text-sm font-bold truncate pr-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800 group-hover:text-blue-600'}`}>
                        {emp.firstName} {emp.lastName}
                      </h3>
                      
                      <div className="flex items-center text-xs font-medium text-gray-400 dark:text-gray-500">
                         <FiClock className="w-3 h-3 mr-1" />
                         {formatTime(emp.loginTime)}
                      </div>
                    </div>

                    <p className={`text-xs truncate mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                       {departmentLookup[emp.departmentId] || 'Unknown Dept'}
                    </p>

                    {/* Status Badge */}
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${statusInfo.color}`}>
                       {statusInfo.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarComponent;