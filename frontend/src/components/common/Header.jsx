import { useNavigate } from 'react-router-dom';
import iconUrl from '../../assets/quizzly-icon.png';

const TEXT = {
  home: 'Quizzly 홈', logout: '로그아웃', myPage: '마이페이지',
  login: '로그인', signup: '회원가입', userMenu: '사용자 메뉴',
};

function Header({ isLoggedIn, onLogin, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <a className="header-logo" href="/" aria-label={TEXT.home}>
        <img src={iconUrl} alt="" />
      </a>
      <nav className="header-actions" aria-label={TEXT.userMenu}>
        {isLoggedIn ? (
          <>
            <button className="pill-button compact" type="button" onClick={onLogout}>{TEXT.logout}</button>
            <button className="pill-button compact" type="button">{TEXT.myPage}</button>
          </>
        ) : (
          <>
            <button className="pill-button compact" type="button" onClick={onLogin}>{TEXT.login}</button>
            <button className="pill-button compact" type="button" onClick={() => navigate('/signup')}>{TEXT.signup}</button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
