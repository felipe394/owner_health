-- =====================================================================
-- OWNER HEALTH — Adições ao Schema (Bloqueios e Notificações Universais)
-- =====================================================================

-- Tabela: agenda_bloqueios (Bloqueio de agenda por mês/ano)
CREATE TABLE IF NOT EXISTS agenda_bloqueios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profissional_id INT NOT NULL,
  mes INT NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INT NOT NULL,
  criado_por INT NOT NULL,
  status VARCHAR(50) DEFAULT 'bloqueado', -- 'bloqueado', 'desbloqueio_solicitado'
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bloqueio (profissional_id, mes, ano),
  FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: agenda_solicitacoes_desbloqueio (Pedidos da secretária para o médico)
CREATE TABLE IF NOT EXISTS agenda_solicitacoes_desbloqueio (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bloqueio_id INT NOT NULL,
  solicitado_por INT NOT NULL, -- ID do usuário (Secretária/Clínica)
  status VARCHAR(20) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'negado'
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bloqueio_id) REFERENCES agenda_bloqueios(id) ON DELETE CASCADE,
  FOREIGN KEY (solicitado_por) REFERENCES usuarios(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: notificacoes_usuarios (Genérica para médicos e clínicas)
CREATE TABLE IF NOT EXISTS notificacoes_usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'aviso', -- 'aviso', 'acao_necessaria'
  referencia_id INT DEFAULT NULL, -- ID da solicitação de desbloqueio, se tipo for 'acao_necessaria'
  lida TINYINT(1) DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
