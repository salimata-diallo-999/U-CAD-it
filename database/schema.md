# Schema Base de Données - U-CAD-it

## 📋 Vue d'ensemble

Base de données PostgreSQL relationnelle pour U-CAD-it.

**Total : 18 tables principales**

---

## 🏗️ ARCHITECTURE GÉNÉRALE

```
┌─────────────────────────────────────────────────────────────┐
│                    U-CAD-it DATABASE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Authentification & Utilisateurs                           │
│  ├─ users                                                  │
│  ├─ roles                                                  │
│  ├─ user_schools                                           │
│  └─ user_sessions                                          │
│                                                             │
│  Gestion des Écoles & Institutions                         │
│  ├─ schools                                                │
│  └─ curricula                                              │
│                                                             │
│  Gestion des Projets                                       │
│  ├─ projects                                               │
│  ├─ project_members                                        │
│  ├─ project_templates                                      │
│  └─ project_milestones                                     │
│                                                             │
│  Processus de Conception (6 étapes)                        │
│  ├─ design_steps                                           │
│  ├─ step_need_analysis                                     │
│  ├─ step_specifications                                    │
│  ├─ step_ideation                                          │
│  ├─ step_ideation_ideas                                    │
│  ├─ step_ideation_matrix                                   │
│  ├─ step_modeling                                          │
│  ├─ step_prototyping                                       │
│  └─ step_evaluation                                        │
│                                                             │
│  Suivi Pédagogique                                         │
│  ├─ feedback                                               │
│  ├─ feedback_annotations                                   │
│  ├─ step_validations                                       │
│  ├─ activity_log                                           │
│  └─ notifications                                          │
│                                                             │
│  Collaboration & Communication                             │
│  ├─ messages                                               │
│  ├─ files                                                  │
│  ├─ tasks                                                  │
│  └─ task_assignments                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 🗄️ TABLES DÉTAILLÉES

## 1️⃣ AUTHENTIFICATION & UTILISATEURS

### Table: `users`
Stocke tous les utilisateurs (étudiants, enseignants, admins)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_photo URL,
  bio TEXT,
  role_id UUID NOT NULL REFERENCES roles(id),
  school_id UUID REFERENCES schools(id),
  filiere VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_role_id ON users(role_id);
```

### Table: `roles`
Rôles disponibles dans le système

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL, -- 'student', 'teacher', 'admin'
  description TEXT,
  permissions JSONB, -- {"view_projects": true, "create_projects": true, ...}
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
('student', 'Étudiant - peut créer et travailler sur des projets'),
('teacher', 'Enseignant - peut superviser et évaluer les projets'),
('admin', 'Administrateur - accès complet');
```

### Table: `user_sessions`
Gestion des sessions et authentification

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
```

---

## 2️⃣ GESTION DES ÉCOLES & INSTITUTIONS

### Table: `schools`
Informations des écoles d'ingénieurs

```sql
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) UNIQUE,
  location VARCHAR(255),
  country VARCHAR(100) DEFAULT 'Senegal',
  contact_email VARCHAR(255),
  phone VARCHAR(20),
  website URL,
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO schools (name, code, location) VALUES
('ESP', 'ESP', 'Dakar'),
('ENSEPT', 'ENSEPT', 'Thiès'),
('Polytechnique Thiès', 'POLYTECHIES', 'Thiès');
```

### Table: `curricula`
Templates de curriculum par école et filière

```sql
CREATE TABLE curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  filiere VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB, -- Structure des 6 étapes customisées
  tools_available JSONB, -- Outils disponibles par étape
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(school_id, filiere)
);

CREATE INDEX idx_curricula_school_id ON curricula(school_id);
```

---

## 3️⃣ GESTION DES PROJETS

