import React, { useEffect, useState, useContext} from "react";
import HeaderComponent from "./Components/HeaderComponent";
import SidebarComponent from "./Components/SidebarComponent";
import MainContainer from "./Components/MainContainer";
import Login from "./Components/Login";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeContext } from './Components/ThemeContext';

function App() {
  const { theme } = useContext(ThemeContext);
  // Use a slightly more robust check for session storage item
  const [isLogin, setIsLogin] = useState(!!sessionStorage.getItem("email"));
  const navigate = useNavigate();

  // Handler
  const handleLogin = ({ isLogin, email }) => {
    if (isLogin) {
      // Use sessionStorage for temporary login state
      sessionStorage.setItem("email", email); 
      setIsLogin(true);
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    // Redirect logic based on login state
    if (isLogin) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  }, [isLogin, navigate]);

  return (
    <div>
      <Routes>
        {!isLogin ? (
          <>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route
              path="/dashboard"
              element={
                <div className={`h-screen w-screen hidden sm:hidden md:flex flex-col ${theme !== 'dark' ? "bg-gray-100": "bg-gray-900"} transition-all duration-150`}>
                  
                  {/* --- Header --- */}
                  <header className={`h-16 flex-shrink-0 border-b ${theme !== 'dark' ? "bg-white border-gray-200 shadow-sm": "bg-gray-800 border-gray-700 shadow-xl"}`}>
                    <HeaderComponent />
                  </header>
                  
                  {/* --- Main Content Area (Sidebar + Main) --- */}
                  <div className="flex flex-1 overflow-hidden">
                    
                    {/* --- Main Container --- */}
                    <main className="flex-1 overflow-y-auto p-8">
                      <MainContainer />
                    </main>
                    
                    {/* --- Sidebar --- */}
                    <aside className={`md:w-96 overflow-y-auto ${theme !== 'dark' ? 'bg-white': 'bg-gray-800'}`}>
                      <SidebarComponent />
                    </aside>
                  </div>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;