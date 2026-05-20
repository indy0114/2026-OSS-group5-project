import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import "./Auth.css";

const TEXT = {
  idPlaceholder: '아이디',
  emailPlaceholder: '이메일',
  passwordPlaceholder: '비밀번호',
  signupButton: '회원가입',
  loginLink: '이미 계정이 있으신가요?',
  loginLinkBold: '로그인',
  emptyError: '모든 항목을 입력해주세요.',
};

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = () => {
    if (!form.id.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }
    setErrorMessage('');
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
            />
          ))}
        </div>

        {errorMessage && <p className="signup-error">{errorMessage}</p>}

        <button type="button" className="signup-button" onClick={handleSubmit}>
          {TEXT.signupButton}
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