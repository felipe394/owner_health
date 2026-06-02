const dbHelper = require('../utils/dbHelper');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
  try {
    const users = await dbHelper.query('usuarios_sistema', 'select');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

const registerSystemUser = async (req, res) => {
  const {
    nome,
    cpf,
    data_nascimento,
    endereco,
    email,
    celular,
    senha,
    is_admin // Permite definir se é Admin ou Usuário Comum
  } = req.body;

  if (!nome || !cpf || !data_nascimento || !endereco || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  try {
    const existingUsers = await dbHelper.query('usuarios', 'select', { email });
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado' });
    }

    const existingSystemUsers = await dbHelper.query('usuarios_sistema', 'select', { cpf });
    if (existingSystemUsers.length > 0) {
      return res.status(400).json({ error: 'Este CPF já está cadastrado' });
    }

    // Criar na tabela base de auth
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(senha, salt);

    const [userId] = await dbHelper.query('usuarios', 'insert', {
      email,
      senha: passwordHash,
      eh_admin: !!is_admin
    });

    // Criar perfil em usuarios_sistema
    const [systemUserId] = await dbHelper.query('usuarios_sistema', 'insert', {
      usuario_id: userId,
      nome,
      cpf,
      data_nascimento,
      endereco,
      email,
      celular
    });

    return res.status(201).json({
      message: 'Usuário administrativo cadastrado com sucesso!',
      systemUserId,
      userId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
};

const deleteSystemUser = async (req, res) => {
  const { id } = req.params;
  try {
    const users = await dbHelper.query('usuarios_sistema', 'select', { id: parseInt(id) });
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    const systemUser = users[0];

    // Excluir usuário de login
    await dbHelper.query('usuarios', 'delete', { id: systemUser.usuario_id });
    await dbHelper.query('usuarios_sistema', 'delete', { id: parseInt(id) });

    return res.json({ message: 'Usuário excluído com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
};

module.exports = {
  getUsers,
  registerSystemUser,
  deleteSystemUser
};
