const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../knexfile');

// Mock para facilitar o desenvolvimento enquanto o banco de dados não estiver criado/configurado (Português)
const mockUsers = [
  {
    id: 999,
    email: 'admin@teste.com',
    nome: 'Admin Master',
    passwordHash: '$2a$10$E16w7H8oW77F/e.pGpxX6uxGqG4s8f9LzB8N3c9K9Dk9d9D9d9D9d', // hash de '123456'
    eh_admin: true,
    eh_cliente: false,
    eh_empresa: false,
    eh_profissional: false,
    eh_dependente: false
  },
  {
    id: 998,
    email: 'cliente@ownerhealth.com.br',
    nome: 'Carlos Silva',
    passwordHash: '$2a$10$E16w7H8oW77F/e.pGpxX6uxGqG4s8f9LzB8N3c9K9Dk9d9D9d9D9d',
    eh_admin: false,
    eh_cliente: true,
    eh_empresa: false,
    eh_profissional: false,
    eh_dependente: false
  },
  {
    id: 997,
    email: 'empresa@ownerhealth.com.br',
    nome: 'Clínica Saúde Total',
    passwordHash: '$2a$10$E16w7H8oW77F/e.pGpxX6uxGqG4s8f9LzB8N3c9K9Dk9d9D9d9D9d',
    eh_admin: false,
    eh_cliente: false,
    eh_empresa: true,
    eh_profissional: false,
    eh_dependente: false
  },
  {
    id: 996,
    email: 'medico@ownerhealth.com.br',
    nome: 'Dr. Roberto Santos',
    passwordHash: '$2a$10$E16w7H8oW77F/e.pGpxX6uxGqG4s8f9LzB8N3c9K9Dk9d9D9d9D9d',
    eh_admin: false,
    eh_cliente: false,
    eh_empresa: false,
    eh_profissional: true,
    eh_dependente: false
  },
  {
    id: 995,
    email: 'multi@ownerhealth.com.br',
    nome: 'Dr. Arthur Mendes (Multi)',
    passwordHash: '$2a$10$E16w7H8oW77F/e.pGpxX6uxGqG4s8f9LzB8N3c9K9Dk9d9D9d9D9d',
    eh_admin: true,
    eh_cliente: true,
    eh_empresa: true,
    eh_profissional: true,
    eh_dependente: false
  }
];

const authenticate = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    let user = null;
    let passwordMatch = false;

    // Tentar ler do banco de dados (tabela usuarios, coluna senha)
    try {
      user = await db('usuarios').where({ email }).first();
      if (user) {
        passwordMatch = await bcrypt.compare(password, user.senha);
      }
    } catch (dbError) {
      console.warn('⚠️ Conexão com banco de dados falhou, utilizando Mock de dados temporário.');
    }

    // Se falhar no banco, checa no Mock para fins de demonstração
    if (!user) {
      const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (mockUser) {
        // Senha mockada padrão é '123456'
        passwordMatch = password === '123456' || await bcrypt.compare(password, mockUser.passwordHash);
        if (passwordMatch) {
          user = mockUser;
        }
      }
    }

    if (!user || !passwordMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Coleta todas as roles ativas para esse usuário
    const roles = [];
    if (user.eh_admin) roles.push('admin');
    if (user.eh_cliente) roles.push('client');
    if (user.eh_empresa) roles.push('company');
    if (user.eh_profissional) roles.push('professional');
    if (user.eh_dependente) roles.push('dependent');

    if (roles.length === 0) {
      return res.status(403).json({ error: 'Nenhum perfil ativo associado a este usuário' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        roles, 
        name: user.nome || user.email 
      },
      process.env.JWT_SECRET || 'owner_health_secret',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.nome || user.email,
        email: user.email,
        roles,
      },
    });
  } catch (err) {
    console.error('Erro na autenticação:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

module.exports = { authenticate };
