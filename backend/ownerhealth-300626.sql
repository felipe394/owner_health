# ************************************************************
# Sequel Ace SQL dump
# Versão 20100
#
# https://sequel-ace.com/
# https://github.com/Sequel-Ace/Sequel-Ace
#
# Servidor: 155.204.218.46 (MySQL 5.5.5-10.11.18-MariaDB)
# Banco de Dados: jfwsysrt_ownerhealth
# Tempo de geração: 2026-06-30 20:21:31 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE='NO_AUTO_VALUE_ON_ZERO', SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump de tabela aceites_lgpd
# ------------------------------------------------------------

DROP TABLE IF EXISTS `aceites_lgpd`;

CREATE TABLE `aceites_lgpd` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `aceito_em` timestamp NULL DEFAULT current_timestamp(),
  `endereco_ip` varchar(45) DEFAULT NULL,
  `versao_termos` varchar(10) DEFAULT '1.0',
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `aceites_lgpd_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `aceites_lgpd` WRITE;
/*!40000 ALTER TABLE `aceites_lgpd` DISABLE KEYS */;

INSERT INTO `aceites_lgpd` (`id`, `usuario_id`, `aceito_em`, `endereco_ip`, `versao_termos`)
VALUES
	(1,2,'2026-06-03 13:15:33',NULL,'1.0'),
	(2,4,'2026-06-19 18:59:19',NULL,'1.0');

/*!40000 ALTER TABLE `aceites_lgpd` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela anamnese
# ------------------------------------------------------------

DROP TABLE IF EXISTS `anamnese`;

CREATE TABLE `anamnese` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `queixa_principal` text DEFAULT NULL,
  `historico_doencas` text DEFAULT NULL,
  `alergias` text DEFAULT NULL,
  `medicamentos_uso` text DEFAULT NULL,
  `historico_familiar` text DEFAULT NULL,
  `habitos` text DEFAULT NULL,
  `pressao_arterial` varchar(20) DEFAULT NULL,
  `glicemia` varchar(20) DEFAULT NULL,
  `cirurgias_anteriores` text DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `anamnese_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump de tabela bioimpedancia
# ------------------------------------------------------------

DROP TABLE IF EXISTS `bioimpedancia`;

CREATE TABLE `bioimpedancia` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `gordura_perc` decimal(5,2) DEFAULT NULL,
  `massa_muscular` decimal(5,2) DEFAULT NULL,
  `imc` decimal(5,2) DEFAULT NULL,
  `agua_perc` decimal(5,2) DEFAULT NULL,
  `massa_ossea` decimal(5,2) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `bioimpedancia_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `bioimpedancia` WRITE;
/*!40000 ALTER TABLE `bioimpedancia` DISABLE KEYS */;

INSERT INTO `bioimpedancia` (`id`, `cliente_id`, `data`, `peso`, `gordura_perc`, `massa_muscular`, `imc`, `agua_perc`, `massa_ossea`, `observacoes`, `criado_em`)
VALUES
	(1,2,'2026-06-23',70.50,22.50,35.40,23.60,55.00,3.90,NULL,'2026-06-23 02:51:41');

/*!40000 ALTER TABLE `bioimpedancia` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela clientes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `clientes`;

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `data_nascimento` date NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `plano_empresa` varchar(100) DEFAULT NULL,
  `plano_nome` varchar(100) DEFAULT NULL,
  `plano_produto` varchar(100) DEFAULT NULL,
  `plano_numero_carteirinha` varchar(50) DEFAULT NULL,
  `plano_tipo` varchar(20) DEFAULT 'free',
  `lgpd_aceito` tinyint(1) DEFAULT 0,
  `lgpd_aceito_em` timestamp NULL DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'ativo',
  `pagamento_status` varchar(20) DEFAULT 'pago',
  `plano_plataforma` enum('free','prata','pro') DEFAULT 'free',
  `aceite_lgpd` tinyint(1) DEFAULT 0,
  `aceite_lgpd_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;

