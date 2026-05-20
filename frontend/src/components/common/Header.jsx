import { Link, useNavigate } from 'react-router-dom';
import iconUrl from '../../assets/quizzly-icon.png';

const TEXT = {
  home: 'Quizzly \uD648',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  myPage: '\uB9C8\uC774\uD398\uC774\uC9C0',
  createQuiz: '\uD034\uC988 \uB9CC\uB4E4\uAE30',
  login: '\uB85C\uADF8\uC778',
  signup: '\uD68C\uC6D0\uAC00\uC785',
  userMenu: '\uC0AC\uC6A9\uC790 \uBA54\uB274',
};

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="site-header">
      <Link className="header-logo" to="/" aria-label={TEXT.home}>
        <img src={iconUrl} alt="" />
      </Link>

      <nav className="header-actions" aria-label={TEXT.userMenu}>
        {isLoggedIn ? (
          <>
            <button className="pill-button compact" type="button" onClick={() => navigate('/create')}>
              {TEXT.createQuiz}
            </button>
            <button className="pill-button compact" type="button" onClick={() => navigate('/mypage')}>
              {TEXT.myPage}
            </button>
            <button className="pill-button compact" type="button" onClick={onLogout}>
              {TEXT.logout}
            </button>
          </>
        ) : (
          <>
            <button className="pill-button compact" type="button" onClick={() => navigate('/login')}>
              {TEXT.login}
            </button>
            <button className="pill-button compact" type="button" onClick={() => navigate('/signup')}>
              {TEXT.signup}
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
