-- =========================================================
-- U-CAD-it — Migration 001 : Schéma initial PostgreSQL
-- Plateforme d'aide au processus d'ingénierie de la conception
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================== M1 : ECOLES & ROLES =====================

CREATE TABLE schools (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20) UNIQUE NOT NULL,      -- ex: ESP-UCAD, ENSEPT
    city            VARCHAR(100),
    country         VARCHAR(100) DEFAULT 'Sénégal',
    registration_code VARCHAR(30) UNIQUE NOT NULL,    -- code utilisé à l'inscription
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE programs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,                -- filière, ex: Génie Informatique
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
    program_id      UUID REFERENCES programs(id) ON DELETE SET NULL,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'student',
    avatar_url      VARCHAR(255),
    phone           VARCHAR(30),
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school ON users(school_id);

-- ===================== M2 : PROJETS & EQUIPES =====================

CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id       UUID REFERENCES schools(id) ON DELETE SET NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    template_id     UUID,                              -- référence vers curriculum_templates
    teacher_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    is_archived     BOOLEAN NOT NULL DEFAULT false,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE team_role AS ENUM ('leader', 'member');

CREATE TABLE project_members (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_role   team_role NOT NULL DEFAULT 'member',
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, user_id)
);

CREATE TABLE milestones (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_number SMALLINT NOT NULL,                     -- 1..6
    due_date    DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== M3 : PROCESSUS DE CONCEPTION GUIDE =====================

CREATE TYPE step_status AS ENUM ('not_started', 'in_progress', 'submitted', 'validated', 'rejected');

-- Référentiel des 6 étapes (modifiable par école via curriculum_templates)
CREATE TABLE process_steps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    step_number     SMALLINT NOT NULL UNIQUE,           -- 1..6
    code            VARCHAR(50) NOT NULL UNIQUE,         -- need_analysis, cdc, ideation, modeling, prototype, evaluation
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    expected_deliverable VARCHAR(200)
);

CREATE TABLE curriculum_templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
    name        VARCHAR(150) NOT NULL,
    created_by  UUID REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE curriculum_template_steps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id     UUID NOT NULL REFERENCES curriculum_templates(id) ON DELETE CASCADE,
    process_step_id UUID NOT NULL REFERENCES process_steps(id),
    is_required     BOOLEAN NOT NULL DEFAULT true,
    custom_label    VARCHAR(200)
);

-- Avancement d'un projet sur chaque étape
CREATE TABLE project_steps (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    process_step_id UUID NOT NULL REFERENCES process_steps(id),
    status          step_status NOT NULL DEFAULT 'not_started',
    submitted_at    TIMESTAMPTZ,
    validated_at    TIMESTAMPTZ,
    validated_by    UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, process_step_id)
);

-- Livrables (versionnés) rattachés à une étape de projet
CREATE TABLE deliverables (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_step_id UUID NOT NULL REFERENCES project_steps(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL DEFAULT 1,
    content         JSONB,                              -- contenu structuré (CdCF, fiche besoin, etc.)
    file_url        VARCHAR(255),                        -- fichier joint (CAO, photo prototype...)
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deliverables_step ON deliverables(project_step_id);

-- ===================== M4 : SUIVI PEDAGOGIQUE =====================

CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deliverable_id  UUID NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id),
    content         TEXT NOT NULL,
    anchor          VARCHAR(100),                        -- ex: référence à un champ précis du livrable
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE notification_type AS ENUM ('submission', 'feedback', 'validation', 'rejection', 'invitation');

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    payload     JSONB,
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Historique / traçabilité (audit log léger)
CREATE TABLE activity_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,                  -- ex: step.submitted, step.validated
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== M5 : COLLABORATION =====================

CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES users(id),
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    due_date        DATE,
    status          task_status NOT NULL DEFAULT 'todo',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE files (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name   VARCHAR(255) NOT NULL,
    file_url    VARCHAR(255) NOT NULL,
    file_type   VARCHAR(50),
    version     INTEGER NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== M6 : EXPORT (métadonnées, pas le binaire) =====================

CREATE TYPE export_format AS ENUM ('pdf', 'docx');

CREATE TABLE exports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    format      export_format NOT NULL,
    file_url    VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== TRIGGERS updated_at =====================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_project_steps BEFORE UPDATE ON project_steps
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
