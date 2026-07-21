-- =====================================================================
-- OWNER HEALTH — Adições ao Schema (Módulo Cliente Expandido)
-- Execute este arquivo após o schema_create.sql principal
-- =====================================================================

-- Tabela: exames
CREATE TABLE IF NOT EXISTS exames (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  data DATE NOT NULL,
  laboratorio VARCHAR(150),
  medico_solicitante VARCHAR(150),
  observacoes TEXT,
  arquivo_url TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: receitas
CREATE TABLE IF NOT EXISTS receitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  medico VARCHAR(150),
  data DATE NOT NULL,
  observacoes TEXT,
  medicamentos TEXT,
  arquivo_url TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  posologia VARCHAR(255),
  horarios TEXT,
  data_inicio DATE,
  data_fim DATE,
  observacoes TEXT,
  email_lembrete VARCHAR(255),
  ativo TINYINT(1) DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: registro_medicamentos (controle diário)
CREATE TABLE IF NOT EXISTS registro_medicamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicamento_id INT NOT NULL,
  data DATE NOT NULL,
  tomou TINYINT(1) DEFAULT 0,
  efeitos TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: efeitos_medicamentos (histórico de efeitos colaterais isolados)
CREATE TABLE IF NOT EXISTS efeitos_medicamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  medicamento_id INT NOT NULL,
  efeito TEXT NOT NULL,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicamento_id) REFERENCES medicamentos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: bioimpedancia
CREATE TABLE IF NOT EXISTS bioimpedancia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  data DATE NOT NULL,
  peso DECIMAL(5,2),
  gordura_perc DECIMAL(5,2),
  massa_muscular DECIMAL(5,2),
  imc DECIMAL(5,2),
  agua_perc DECIMAL(5,2),
  massa_ossea DECIMAL(5,2),
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: anamnese (pré-consulta)
CREATE TABLE IF NOT EXISTS anamnese (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  queixa_principal TEXT,
  historico_doencas TEXT,
  alergias TEXT,
  medicamentos_uso TEXT,
  historico_familiar TEXT,
  habitos TEXT,
  pressao_arterial VARCHAR(20),
  glicemia VARCHAR(20),
  cirurgias_anteriores TEXT,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: satisfacao (pesquisa de satisfação pós-atendimento)
CREATE TABLE IF NOT EXISTS satisfacao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  profissional_id INT,
  profissional_nome VARCHAR(150),
  especialidade VARCHAR(100),
  pontualidade TINYINT NOT NULL CHECK (pontualidade BETWEEN 1 AND 5),
  clareza TINYINT NOT NULL CHECK (clareza BETWEEN 1 AND 5),
  qualidade TINYINT NOT NULL CHECK (qualidade BETWEEN 1 AND 5),
  media DECIMAL(3,1),
  comentario TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Alterações na tabela profissionais
ALTER TABLE profissionais
  ADD COLUMN IF NOT EXISTS tipo_profissional VARCHAR(50) DEFAULT 'medico',
  ADD COLUMN IF NOT EXISTS ativo TINYINT(1) DEFAULT 1,
  MODIFY COLUMN numero_conselho VARCHAR(50) NULL;

-- Adicionar coluna plano_plataforma na tabela clientes (Free, Prata, Pro)
ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS plano_plataforma ENUM('free', 'prata', 'pro') DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS aceite_lgpd TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS aceite_lgpd_em DATETIME;

-- Adicionar coluna eh_profissional e colunas necessárias na tabela usuarios
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS eh_cliente TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eh_empresa TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eh_profissional TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eh_dependente TINYINT(1) DEFAULT 0;


-- Formulários de Anamnese por Paciente (Requests)
CREATE TABLE IF NOT EXISTS patient_anamnesis_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  cliente_id INT NOT NULL,
  medico_id INT,
  status VARCHAR(50) DEFAULT 'aguardando',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  respondido_em DATETIME
);

CREATE TABLE IF NOT EXISTS patient_anamnesis_sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  ordem INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES patient_anamnesis_requests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_anamnesis_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  obrigatoria TINYINT(1) DEFAULT 0,
  ordem INT DEFAULT 0,
  placeholder VARCHAR(255),
  descricao TEXT,
  escala_min INT DEFAULT 1,
  escala_max INT DEFAULT 10,
  escala_label_min VARCHAR(100),
  escala_label_max VARCHAR(100),
  parent_option_id INT,
  ativo TINYINT(1) DEFAULT 1,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES patient_anamnesis_sections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_anamnesis_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  texto VARCHAR(255) NOT NULL,
  ordem INT DEFAULT 0,
  ativo TINYINT(1) DEFAULT 1,
  FOREIGN KEY (question_id) REFERENCES patient_anamnesis_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS patient_anamnesis_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  question_id INT NOT NULL,
  resposta TEXT NOT NULL,
  FOREIGN KEY (request_id) REFERENCES patient_anamnesis_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES patient_anamnesis_questions(id) ON DELETE CASCADE
);
ALTER TABLE agendas ADD COLUMN cliente_id INT NULL;
