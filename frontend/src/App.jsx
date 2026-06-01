import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
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
    const initialToken = getToken();
    if (!initialToken) {
      return;
    }

    getMe()
      .then((user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
      })
      .catch(() => {
        // 요청 도중 사용자가 새로 로그인한 경우 토큰이 바뀌므로 덮어쓰지 않음
        if (getToken() === initialToken) {
          clearToken();
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
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
              <MainPage onCreateQuiz={() => requireLogin('/create')} isLoggedIn={isLoggedIn} />
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
      <Footer />
    </div>
  );
}

export default App;