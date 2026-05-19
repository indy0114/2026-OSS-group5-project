import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const TEXT = {
  title: '로그인',
  idLabel: '아이디',
  idPlaceholder: '아이디를 입력하세요',
  passwordLabel: '비밀번호',
  passwordPlaceholder: '비밀번호를 입력하세요',
  loginButton: '로그인',
  cancelButton: '취소',
  emptyError: '아이디와 비밀번호를 모두 입력해주세요.',
};

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!id.trim() || !password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }

    setId('');
    setPassword('');
    setErrorMessage('');
    onLoginSuccess();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-modal">
        <h2 className="auth-title">{TEXT.title}</h2>

        <div className="auth-field">
          <label htmlFor="login-id">{TEXT.idLabel}</label>
          <input
            id="login-id"
            type="text"
            value={id}
            onChange={(event) => setId(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={TEXT.idPlaceholder}
            autoFocus
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">{TEXT.passwordLabel}</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={TEXT.passwordPlaceholder}
          />
        </div>

        {errorMessage && (
          <p className="auth-error">{errorMessage}</p>
        )}

        <div className="auth-buttons">
          <button
            type="button"
            className="auth-button auth-button-cancel"
            onClick={() => navigate(-1)}
          >
            {TEXT.cancelButton}
          </button>
          <button
            type="button"
            className="auth-button auth-button-primary"
            onClick={handleSubmit}
          >
            {TEXT.loginButton}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;