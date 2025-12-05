import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const MainContainer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`p-4 sm:p-6 md:p-8 ${theme !== 'dark' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'} transition-all duration-150`}>
      <h1 className="text-2xl font-bold">Main</h1>
    </div>
  );
};

export default MainContainer;