INSERT INTO `clientes` (`id`, `usuario_id`, `nome`, `cpf`, `data_nascimento`, `endereco`, `email`, `celular`, `plano_empresa`, `plano_nome`, `plano_produto`, `plano_numero_carteirinha`, `plano_tipo`, `lgpd_aceito`, `lgpd_aceito_em`, `criado_em`, `status`, `pagamento_status`, `plano_plataforma`, `aceite_lgpd`, `aceite_lgpd_em`)
VALUES
	(1,2,'Felipe Cliente','52052067712','2001-10-10','Rua Manuel Inácio de Loiola, 501','felipe.sousa@connectortech.com.br','11945831201','Unimed','Top Ouro','','','free',1,'2026-06-03 13:15:33','2026-06-03 13:15:33','ativo','pago','free',0,NULL),
	(2,4,'Cliente Teste','65677898727','2000-11-11','Rua Pedro de Lorme, 56 - Apto 45, Jardim Redil, São Paulo - SP, CEP: 08215-190','cliente@teste.com','11945831201','Bradesco','Nacional Flex','Médico','67584904','free',1,'2026-06-19 18:59:19','2026-06-19 15:59:19','ativo','pago','free',0,NULL);

/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela dependentes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `dependentes`;

CREATE TABLE `dependentes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `data_nascimento` date NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `plano_empresa` varchar(100) DEFAULT NULL,
  `plano_nome` varchar(100) DEFAULT NULL,
  `plano_produto` varchar(100) DEFAULT NULL,
  `plano_numero_carteirinha` varchar(50) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `dependentes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `dependentes_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `dependentes` WRITE;
/*!40000 ALTER TABLE `dependentes` DISABLE KEYS */;

INSERT INTO `dependentes` (`id`, `cliente_id`, `usuario_id`, `nome`, `cpf`, `data_nascimento`, `endereco`, `email`, `celular`, `plano_empresa`, `plano_nome`, `plano_produto`, `plano_numero_carteirinha`, `criado_em`)
VALUES
	(1,1,NULL,'Cleiton Teste','52052076789','2002-01-11','Rua Pedro de Lorme, 98 - Apto 65, Jardim Redil, São Paulo - SP, CEP: 08215-190','','','Amil','Gold Master','','','2026-06-05 13:41:56');

/*!40000 ALTER TABLE `dependentes` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela empresa_planos_saude
# ------------------------------------------------------------

DROP TABLE IF EXISTS `empresa_planos_saude`;

CREATE TABLE `empresa_planos_saude` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` int(11) NOT NULL,
  `plano_saude_id` int(11) NOT NULL,
  `procedimentos` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `empresa_id` (`empresa_id`),
  KEY `plano_saude_id` (`plano_saude_id`),
  CONSTRAINT `empresa_planos_saude_ibfk_1` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `empresa_planos_saude_ibfk_2` FOREIGN KEY (`plano_saude_id`) REFERENCES `planos_saude` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;



# Dump de tabela empresas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `empresas`;

