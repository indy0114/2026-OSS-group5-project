import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Header from './components/common/Header.jsx';
import Footer from './components/common/Footer.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import MainPage from './components/MainPage.jsx';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';
import MyPage from './components/auth/MyPage.jsx';
import CreateQuizPage from './components/create/CreateQuizPage.jsx';
import AddQuizPage from './components/create/AddQuizPage.jsx';
import SolveQuizPage from './components/create/SolveQuizPage.jsx';
import HostGame from './components/game/HostGame.jsx';
import PlayerGame from './components/game/PlayerGame.jsx';
import { clearToken, getMe, getToken, logout } from './api/auth.js';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  // 라이브 게임 화면(호스트/참가자)에서는 Footer를 숨긴다.
  const isGameRoute =
    location.pathname.startsWith('/play') || location.pathname.startsWith('/host');
  const hideFooter = isGameRoute;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 모바일(참가자)에서는 게임 화면만 노출한다. 게임 라우트가 아니면
  // 입장 화면(/play)으로 돌려보내 데스크탑용 메인을 보지 않게 한다.
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile && !isGameRoute) {
      navigate('/play', { replace: true });
    }
  }, [location.pathname, isGameRoute, navigate]);

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
      <ScrollToTop />
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
        <Route path="/host/:code" element={<HostGame />} />
        <Route path="/play" element={<PlayerGame user={currentUser} />} />
        <Route path="/play/:code" element={<PlayerGame user={currentUser} />} />
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
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;