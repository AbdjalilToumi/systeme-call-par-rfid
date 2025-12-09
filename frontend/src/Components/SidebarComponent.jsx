import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContext';
import { getActiveEmployees, getDepartements, API_BASE } from './API'
import { FaSearch, FaCircle } from 'react-icons/fa';
import { BiChevronDown } from 'react-icons/bi';

const SidebarComponent = () => {
  const { theme } = useContext(ThemeContext);
  
  // State for data
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  
  // Filter Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesDept = selectedDept === 'All' || emp.departmentId === parseInt(selectedDept);
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });


  // Calculate Status Counts for the Header
  const totalPresent = employees.length;
  const onTimeCount = employees.filter(e => e.status === 'On Time').length;
  const lateCount = employees.filter(e => e.status === 'Late').length;

  // Helper to lookup Dept Name
  const getDeptName = (id) => {
    console.log('Departments:', departments);
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : 'Unknown Department';
  };
  useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          
          // Parallel fetching for efficiency
          const [empRes, deptRes] = await Promise.all([
            getActiveEmployees(),
            getDepartements()
          ]);
  
          
          if (deptRes.status) {
            setDepartments(deptRes.data);
          }
  
          if (empRes.status) {

            const processedData = empRes.data.map(emp => ({
              ...emp,
              // Construct full image URL
              imageUrl: emp.imagePath ? `${API_BASE}/${emp.imagePath}` : null, 
              // Mocking data usually found in Attendance table
              loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: Math.random() > 0.3 ? 'On Time' : 'Late' 
            }));
            setEmployees(processedData);
          } else {
              // If 404 (no active employees), just set empty array
              setEmployees([]);
          }
        } catch (err) {
          setError('Failed to load dashboard data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  return (
    <div className={`h-full flex flex-col w-64 xl:w-80 shadow-lg ${theme !== 'dark' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'} transition-all duration-300`}>
      
      {/* --- Header Section --- */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          {/* **Style Changes for Title:** Use a slightly larger size and bolder weight for the title. */}
          <h2 className={`text-xl font-extrabold ${theme !== 'dark' ? 'text-gray-900' : 'text-white'}`}>
            Employees Logged In
          </h2>
        </div>
        
        {/* Mini Stats (Moved above Department Filter for quick visibility) */}
        {/* **Style Changes for Mini Stats:** Better spacing and distinct color pills. */}
        <div className="flex space-x-3 text-xs mb-4">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${theme !== 'dark' ? 'bg-green-100 text-green-700' : 'bg-green-900 text-green-400'}`}>
            On Time ({onTimeCount})
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${theme !== 'dark' ? 'bg-orange-100 text-orange-700' : 'bg-orange-900 text-orange-400'}`}>
            Late ({lateCount})
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${theme !== 'dark' ? 'bg-gray-100 text-gray-700' : 'bg-gray-700 text-gray-400'}`}>
            Total ({totalPresent})
          </span>
        </div>

        {/* Search Bar */}
        {/* **Style Changes for Search Bar:** Slightly deeper background, smoother rounded corners. */}
        <div className={`flex items-center px-3 py-2 rounded-xl mb-4 ${theme !== 'dark' ? 'bg-gray-100' : 'bg-gray-700'}`}>
          <FaSearch className="text-gray-400 mr-2 w-3.5 h-3.5" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent text-sm focus:outline-none placeholder-gray-400 ${theme !== 'dark' ? 'text-gray-700' : 'text-gray-200'}`}
          />
        </div>

        {/* Department Filter Dropdown (Moved to bottom of header) */}
        <div className="relative">
          <select 
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            // **Style Changes for Select:** Matched the input field style for consistency.
            className={`appearance-none text-sm font-medium w-full pr-8 pl-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme !== 'dark' ? 'text-gray-700 bg-gray-100 border border-transparent' : 'text-gray-300 bg-gray-700 border border-gray-600'}`}
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          {/* **Style Changes for Icon:** Adjusted position and size. */}
          <BiChevronDown className={`absolute right-3 top-2.5 pointer-events-none w-4 h-4 ${theme !== 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>
      </div>

      {/* --- List Section --- */}
      {/* **Style Changes for List Container:** Added a clear max height with padding. */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {loading ? (
           <p className="text-center text-gray-500 mt-10 text-sm">Loading active employees...</p>
        ) : error ? (
           <p className="text-center text-red-500 mt-10 text-sm">{error}</p>
        ) : filteredEmployees.length === 0 ? (
           <p className="text-center text-gray-500 mt-10 text-sm">No active employees found matching your criteria.</p>
        ) : (
          // **Style Changes for List:** Increased vertical spacing.
          <div className="space-y-3">
            {filteredEmployees.map((emp, index) => (
              // **Style Changes for Item:** Added hover effects, padding, and subtle rounded corners for a cleaner look.
              <div key={index} className={`flex items-start p-2 rounded-lg cursor-pointer transition duration-150 ease-in-out ${theme !== 'dark' ? 'hover:bg-gray-50' : 'hover:bg-gray-700'}`}>
                
                {/* Avatar and Indicator */}
                <div className="relative flex-shrink-0 mr-3">
                  {/* <img 
                    src={emp.imageUrl || "https://via.placeholder.com/40"} 
                    alt={emp.firstName}
                    // **Style Changes for Image:** Consistent size and ring.
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                  /> */}
                  {/* Online Indicator Dot */}
                  {/* **Style Changes for Dot:** Slightly bigger dot for better visibility. */}
                  <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ${theme !== 'dark' ? 'ring-white' : 'ring-gray-800'} ${emp.status === 'Late' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    {/* **Style Changes for Name:** Slightly smaller size and more consistent color. */}
                    <p className={`text-sm font-semibold truncate ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>
                      {emp.firstName} {emp.lastName}
                    </p>
                    
                    {/* Status Text (Right aligned) */}
                    {/* **Style Changes for Status Text:** Cleaned up to use status as the primary color. */}
                    <div className="flex items-center space-x-1">
                      <FaCircle className={`w-1 h-1 ${emp.status === 'Late' ? 'text-orange-500' : 'text-green-500'}`} />
                      <span className={`text-xs font-medium ${emp.status === 'Late' ? 'text-orange-500' : 'text-green-500'}`}>
                        {emp.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                     {getDeptName(emp.departmentId)} 
                  </p>

                  <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <span className="font-mono">Login: {emp.loginTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Footer / View All Link --- */}
      {/* **Style Changes for Footer:** More pronounced button style. */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <button className="w-full text-sm py-2 rounded-lg font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-blue-400 transition duration-150">
          View all employees
        </button>
      </div>
    </div>
  );
};

export default SidebarComponent;