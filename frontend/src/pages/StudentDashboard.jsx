import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function StudentDashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects/mine').then((res) => setProjects(res.data.projects));
  }, []);

  return (
    <div className="dashboard">
      <header>
        <h1>U-CAD-it</h1>
        <nav>Projets · Profil · Déconnexion</nav>
      </header>

      <section>
        <h2>Mes projets</h2>
        <div className="project-grid">
          {projects.map((p) => (
            <Link to={`/projects/${p.id}`} key={p.id} className="project-card">
              <h3>{p.name}</h3>
              <p>Étape {p.steps_validated}/{p.steps_total}</p>
            </Link>
          ))}
        </div>
        <button className="fab">+ Nouveau Projet</button>
      </section>
    </div>
  );
}
