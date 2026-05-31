import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import './Auth.css';

const TEXT = {
  idPlaceholder: '이메일',
  passwordPlaceholder: '비밀번호',
  loginButton: '로그인',
  signupLink: '계정이 없으신가요?',
  signupLinkBold: '회원가입',
  emptyError: '아이디와 비밀번호를 모두 입력해주세요.',
};

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = () => {
    if (!form.id.trim() || !form.password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }

    setErrorMessage('');

    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess();
      return;
    }

    navigate('/');
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
            />
          ))}
        </div>

        {errorMessage && <p className="signup-error">{errorMessage}</p>}

        <button type="button" className="signup-button" onClick={handleSubmit}>
          {TEXT.loginButton}
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
