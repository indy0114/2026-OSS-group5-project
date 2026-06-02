import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import { signup } from '../../api/auth.js';
import './Auth.css';

const TEXT = {
  idPlaceholder: '아이디',
  emailPlaceholder: '이메일',
  passwordPlaceholder: '비밀번호',
  signupButton: '회원가입',
  loadingButton: '가입 중...',
  loginLink: '이미 계정이 있으신가요?',
  loginLinkBold: '로그인',
  emptyError: '모든 항목을 입력해주세요.',
  checkId: '중복 확인',
  idAvailable: '사용 가능한 아이디입니다.',
  idTaken: '이미 사용 중인 아이디입니다.',
  idRequired: '아이디를 입력해주세요.',
};

function Signup({ onSignupSuccess }) {
  const [form, setForm] = useState({ id: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [idStatus, setIdStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (field === 'id') setIdStatus(null);
  };

  const handleCheckId = async () => {
    if (!form.id.trim()) {
      setIdStatus('empty');
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/auth/check-username?username=${encodeURIComponent(form.id.trim())}`);
      const data = await res.json();
      setIdStatus(data.available ? 'available' : 'taken');
    } catch {
      setIdStatus(null);
    }
  };

  const handleSubmit = async () => {
    if (!form.id.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const user = await signup({ id: form.id.trim(), email: form.email.trim(), password: form.password });
      if (typeof onSignupSuccess === 'function') {
        onSignupSuccess(user);
      }
    } catch (err) {
      setErrorMessage(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="signup-page">
      <div className="signup-modal">
        <img className="signup-logo" src={logoUrl} alt="Quizzly" />

        <div className="signup-fields">
          <div className="signup-id-row">
            <input
              type="text"
              value={form.id}
              onChange={handleChange('id')}
              onKeyDown={handleKeyDown}
              placeholder={TEXT.idPlaceholder}
              autoFocus
              disabled={loading}
            />
            <button type="button" className="signup-check-btn" onClick={handleCheckId} disabled={loading}>
              {TEXT.checkId}
            </button>
          </div>
          {idStatus === 'available' && <p className="signup-id-msg available">{TEXT.idAvailable}</p>}
          {idStatus === 'taken' && <p className="signup-id-msg taken">{TEXT.idTaken}</p>}
          {idStatus === 'empty' && <p className="signup-id-msg taken">{TEXT.idRequired}</p>}
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            onKeyDown={handleKeyDown}
            placeholder={TEXT.emailPlaceholder}
            disabled={loading}
          />
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange('password')}
              onKeyDown={handleKeyDown}
              placeholder={TEXT.passwordPlaceholder}
              disabled={loading}
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {errorMessage && <p className="signup-error">{errorMessage}</p>}

        <button type="button" className="signup-button" onClick={handleSubmit} disabled={loading}>
          {loading ? TEXT.loadingButton : TEXT.signupButton}
        </button>

        <p className="signup-footer">
          {TEXT.loginLink}{' '}
          <Link to="/login">{TEXT.loginLinkBold}</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
