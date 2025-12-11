import React, { useContext, useEffect, useState } from 'react';
import { IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from './ThemeContext'; 

const HeaderComponent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Lazily initialize admin state from localStorage
  const [admin, setAdmin] = useState(() => {
    try {
      const storedData = window.sessionStorage.getItem('user_data');
      return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      return null;
    }
  });

  const updateTime = () => {
    const date = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' };
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
  };

  const [currentDate, setCurrentDate] = useState(updateTime().date);
  const [currentTime, setCurrentTime] = useState(updateTime().time);
  const [isDropDown, setIsDropDown] = useState(false); 
  const updateTimeDisplay = () => {
    const date = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: '2-digit' };
    setCurrentDate(date.toLocaleDateString('en-US', dateOptions));

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  };
  
  // handle sigin out function
  const handleSiginOut = () => {
    window.sessionStorage.removeItem('user_data');
    window.sessionStorage.removeItem('authToken');
    window.location.reload();
  }

  //Fetch User Data from LocalStorage on mount
  useEffect(() => {
    try {
      // Set up time and date updates
      const timer = setInterval(updateTimeDisplay, 1000 * 60); 
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
      <div className="relative">
        <div onClick={() => setIsDropDown(!isDropDown)} className="flex items-center space-x-3 cursor-pointer">
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
        {/* Dropdown Menu */}
        {isDropDown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-600 z-10">
            <button onClick={handleSiginOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Sign Out
            </button>
          </div>)
        }
      </div>
    </div>
  );
};

export default HeaderComponent;