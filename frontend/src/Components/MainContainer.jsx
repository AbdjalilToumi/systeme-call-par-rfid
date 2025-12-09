import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';
import { getAttendanceStats, getDepartements } from './API';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BiChevronDown, BiBriefcase, BiFilterAlt } from 'react-icons/bi';

const MainContainer = () => {
  const { theme } = useContext(ThemeContext);
  
  // -- State --
  const [departments, setDepartments] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, onTime: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(false);

  // -- Filters State --
  // Default: Current Month, Daily view
  const [filters, setFilters] = useState({
    departmentId: '',
    period: 'day', // 'day', 'month', 'year'
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // 1st of month
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  // 1. Fetch Departments on Mount
  useEffect(() => {
    const fetchDepts = async () => {
      const res = await getDepartements();
      if (res.status && res.data.length > 0) {
        setDepartments(res.data);
        setFilters(prev => ({ ...prev, departmentId: res.data[0].id }));
      }
    };
    fetchDepts();
  }, []);



  // 3. Process Data for Chart & Summary
  const processChartData = (data) => {
    // Helper to format X-Axis label based on period
    const getLabel = (dateString) => {
      const date = new Date(dateString);
      if (filters.period === 'day') return date.getDate(); // Returns day number (1-31)
      if (filters.period === 'month') return date.toLocaleString('default', { month: 'short' }); // Returns Jan, Feb...
      if (filters.period === 'year') return date.getFullYear(); // Returns 2024, 2025...
      return dateString;
    };

    // Grouping Logic
    const grouped = data.reduce((acc, curr) => {
      // The backend returns a 'period' field (timestamp). We normalize it for the key.
      const key = getLabel(curr.period); 
      
      if (!acc[key]) {
        acc[key] = { name: key, onTime: 0, late: 0, absent: 0, sortDate: new Date(curr.period) };
      }
      
      acc[key].onTime += curr.totalOnTime;
      acc[key].late += curr.totalLate;
      acc[key].absent += curr.totalAbsences;
      return acc;
    }, {});

    // Sort by date to ensure chart flows correctly (1, 2, 3... or Jan, Feb, Mar...)
    const chartArray = Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate);
    setStatsData(chartArray);

    // Calculate Summary Totals
    const totalStats = data.reduce((acc, curr) => ({
      onTime: acc.onTime + curr.totalOnTime,
      late: acc.late + curr.totalLate,
      absent: acc.absent + curr.totalAbsences,
      total: acc.total + (curr.totalCheckIns || 0)
    }), { onTime: 0, late: 0, absent: 0, total: 0 });

    setSummary(totalStats);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  // 2. Fetch Stats when Filters Change
  useEffect(() => {
    if (!filters.departmentId) return;

    const fetchStats = async () => {
      setLoading(true);
      const res = await getAttendanceStats({
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        departmentId: filters.departmentId
      });

      if (res.status) {
        processChartData(res.data);
      } else {
        setStatsData([]);
        setSummary({ total: 0, onTime: 0, late: 0, absent: 0 });
      }
      setLoading(false);
    };

    fetchStats();
  }, [filters]);
  // Styles
  const inputStyle = `appearance-none text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme !== 'dark' ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-gray-700 border-gray-600 text-gray-200'}`;

  return (
    <div className={`p-4 md:p-6 min-h-screen ${theme !== 'dark' ? 'bg-gray-100 text-gray-800' : 'bg-gray-900 text-white'} transition-colors duration-200`}>
      
      {/* --- Filter Bar --- */}
      <div className={`mb-6 p-4 rounded-xl shadow-sm flex flex-wrap gap-4 items-center justify-between ${theme !== 'dark' ? 'bg-white' : 'bg-gray-800'}`}>
        <div className="flex items-center gap-2">
           <BiFilterAlt className="text-gray-400" />
           <span className="font-semibold text-sm">Filters</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Department */}
            <div className="relative">
                <select name="departmentId"  value={filters.departmentId} onChange={handleFilterChange} className={`${inputStyle} w-[300px]`}>
                    {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
                <BiChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Period */}
            <div className="relative">
                <select name="period" value={filters.period} onChange={handleFilterChange} className={`${inputStyle} w-[150px]`}>
                    <option value="day">Daily</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                </select>
                <BiChevronDown className="absolute right-2 top-3 text-gray-500 pointer-events-none" />
            </div>

            {/* Dates */}
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputStyle} />
            <span className="text-gray-400">-</span>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputStyle} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- LEFT COLUMN: Main Chart --- */}
        <div className={`flex-1 rounded-2xl p-6 shadow-sm ${theme !== 'dark' ? 'bg-white' : 'bg-gray-800'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Attendance Analytics</h2>
          </div>

          {/* Chart Area */}
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-gray-400 animate-pulse">Loading Data...</div>
            ) : statsData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400">No data found for this range</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData} barGap={4} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme !== 'dark' ? "#f3f4f6" : "#374151"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: theme !== 'dark' ? '#f3f4f6' : '#374151' }}
                    contentStyle={{ 
                        backgroundColor: theme !== 'dark' ? '#fff' : '#1f2937',
                        borderColor: theme !== 'dark' ? '#e5e7eb' : '#374151',
                        color: theme !== 'dark' ? '#000' : '#fff',
                        borderRadius: '8px' 
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                  <Bar dataKey="onTime" name="On-Time" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="late" name="Late" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: Stats Cards --- */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
          
          <div className={`p-6 rounded-2xl shadow-sm ${theme !== 'dark' ? 'bg-white' : 'bg-gray-800'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold">Summary</h3>
              <span className="text-xs text-gray-400">{departments.find(d=>d.id == filters.departmentId)?.name}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-4xl font-bold">{summary.total}</p>
                <p className="text-sm text-gray-500">Total Check-ins</p>
              </div>
              <div className={`p-3 rounded-full ${theme !== 'dark' ? 'bg-blue-50' : 'bg-gray-700'}`}>
                 <BiBriefcase className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-gray-700/30 border border-green-100 dark:border-green-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">On-time</span>
                <span className="font-bold text-green-600">{summary.onTime}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-50 dark:bg-gray-700/30 border border-yellow-100 dark:border-yellow-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Late</span>
                <span className="font-bold text-yellow-600">{summary.late}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-red-50 dark:bg-gray-700/30 border border-red-100 dark:border-red-900">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Absent</span>
                <span className="font-bold text-red-500">{summary.absent}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MainContainer;
