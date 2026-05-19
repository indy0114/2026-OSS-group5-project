import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Header from './components/common/Header.jsx';
import MainPage from './components/MainPage.jsx';
import Login from './components/auth/Login.jsx';
import Signup from './components/auth/Signup.jsx';
import MyPage from './components/auth/MyPage.jsx';
import CreateQuizPage from './components/create/CreateQuizPage.jsx';

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                onLogout={() => { setIsLoggedIn(false); navigate('/'); }}
              />
              <MainPage onCreateQuiz={() => navigate('/create')} />
            </>
          }
        />
        <Route
          path="/create"
          element={<CreateQuizPage onCancel={() => navigate('/')} />}
        />
        <Route
          path="/login"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                onLogout={() => { setIsLoggedIn(false); navigate('/'); }}
              />
              <Login onLoginSuccess={() => { setIsLoggedIn(true); navigate('/'); }} />
            </>
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/mypage"
          element={
            <>
              <Header
                isLoggedIn={isLoggedIn}
                onLogout={() => { setIsLoggedIn(false); navigate('/'); }}
              />
              <MyPage />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