CREATE TABLE `empresas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `razao_social` varchar(255) NOT NULL,
  `nome_fantasia` varchar(255) NOT NULL,
  `cnpj` varchar(18) NOT NULL,
  `nome_responsavel` varchar(255) NOT NULL,
  `cpf_responsavel` varchar(14) NOT NULL,
  `cargo_responsavel` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `plano_tipo` varchar(20) DEFAULT 'enterprise',
  `pago` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cnpj` (`cnpj`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `empresas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;

INSERT INTO `empresas` (`id`, `usuario_id`, `razao_social`, `nome_fantasia`, `cnpj`, `nome_responsavel`, `cpf_responsavel`, `cargo_responsavel`, `email`, `celular`, `plano_tipo`, `pago`, `criado_em`)
VALUES
	(1,6,'Clínica de Teste','Clínica de Teste','89338393930303','Joel Teste ','02983837867','Ceo','clinica@teste.com','11945831201','enterprise',0,'2026-06-19 16:08:36');

/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela exames
# ------------------------------------------------------------

DROP TABLE IF EXISTS `exames`;

CREATE TABLE `exames` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `data` date NOT NULL,
  `laboratorio` varchar(150) DEFAULT NULL,
  `medico_solicitante` varchar(150) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `arquivo_url` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `exames_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `exames` WRITE;
/*!40000 ALTER TABLE `exames` DISABLE KEYS */;

INSERT INTO `exames` (`id`, `cliente_id`, `tipo`, `data`, `laboratorio`, `medico_solicitante`, `observacoes`, `arquivo_url`, `criado_em`)
VALUES
	(2,2,'Hemograma Completo','2026-06-23','Laboratório de Itaquera','Dr. Teste da Silva','','','2026-06-23 02:55:45');

/*!40000 ALTER TABLE `exames` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela medicamentos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `medicamentos`;

CREATE TABLE `medicamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `nome` varchar(150) NOT NULL,
  `posologia` varchar(255) DEFAULT NULL,
  `horarios` text DEFAULT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `email_lembrete` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `medicamentos_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

LOCK TABLES `medicamentos` WRITE;
/*!40000 ALTER TABLE `medicamentos` DISABLE KEYS */;

INSERT INTO `medicamentos` (`id`, `cliente_id`, `nome`, `posologia`, `horarios`, `data_inicio`, `data_fim`, `observacoes`, `email_lembrete`, `ativo`, `criado_em`)
VALUES
	(1,2,'Dipirona','1 Comprimido','[\"08:00\",\"12:00\"]','2026-06-23','2026-06-27','','',1,'2026-06-23 02:28:29');

/*!40000 ALTER TABLE `medicamentos` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela planos_saude
# ------------------------------------------------------------

DROP TABLE IF EXISTS `planos_saude`;

CREATE TABLE `planos_saude` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `operadora` varchar(100) NOT NULL,
  `plano` varchar(100) NOT NULL,
  `produto` varchar(100) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `planos_saude` WRITE;
/*!40000 ALTER TABLE `planos_saude` DISABLE KEYS */;

INSERT INTO `planos_saude` (`id`, `operadora`, `plano`, `produto`, `criado_em`)
VALUES
	(1,'Bradesco ','Plano Plus ','Enfermagem Corporativa','2026-06-05 18:13:16');

/*!40000 ALTER TABLE `planos_saude` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela profissionais
# ------------------------------------------------------------

DROP TABLE IF EXISTS `profissionais`;

CREATE TABLE `profissionais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `data_nascimento` date NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `numero_conselho` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `profissionais_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;



# Dump de tabela profissional_empresas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `profissional_empresas`;

CREATE TABLE `profissional_empresas` (
  `profissional_id` int(11) NOT NULL,
  `empresa_id` int(11) NOT NULL,
  PRIMARY KEY (`profissional_id`,`empresa_id`),
  KEY `empresa_id` (`empresa_id`),
  CONSTRAINT `profissional_empresas_ibfk_1` FOREIGN KEY (`profissional_id`) REFERENCES `profissionais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `profissional_empresas_ibfk_2` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;



# Dump de tabela profissional_planos_saude
# ------------------------------------------------------------

DROP TABLE IF EXISTS `profissional_planos_saude`;

CREATE TABLE `profissional_planos_saude` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `profissional_id` int(11) NOT NULL,
  `plano_saude_id` int(11) NOT NULL,
  `procedimentos` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `profissional_id` (`profissional_id`),
  KEY `plano_saude_id` (`plano_saude_id`),
  CONSTRAINT `profissional_planos_saude_ibfk_1` FOREIGN KEY (`profissional_id`) REFERENCES `profissionais` (`id`) ON DELETE CASCADE,
  CONSTRAINT `profissional_planos_saude_ibfk_2` FOREIGN KEY (`plano_saude_id`) REFERENCES `planos_saude` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;



# Dump de tabela receitas
# ------------------------------------------------------------

DROP TABLE IF EXISTS `receitas`;

CREATE TABLE `receitas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `medico` varchar(150) DEFAULT NULL,
  `data` date NOT NULL,
  `observacoes` text DEFAULT NULL,
  `medicamentos` text DEFAULT NULL,
  `arquivo_url` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `receitas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump de tabela registro_medicamentos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `registro_medicamentos`;

CREATE TABLE `registro_medicamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `medicamento_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `tomou` tinyint(1) DEFAULT 0,
  `efeitos` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `medicamento_id` (`medicamento_id`),
  CONSTRAINT `registro_medicamentos_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `medicamentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump de tabela satisfacao
# ------------------------------------------------------------

DROP TABLE IF EXISTS `satisfacao`;

CREATE TABLE `satisfacao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` int(11) NOT NULL,
  `profissional_id` int(11) DEFAULT NULL,
  `profissional_nome` varchar(150) DEFAULT NULL,
  `especialidade` varchar(100) DEFAULT NULL,
  `pontualidade` tinyint(4) NOT NULL CHECK (`pontualidade` between 1 and 5),
  `clareza` tinyint(4) NOT NULL CHECK (`clareza` between 1 and 5),
  `qualidade` tinyint(4) NOT NULL CHECK (`qualidade` between 1 and 5),
  `media` decimal(3,1) DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  CONSTRAINT `satisfacao_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



# Dump de tabela usuarios
# ------------------------------------------------------------

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `eh_admin` tinyint(1) DEFAULT 0,
  `eh_cliente` tinyint(1) DEFAULT 0,
  `eh_empresa` tinyint(1) DEFAULT 0,
  `eh_profissional` tinyint(1) DEFAULT 0,
  `eh_dependente` tinyint(1) DEFAULT 0,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;

INSERT INTO `usuarios` (`id`, `email`, `senha`, `eh_admin`, `eh_cliente`, `eh_empresa`, `eh_profissional`, `eh_dependente`, `criado_em`, `atualizado_em`)
VALUES
	(1,'admin@teste.com','$2b$10$Zs4eP2XcRdBmelOHLq5.NeKnzqLvjB6vSW2IOaYxVEhdJJOrm7C0q',1,1,1,1,0,'2026-06-01 17:24:21','2026-06-01 17:24:21'),
	(2,'felipe.sousa@connectortech.com.br','$2b$10$BK8LwdAie7G9Tii3trJ3PONr0MGM1cSCCsQCCLdATdRdk3k.mFILS',0,1,0,0,0,'2026-06-03 13:15:33','2026-06-03 14:05:54'),
	(3,'felipisousa604@gmail.com','$2b$10$aMw0gn9pOAhiA7vBHSn14uO.qi6.u.eW8FP13aBte42k9Dm7Szk12',0,0,0,1,0,'2026-06-05 13:48:09','2026-06-05 13:48:09'),
	(4,'cliente@teste.com','$2b$10$NE6b8y/sT5xa3dR3A99Kpe2zPbE4fp8GDaji6E2a57ArQp8ycf5eW',0,1,0,0,0,'2026-06-19 15:59:19','2026-06-19 15:59:19'),
	(5,'dr.teste@teste.com','$2b$10$sMdV1rtxvPIy7ETSVbFmaOTwXrjPtIiDU8FgWvoyrwp1tRf6IYxE.',0,0,0,1,0,'2026-06-19 16:04:39','2026-06-19 16:04:39'),
	(6,'clinica@teste.com','$2b$10$GfO6ZU97K.y9xpJWD2ZYtObTPl4rpFzyoeU9f/0YHdwLwmVd0xL9S',0,0,1,0,0,'2026-06-19 16:08:36','2026-06-19 16:08:36');

/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;


# Dump de tabela usuarios_sistema
# ------------------------------------------------------------

DROP TABLE IF EXISTS `usuarios_sistema`;

CREATE TABLE `usuarios_sistema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `data_nascimento` date NOT NULL,
  `endereco` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `celular` varchar(20) NOT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `usuarios_sistema_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
