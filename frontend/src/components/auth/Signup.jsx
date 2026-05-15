import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import './Auth.css';

function Signup({ onLoginOpen }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: '', email: '', password: '' });

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
          <input className="auth-input" type="text" name="id" placeholder="아이디" value={form.id} onChange={handleChange} required />
          <input className="auth-input" type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
          <input className="auth-input" type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
          <button className="auth-button-signup" type="submit">회원가입</button>
        </form>
        <p className="auth-switch">
          이미 계정이 있으신가요?&nbsp;
          <button type="button" className="auth-switch-btn" onClick={onLoginOpen}>로그인</button>
        </p>
      </div>
    </div>
  );
}

export default Signup;