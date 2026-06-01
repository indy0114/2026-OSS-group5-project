import iconUrl from '../../assets/quizzly-icon.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <img src={iconUrl} alt="Quizzly" className="footer-logo" />
            <span>Quizzly</span>
          </div>
          <p className="footer-tagline">나만의 퀴즈를 만들고, 친구들과 함께 풀어보세요.</p>
        </div>

        <div className="footer-links">
          <span className="footer-link-group-title">바로가기</span>
          <ul>
            <li><a href="/">홈</a></li>
            <li><a href="/create">퀴즈 만들기</a></li>
            <li><a href="/mypage">마이페이지</a></li>
            <li><a href="/login">로그인</a></li>
            <li><a href="/signup">회원가입</a></li>
          </ul>
        </div>

        <div className="footer-info">
          <span className="footer-link-group-title">프로젝트 정보</span>
          <p>2026 오픈소스SW 5조</p>
          <p>Powered by React + FastAPI</p>
        </div>

        <div className="footer-contact">
          <span className="footer-link-group-title">문의</span>
          <a className="footer-email" href="mailto:hanbee4949@gmail.com">hanbee4949@gmail.com</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Quizzly. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
