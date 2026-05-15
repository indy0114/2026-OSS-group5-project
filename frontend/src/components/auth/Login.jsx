import { useState } from 'react';
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

function Login({ isOpen, onClose, onLoginSuccess }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

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

  const handleClose = () => {
    setId('');
    setPassword('');
    setErrorMessage('');
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="auth-backdrop" onClick={handleClose}>
      <div
        className="auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
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
            onClick={handleClose}
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