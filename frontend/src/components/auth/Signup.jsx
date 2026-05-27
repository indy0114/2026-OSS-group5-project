import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../api/auth.js';
import logoUrl from '../../assets/quizzly-logo-cropped.png';
import './Auth.css';

const TEXT = {
  idPlaceholder: '\uC544\uC774\uB514',
  emailPlaceholder: '\uC774\uBA54\uC77C',
  passwordPlaceholder: '\uBE44\uBC00\uBC88\uD638',
  signupButton: '\uD68C\uC6D0\uAC00\uC785',
  loginLink: '\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694?',
  loginLinkBold: '\uB85C\uADF8\uC778',
  emptyError: '\uBAA8\uB4E0 \uD56D\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.',
  passwordLengthError: '\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1\uC73C\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694.',
};

function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ id: '', email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    if (!form.id.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage(TEXT.emptyError);
      return;
    }

    if (form.password.length < 6) {
      setErrorMessage(TEXT.passwordLengthError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await signup(form);
      onSignupSuccess?.(user);
      navigate('/');
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

        <button type="button" className="signup-button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '...' : TEXT.signupButton}
        </button>

        <p className="signup-footer">
          {TEXT.loginLink} <Link to="/login">{TEXT.loginLinkBold}</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
