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
          {[
            { field: 'id', placeholder: TEXT.idPlaceholder, type: 'text' },
            { field: 'password', placeholder: TEXT.passwordPlaceholder, type: 'password' },
          ].map(({ field, placeholder, type }) => (
            <input
              key={field}
              type={type}
              value={form[field]}
              onChange={handleChange(field)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus={field === 'id'}
              disabled={loading}
            />
          ))}
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
