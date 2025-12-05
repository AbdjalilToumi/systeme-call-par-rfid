import React, { useEffect, useState, useContext} from "react";
import HeaderComponent from "./Components/HeaderComponent";
import SidebarComponent from "./Components/SidebarComponent";
import MainContainer from "./Components/MainContainer";
import Login from "./Components/Login";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeContext } from './Components/ThemeContext';
function App() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isLogin, setIsLogin] = useState(!window.sessionStorage.getItem("email"));
  const navigate = useNavigate();

  // Handler
  const handleLogin = ({ isLogin, email }) => {
    if (isLogin) {
      window.sessionStorage.setItem("email", email);
      setIsLogin(true);
      navigate("/dashboard");
    }
  };

  useEffect(() => {
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
                <div className={`h-screen w-full flex flex-col ${theme !== 'dark' ? "bg-gray-100": "bg-gray-900"}`}>
                  <header className={`h-16 flex-shrink-0 ${theme !== 'dark' ? "bg-white border-gray-200": "bg-gray-800 border-gray-700"} border-b`}>
                    <HeaderComponent />
                  </header>
                  <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                      <MainContainer />
                    </main>
                    <aside className={`w-20 lg:w-64 flex-shrink-0 ${theme !== 'dark' ? 'bg-white border-gray-200': 'bg-gray-800 border-gray-700'} border-l overflow-y-auto`}>
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
