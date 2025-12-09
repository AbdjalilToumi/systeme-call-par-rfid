import React, { useContext, useEffect, useState } from 'react';
import { IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from './ThemeContext'; // Ensure this path is correct

const HeaderComponent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [admin, setAdmin] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  const updateTime = () => {
    const date = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' };
    setCurrentDate(date.toLocaleDateString('en-US', dateOptions));

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  };
  
  // 1. Fetch User Data from LocalStorage on mount
  useEffect(() => {
    // Set user data from local storage
    try {
      const storedData = localStorage.getItem('user_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setAdmin(parsedData);
      }
      
      // Set up time and date updates
      updateTime();
      const timer = setInterval(updateTime, 1000 * 60); 

      return () => clearInterval(timer);
    } catch (error) {
      console.error("Failed to initialize header component:", error);
    }
  }, []);
  
  return (
    <div className={`hidden sm:hidden md:flex items-center justify-between h-16 px-4 md:px-6 ${theme !== 'dark' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} border-b transition-all duration-150`}>
      
      {/* Left Side: Theme Toggle & Time info */}
      <div className="flex items-center">
        <button onClick={toggleTheme} className="mr-4 focus:outline-none">
          {theme !== 'dark' ? (
            <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div className="flex items-center space-x-6 text-sm font-medium">
          {/* Date Display */}
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <IoCalendarOutline className="w-5 h-5 text-blue-500" />
            <span className="hidden sm:inline md:block truncate max-w-[150px]">{currentDate}</span>
          </div>

          {/* Time Display */}
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <IoTimeOutline className="w-5 h-5 text-blue-500" />
            <span className="hidden md:inline">
              Time: <span className={`font-semibold ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>{currentTime}</span>
            </span>
            {/* Mobile simplified time */}
            <span className={`inline md:hidden font-semibold ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>
              {currentTime}
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: User Profile */}
      <div className="flex items-center space-x-3 cursor-pointer">
        <div className="text-right hidden sm:block">
          <p className={`text-sm font-semibold ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>
            {admin ? `${admin.firstName} ${admin.lastName}` : 'Admin User'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {admin ? admin.email : 'Super Admin'}
          </p>
        </div>

        {/* Profile Image with Fallback */}
        <div className="relative w-8 h-8 md:w-10 md:h-10">
            {admin && admin.imageUrl ? (
              <img 
                src={admin.imageUrl} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover border border-gray-300 dark:border-gray-600"
                onError={(e) => {
                   // Fallback if the specific image fails to load
                   e.target.onerror = null; 
                   e.target.style.display = 'none'; 
                   e.target.nextSibling.style.display = 'block'; 
                }}
              />
            ) : null}
            
            {/* Default Icon (Shown if no image, or if image fails) */}
            <FaUserCircle 
              className={`w-full h-full text-gray-400 ${admin?.imageUrl ? 'hidden' : 'block'}`} 
            />
          </div>
      </div>
    </div>
  );
};

export default HeaderComponent;