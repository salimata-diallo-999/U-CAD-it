import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const STATUS_LABEL = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  submitted: 'Soumis',
  validated: 'Validé',
  rejected: 'Rejeté',
};

export default function ProjectView() {
  const { projectId } = useParams();
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    api.get(`/steps/project/${projectId}`).then((res) => setSteps(res.data.steps));
  }, [projectId]);

  return (
    <div className="project-view">
      <h1>Processus de conception</h1>
      <div className="step-progress">
        {steps.map((s) => (
          <div key={s.id} className={`step step-${s.status}`}>
            <span>{s.step_number}. {s.name}</span>
            <span className="badge">{STATUS_LABEL[s.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
