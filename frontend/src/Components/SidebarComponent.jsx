import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const SidebarComponent = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`h-full ${theme !== 'dark' ? 'bg-white text-gray-900' : 'bg-gray-800 text-white'} p-4 transition-all duration-150`}>
      <h1 className="text-2xl font-bold">side bar</h1>
    </div>
  );
};

export default SidebarComponent;