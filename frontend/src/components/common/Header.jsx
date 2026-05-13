import iconUrl from '../../assets/quizzly-icon.png';

const TEXT = {
  home: 'Quizzly \uD648',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  myPage: '\uB9C8\uC774\uD398\uC774\uC9C0',
  login: '\uB85C\uADF8\uC778',
  signup: '\uD68C\uC6D0\uAC00\uC785',
  userMenu: '\uC0AC\uC6A9\uC790 \uBA54\uB274',
};

function Header({ isLoggedIn, onLogin, onLogout }) {
  return (
    <header className="site-header">
      <a className="header-logo" href="/" aria-label={TEXT.home}>
        <img src={iconUrl} alt="" />
      </a>

      <nav className="header-actions" aria-label={TEXT.userMenu}>
        {isLoggedIn ? (
          <>
            <button className="pill-button compact" type="button" onClick={onLogout}>
              {TEXT.logout}
            </button>
            <button className="pill-button compact" type="button">
              {TEXT.myPage}
            </button>
          </>
        ) : (
          <>
            <button className="pill-button compact" type="button" onClick={onLogin}>
              {TEXT.login}
            </button>
            <button className="pill-button compact" type="button">
              {TEXT.signup}
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
