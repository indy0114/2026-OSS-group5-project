import { Link, useNavigate } from 'react-router-dom';
import iconUrl from '../../assets/quizzly-icon.png';

const TEXT = {
  home: 'Quizzly 홈',
  logout: '로그아웃',
  myPage: '마이페이지',
  createQuiz: '퀴즈 만들기',
  login: '로그인',
  signup: '회원가입',
  userMenu: '사용자 메뉴',
};

const goTo = (navigate, path) => {
  navigate(path);
  window.scrollTo(0, 0);
};

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <Link className="header-logo" to="/" aria-label={TEXT.home} onClick={() => window.scrollTo(0, 0)}>
        <img src={iconUrl} alt="" />
      </Link>

      <nav className="header-actions" aria-label={TEXT.userMenu}>
        {isLoggedIn ? (
          <>
            <button className="pill-button compact" type="button" onClick={() => goTo(navigate, '/create')}>
              {TEXT.createQuiz}
            </button>
            <button className="pill-button compact" type="button" onClick={() => goTo(navigate, '/mypage')}>
              {TEXT.myPage}
            </button>
            <button className="pill-button compact" type="button" onClick={onLogout}>
              {TEXT.logout}
            </button>
          </>
        ) : (
          <>
            <button className="pill-button compact" type="button" onClick={() => goTo(navigate, '/login')}>
              {TEXT.login}
            </button>
            <button className="pill-button compact" type="button" onClick={() => goTo(navigate, '/signup')}>
              {TEXT.signup}
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
