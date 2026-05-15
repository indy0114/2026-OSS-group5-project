import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import './Auth.css';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src={logoUrl} alt="Quizzly" />
        <form className="auth-form" onSubmit={handleSubmit}>
          <input className="auth-input" type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
          <input className="auth-input" type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
          <button className="auth-button" type="submit">로그인</button>
        </form>
        <p className="auth-switch">
          아직 회원이 아니신가요?&nbsp;
          <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;