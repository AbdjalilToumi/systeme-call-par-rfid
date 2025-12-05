import React, { useContext } from 'react';
import { IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';
import { FaUserCircle } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import { ThemeContext } from './ThemeContext';

const HeaderComponent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const currentDate = "Mar 10, 2020";
  const currentShift = "9:00 AM to 5:00 PM";
  const userName = "Admin";

  return (
    <div className={`flex items-center justify-between h-16 px-4 md:px-6 ${theme !== 'dark' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} border-b transition-all duration-150`}>
      <div className="flex items-center">
        <button onClick={toggleTheme} className="mr-4">
          {theme !== 'dark' ? (
            <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <FiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        <div className="flex items-center space-x-6 text-sm font-medium">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <IoCalendarOutline className="w-5 h-5 text-blue-500" />
            <span className="hidden sm:inline">{currentDate}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <IoTimeOutline className="w-5 h-5 text-blue-500" />
            <span className="hidden md:inline">
              First Shift: <span className={`font-semibold ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>{currentShift}</span>
            </span>
            <span className={`inline md:hidden font-semibold ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>
              {currentShift.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 cursor-pointer">
        <div className="text-right hidden sm:block">
          <p className={`text-sm font-semibold ${theme !== 'dark' ? 'text-gray-800' : 'text-gray-100'}`}>{userName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
        </div>
        <FaUserCircle className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );
};

export default HeaderComponent;