### Table: `projects`
Projets de conception des étudiants

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  school_id UUID NOT NULL REFERENCES schools(id),
  curriculum_id UUID NOT NULL REFERENCES curricula(id),
  created_by UUID NOT NULL REFERENCES users(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, submitted, completed, archived
  progress_percentage INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 1, -- 1-6
  start_date DATE DEFAULT NOW(),
  end_date DATE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_school_id ON projects(school_id);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_teacher_id ON projects(teacher_id);
CREATE INDEX idx_projects_status ON projects(status);
```

### Table: `project_members`
Membres de chaque équipe projet

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'leader', 'contributor', 'observer'
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
```

### Table: `project_templates`
Templates de projets réutilisables

```sql
CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  structure JSONB, -- Structure pré-remplie des formulaires
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_templates_curriculum_id ON project_templates(curriculum_id);
```

### Table: `project_milestones`
Jalons et deadlines du projet

```sql
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL, -- 1-6
  title VARCHAR(255),
  deadline DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, step_number)
);

CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
```

---

## 4️⃣ PROCESSUS DE CONCEPTION (6 ÉTAPES)

### Table: `design_steps`
Représente chaque étape du processus

```sql
CREATE TABLE design_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL, -- 1-6
  step_name VARCHAR(100) NOT NULL, -- 'need_analysis', 'specifications', 'ideation', 'modeling', 'prototyping', 'evaluation'
  status VARCHAR(50) DEFAULT 'todo', -- 'todo', 'in_progress', 'submitted', 'validated', 'rejected'
  submitted_at TIMESTAMP,
  validated_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, step_number)
);

CREATE INDEX idx_design_steps_project_id ON design_steps(project_id);
CREATE INDEX idx_design_steps_status ON design_steps(status);
```

### Table: `step_need_analysis`
Étape 1 : Analyse du besoin

```sql
CREATE TABLE step_need_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL UNIQUE REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- À qui rend-il service ?
  end_user VARCHAR(255),
  
  -- Sur quoi agit-il ?
  work_object VARCHAR(255),
  
  -- Dans quel but ?
  usage_goal TEXT,
  
  -- Contexte d'utilisation
  usage_context TEXT,
  
  -- Contraintes initiales
  constraints JSONB, -- {cost: "...", timeline: "...", environment: "..."}
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_need_analysis_project_id ON step_need_analysis(project_id);
```

### Table: `step_specifications`
Étape 2 : Cahier des Charges Fonctionnel

```sql
CREATE TABLE step_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL UNIQUE REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Identification du produit
  product_name VARCHAR(255),
  product_version VARCHAR(50),
  
  -- Fonctions de service
  service_functions JSONB, -- [{name: "...", level: "...", flexibility: "..."}, ...]
  
  -- Contraintes
  constraints JSONB, -- {norms: [...], costs: "...", timeline: "...", environment: "...", aesthetics: "..."}
  
  -- Diagramme FAST
  fast_diagram TEXT, -- SVG ou JSON représentation
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_specifications_project_id ON step_specifications(project_id);
```

### Table: `step_ideation`
Étape 3 : Idéation

```sql
CREATE TABLE step_ideation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL UNIQUE REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  selected_solution_id UUID,
  selected_solution_name VARCHAR(255),
  selected_solution_justification TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_ideation_project_id ON step_ideation(project_id);
```

### Table: `step_ideation_ideas`
Idées générées lors du brainstorming

```sql
CREATE TABLE step_ideation_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ideation_id UUID NOT NULL REFERENCES step_ideation(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id),
  
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_ideation_ideas_ideation_id ON step_ideation_ideas(ideation_id);
CREATE INDEX idx_step_ideation_ideas_created_by ON step_ideation_ideas(created_by);
```

### Table: `step_ideation_matrix`
Matrice de comparaison des solutions

```sql
CREATE TABLE step_ideation_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ideation_id UUID NOT NULL REFERENCES step_ideation(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id),
  
  criteria JSONB, -- [{name: "...", weight: 1-5}, ...]
  solutions JSONB, -- [{id: "...", name: "...", scores: {...}}, ...]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_ideation_matrix_ideation_id ON step_ideation_matrix(ideation_id);
```

### Table: `step_ideation_votes`
Votes de l'équipe sur la meilleure solution

```sql
CREATE TABLE step_ideation_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ideation_id UUID NOT NULL REFERENCES step_ideation(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES step_ideation_ideas(id) ON DELETE CASCADE,
  voted_by UUID NOT NULL REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(ideation_id, voted_by)
);

CREATE INDEX idx_step_ideation_votes_ideation_id ON step_ideation_votes(ideation_id);
```

### Table: `step_modeling`
Étape 4 : Modélisation

```sql
CREATE TABLE step_modeling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL UNIQUE REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  description TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_modeling_project_id ON step_modeling(project_id);
```

### Table: `step_prototyping`
Étape 5 : Prototypage

```sql
CREATE TABLE step_prototyping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL UNIQUE REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Description prototype
  description TEXT,
  materials_used TEXT,
  manufacturing_process TEXT,
  cost DECIMAL(10, 2),
  
  -- Tests et résultats
  tests_performed JSONB, -- [{test: "...", result: "...", date: "..."}]
  problems_identified TEXT,
  solutions_proposed TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_prototyping_project_id ON step_prototyping(project_id);
```

### Table: `step_evaluation`
Étape 6 : Évaluation & Validation

```sql
CREATE TABLE step_evaluation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL UNIQUE REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Grille d'évaluation
  evaluation_criteria JSONB, -- [{criterion: "...", score: 1-10}, ...]
  overall_score DECIMAL(5, 2),
  
  -- Comparaison solution vs besoin
  comparison_results TEXT,
  strengths TEXT,
  weaknesses TEXT,
  improvements_recommended TEXT,
  
  -- Tests de validation
  validation_tests JSONB, -- [{test: "...", passed: true/false}, ...]
  
  -- Rapport final
  final_report TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_evaluation_project_id ON step_evaluation(project_id);
```

---

## 5️⃣ SUIVI PÉDAGOGIQUE

### Table: `feedback`
Commentaires et retours pédagogiques

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  given_by UUID NOT NULL REFERENCES users(id), -- Enseignant
  feedback_type VARCHAR(50), -- 'positive', 'improvement', 'error'
  
  general_comment TEXT,
  is_on_text BOOLEAN DEFAULT FALSE,
  text_selection VARCHAR(500),
  text_position INTEGER,
  
  is_on_diagram BOOLEAN DEFAULT FALSE,
  diagram_element_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_step_id ON feedback(step_id);
CREATE INDEX idx_feedback_project_id ON feedback(project_id);
CREATE INDEX idx_feedback_given_by ON feedback(given_by);
```

### Table: `feedback_annotations`
Annotations détaillées sur feedback

```sql
CREATE TABLE feedback_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  
  content TEXT,
  position_x INTEGER,
  position_y INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_annotations_feedback_id ON feedback_annotations(feedback_id);
```

### Table: `step_validations`
Validations/rejets des étapes par enseignant

```sql
CREATE TABLE step_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES design_steps(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  validated_by UUID NOT NULL REFERENCES users(id), -- Enseignant
  validation_status VARCHAR(50) NOT NULL, -- 'validated', 'rejected'
  
  rejection_reason TEXT,
  rejection_details TEXT,
  
  teacher_signature VARCHAR(255),
  validated_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_step_validations_step_id ON step_validations(step_id);
CREATE INDEX idx_step_validations_project_id ON step_validations(project_id);
```

### Table: `activity_log`
Journal d'activité détaillé pour la traçabilité

```sql
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(100), -- 'created', 'modified', 'submitted', 'validated', 'rejected', 'commented', etc.
  action_description TEXT,
  
  entity_type VARCHAR(50), -- 'project', 'step', 'feedback', 'file', etc.
  entity_id UUID,
  
  changes JSONB, -- {before: {...}, after: {...}}
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);
```

### Table: `notifications`
Notifications pour utilisateurs

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  notification_type VARCHAR(100), -- 'submission', 'feedback', 'validation', 'deadline_alert', etc.
  title VARCHAR(255),
  message TEXT,
  
  related_project_id UUID REFERENCES projects(id),
  related_step_id UUID REFERENCES design_steps(id),
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

## 6️⃣ COLLABORATION & COMMUNICATION

### Table: `messages`
Messages et chat par projet

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  sent_by UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'mention', 'file_share'
  mentioned_users JSONB, -- [{user_id: "...", username: "..."}, ...]
  
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_sent_by ON messages(sent_by);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### Table: `files`
Gestion des fichiers du projet

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER, -- en bytes
  file_type VARCHAR(50), -- 'pdf', 'image', 'cad', 'word', 'document'
  mime_type VARCHAR(100),
  
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  file_version INTEGER DEFAULT 1,
  is_latest BOOLEAN DEFAULT TRUE,
  
  storage_path VARCHAR(500), -- Chemin dans système de fichiers ou cloud
  
  access_level VARCHAR(50) DEFAULT 'read', -- 'read', 'write', 'comment'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);
```

### Table: `file_versions`
Historique des versions de fichiers

```sql
CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  
  version_number INTEGER,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  change_description TEXT,
  
  storage_path VARCHAR(500),
  file_size INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
```

### Table: `tasks`
Tâches assignées dans les projets

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  deadline DATE,
  
  completed_at TIMESTAMP,
  completed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### Table: `task_assignments`
Assignations de tâches aux membres

```sql
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES users(id),
  
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(task_id, assigned_to)
);

CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_assigned_to ON task_assignments(assigned_to);
```

---

## 7️⃣ TABLES SUPPLÉMENTAIRES

### Table: `file_comments`
Commentaires sur les fichiers

```sql
CREATE TABLE file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  
  commented_by UUID NOT NULL REFERENCES users(id),
  comment_text TEXT,
  
  line_number INTEGER, -- Pour fichiers texte
  position_x INTEGER, -- Pour images
  position_y INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_file_comments_file_id ON file_comments(file_id);
```

### Table: `exports`
Historique des exports (PDF, Word)

```sql
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  export_type VARCHAR(50), -- 'pdf', 'word'
  export_status VARCHAR(50), -- 'pending', 'completed', 'failed'
  
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  
  completed_at TIMESTAMP,
  file_path VARCHAR(500),
  file_size INTEGER,
  
  error_message TEXT
);

CREATE INDEX idx_exports_project_id ON exports(project_id);
```

### Table: `audit_log`
Log d'audit pour conformité RGPD

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES users(id),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id UUID,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  result VARCHAR(50), -- 'success', 'failure'
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

---

# 🔑 RELATIONS PRINCIPALES

```
users
├── 1 --- N projects (created_by)
├── 1 --- N projects (teacher_id)
├── 1 --- N project_members
├── 1 --- N feedback (given_by)
├── 1 --- N messages (sent_by)
├── 1 --- N files (uploaded_by)
└── 1 --- N activity_log

projects
├── 1 --- N design_steps
├── 1 --- N project_members
├── 1 --- N project_milestones
├── 1 --- N feedback
├── 1 --- N activity_log
├── 1 --- N notifications
├── 1 --- N messages
├── 1 --- N files
├── 1 --- N tasks
└── 1 --- N exports

design_steps
├── 1 --- 1 step_need_analysis
├── 1 --- 1 step_specifications
├── 1 --- 1 step_ideation
├── 1 --- 1 step_modeling
├── 1 --- 1 step_prototyping
├── 1 --- 1 step_evaluation
├── 1 --- N feedback
└── 1 --- 1 step_validations

step_ideation
├── 1 --- N step_ideation_ideas
├── 1 --- N step_ideation_votes
└── 1 --- 1 step_ideation_matrix
```

---

# 📊 DIAGRAMME ENTITÉ-RELATION (ER)

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ email        │
│ password     │
│ first_name   │
│ last_name    │
│ role_id (FK) │
│ school_id(FK)│
└──────────────┘
       |
       |
   ┌───┴─────────────┬────────────────┬──────────────┐
   |                 |                |              |
┌──▼────────────┐ ┌──▼────────────┐ ┌▼───────────┐ ┌▼────────────┐
│   projects    │ │   feedback    │ │  messages  │ │   files    │
├───────────────┤ ├───────────────┤ ├────────────┤ ├────────────┤
│ id (PK)       │ │ id (PK)       │ │ id (PK)    │ │ id (PK)    │
│ title         │ │ step_id (FK)  │ │ project_id │ │ project_id │
│ school_id(FK) │ │ project_id(FK)│ │ sent_by(FK)│ │ uploaded_by│
│ created_by(FK)│ │ given_by (FK) │ │ content    │ │ file_name  │
│ teacher_id(FK)│ │ feedback_type │ │ created_at │ │ file_type  │
│ current_step  │ │ created_at    │ └────────────┘ └────────────┘
│ status        │ └───────────────┘
└───┬───────────┘
    |
    |
┌───▼────────────────────────────────┐
│       design_steps (1-6)           │
├────────────────────────────────────┤
│ id (PK)                            │
│ project_id (FK)                    │
│ step_number (1-6)                  │
│ step_name                          │
│ status (todo/in_progress/...)      │
│                                    │
│ ├─ step_need_analysis      (1:1)   │
│ ├─ step_specifications     (1:1)   │
│ ├─ step_ideation            (1:1)   │
│ ├─ step_modeling           (1:1)   │
│ ├─ step_prototyping        (1:1)   │
│ └─ step_evaluation         (1:1)   │
└────────────────────────────────────┘
```

---

# ✅ VALIDATIONS & CONTRAINTES

```sql
-- Contraintes de domaine
ALTER TABLE design_steps 
  ADD CONSTRAINT check_step_number 
  CHECK (step_number BETWEEN 1 AND 6);

ALTER TABLE projects 
  ADD CONSTRAINT check_progress 
  CHECK (progress_percentage BETWEEN 0 AND 100);

ALTER TABLE step_evaluation 
  ADD CONSTRAINT check_score 
  CHECK (overall_score BETWEEN 0 AND 10);

-- Cascade delete
ALTER TABLE design_steps 
  ADD CONSTRAINT fk_design_steps_project 
  FOREIGN KEY (project_id) 
  REFERENCES projects(id) 
  ON DELETE CASCADE;
```

---

# 🔐 SÉCURITÉ & INDEXES

```sql
-- Indexes pour recherches fréquentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_design_steps_status ON design_steps(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Indexes composites pour queries communes
CREATE INDEX idx_projects_school_teacher 
  ON projects(school_id, teacher_id);

CREATE INDEX idx_design_steps_project_step 
  ON design_steps(project_id, step_number);

-- Recherche en full-text (optionnel)
CREATE INDEX idx_projects_title_fts 
  ON projects USING gin(to_tsvector('french', title));
```

---

# 📝 NOTES D'IMPLÉMENTATION

1. **Transactions** : Les modifications d'étapes doivent être transactionnelles
2. **Backup** : Stratégie de backup quotidien recommandée
3. **Archivage** : Archiver projets terminés après 6 mois
4. **RGPD** : Soft delete sur users, audit_log de tous les accès
5. **Performance** : Indexes sur colonnes fréquemment filtrées
6. **Monitoring** : Monitorer croissance de activity_log et audit_log

---

**Version** : 1.0  
**Créée le** : Juin 2026  
**Pour** : U-CAD-it Platform