import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import { login } from '../../api/auth.js';
import './Auth.css';

const TEXT = {
  idPlaceholder: '아이디',
  passwordPlaceholder: '비밀번호',
  loginButton: '로그인',
  loadingButton: '로그인 중...',
  signupLink: '계정이 없으신가요?',
  signupLinkBold: '회원가입',
  emptyError: '아이디와 비밀번호를 모두 입력해주세요.',
};

function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ id: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.id.trim() || !form.password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const user = await login({ id: form.id.trim(), password: form.password });
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMessage(err.message || '로그인에 실패했습니다.');
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
          <input
            type="text"
            value={form.id}
            onChange={handleChange('id')}
            onKeyDown={handleKeyDown}
            placeholder={TEXT.idPlaceholder}
            autoFocus
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
          {loading ? TEXT.loadingButton : TEXT.loginButton}
        </button>

        <p className="signup-footer">
          {TEXT.signupLink}{' '}
          <Link to="/signup">{TEXT.signupLinkBold}</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
