import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'inscription.");
    }
  }

  return (
    <div className="auth-page">
      <h1>U-CAD-it</h1>
      <p>Créer un compte</p>

      {success ? (
        <p>Compte créé avec succès. Redirection vers la connexion...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Nom complet
            <input name="fullName" value={form.fullName} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Mot de passe
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} />
          </label>
          <label>
            Rôle
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="student">Étudiant</option>
              <option value="teacher">Enseignant</option>
            </select>
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit">Créer mon compte</button>
        </form>
      )}

      <Link to="/login">J'ai déjà un compte</Link>
    </div>
  );
}
