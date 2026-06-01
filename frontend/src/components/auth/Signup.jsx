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
};

function Signup({ onSignupSuccess }) {
  const [form, setForm] = useState({ id: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

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
          {[
            { field: 'id', placeholder: TEXT.idPlaceholder, type: 'text' },
            { field: 'email', placeholder: TEXT.emailPlaceholder, type: 'email' },
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
