import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../../api/auth.js';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import './Auth.css';

const TEXT = {
  idPlaceholder: '\uC544\uC774\uB514',
  passwordPlaceholder: '\uBE44\uBC00\uBC88\uD638',
  loginButton: '\uB85C\uADF8\uC778',
  signupLink: '\uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694?',
  signupLinkBold: '\uD68C\uC6D0\uAC00\uC785',
  emptyError: '\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694.',
};

function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ id: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.id.trim() || !form.password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await login(form);
      onLoginSuccess?.(user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
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
            />
          ))}
        </div>

        {errorMessage && <p className="signup-error">{errorMessage}</p>}

        <button type="button" className="signup-button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '...' : TEXT.loginButton}
        </button>

        <p className="signup-footer">
          {TEXT.signupLink} <Link to="/signup">{TEXT.signupLinkBold}</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
