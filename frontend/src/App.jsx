import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Header from './components/common/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';
import MyPage from './components/auth/MyPage.jsx';
import CreateQuizPage from './components/create/CreateQuizPage.jsx';
import AddQuizPage from './components/create/AddQuizPage.jsx';
import SolveQuizPage from './components/create/SolveQuizPage.jsx';
import { clearToken, getMe, getToken, logout } from './api/auth.js';

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    getMe()
      .then((user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        clearToken();
        setCurrentUser(null);
        setIsLoggedIn(false);
      });
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    navigate('/');
  };

  const requireLogin = (nextPath) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    navigate(nextPath);
  };

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
              />
              <MainPage onCreateQuiz={() => requireLogin('/create')} />
            </>
          }
        />
        <Route
          path="/create"
          element={
            isLoggedIn ? (
              <CreateQuizPage onCancel={() => navigate('/')} />
            ) : (
              <>
                <Header
                  isLoggedIn={isLoggedIn}
                  onLogout={handleLogout}
                />
                <Login onLoginSuccess={handleAuthSuccess} />
              </>
            )
          }
        />
        <Route
          path="/add"
          element={
            isLoggedIn ? (
              <AddQuizPage />
            ) : (
              <>
                <Header
                  isLoggedIn={isLoggedIn}
                  onLogout={handleLogout}
                />
                <Login onLoginSuccess={handleAuthSuccess} />
              </>
            )
          }
        />
        <Route
          path="/login"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
              />
              <Login onLoginSuccess={handleAuthSuccess} />
            </>
          }
        />
        <Route
          path="/signup"
          element={
           <>
             <Header
               isLoggedIn={isLoggedIn}
               onLogout={handleLogout}
             />
             <Signup onSignupSuccess={handleAuthSuccess} />
           </>
          }
        />
        <Route path="/solve/:id" element={<SolveQuizPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route
          path="/mypage"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
              />
              <MyPage
                user={currentUser}
                onAccountDeleted={() => {
                  setCurrentUser(null);
                  setIsLoggedIn(false);
                  navigate('/');
                }}
              />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;