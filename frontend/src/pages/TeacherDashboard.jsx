import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function TeacherDashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects/teacher').then((res) => setProjects(res.data.projects));
  }, []);

  return (
    <div className="dashboard">
      <header>
        <h1>Tableau de bord enseignant</h1>
      </header>
      <table>
        <thead>
          <tr>
            <th>Projet</th>
            <th>En attente de validation</th>
            <th>Dernière activité</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.pending_review}</td>
              <td>{new Date(p.updated_at).toLocaleDateString('fr-FR')}</td>
              <td><Link to={`/projects/${p.id}`}>Voir</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
