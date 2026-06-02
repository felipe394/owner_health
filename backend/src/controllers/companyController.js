const dbHelper = require('../utils/dbHelper');
const bcrypt = require('bcryptjs');

const getCompanies = async (req, res) => {
  try {
    const companies = await dbHelper.query('empresas', 'select');
    return res.json(companies);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar empresas' });
  }
};

const getCompanyById = async (req, res) => {
  const { id } = req.params;
  try {
    const companies = await dbHelper.query('empresas', 'select', { id: parseInt(id) });
    if (companies.length === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    const company = companies[0];

    // Obter planos de saúde atendidos pela empresa
    const rawPlans = await dbHelper.query('empresa_planos_saude', 'select', { empresa_id: company.id });
    
    // Obter detalhes de cada plano de saúde cadastrado
    const companyPlans = [];
    for (const rawPlan of rawPlans) {
      const planDetails = await dbHelper.query('planos_saude', 'select', { id: rawPlan.plano_saude_id });
      if (planDetails.length > 0) {
        companyPlans.push({
          id: rawPlan.id,
          health_plan_id: rawPlan.plano_saude_id,
          company_name: planDetails[0].operadora,
          plan_name: planDetails[0].plano,
          product_name: planDetails[0].produto,
          procedures: rawPlan.procedimentos
        });
      }
    }
    company.health_plans = companyPlans;

    // Obter profissionais vinculados
    const professionalRelations = await dbHelper.query('profissional_empresas', 'select', { empresa_id: company.id });
    const professionalsList = [];
    for (const rel of professionalRelations) {
      const profDetails = await dbHelper.query('profissionais', 'select', { id: rel.profissional_id });
      if (profDetails.length > 0) {
        professionalsList.push(profDetails[0]);
      }
    }
    company.professionals = professionalsList;

    return res.json(company);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
};

const registerCompany = async (req, res) => {
  const {
    razao_social,
    nome_fantasia,
    cnpj,
    nome_responsavel,
    cpf_responsavel,
    cargo_responsavel,
    email,
    celular,
    senha
  } = req.body;

  if (!razao_social || !nome_fantasia || !cnpj || !nome_responsavel || !cpf_responsavel || !cargo_responsavel || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  try {
    const existingUsers = await dbHelper.query('usuarios', 'select', { email });
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está em uso' });
    }

    const existingCompanies = await dbHelper.query('empresas', 'select', { cnpj });
    if (existingCompanies.length > 0) {
      return res.status(400).json({ error: 'Este CNPJ já está cadastrado' });
    }

    // Criar credenciais de usuário
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(senha, salt);

    const [userId] = await dbHelper.query('usuarios', 'insert', {
      email,
      senha: passwordHash,
      eh_empresa: true
    });

    const [companyId] = await dbHelper.query('empresas', 'insert', {
      usuario_id: userId,
      razao_social,
      nome_fantasia,
      cnpj,
      nome_responsavel,
      cpf_responsavel,
      cargo_responsavel,
      email,
      celular,
      plano_tipo: 'enterprise',
      pago: false // default false até realizar pagamento
    });

    return res.status(201).json({
      message: 'Empresa cadastrada com sucesso!',
      companyId,
      userId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao cadastrar empresa' });
  }
};

// Gerenciar quais planos de saúde a empresa atende
const addCompanyHealthPlan = async (req, res) => {
  const { id } = req.params; // company_id
  const { health_plan_id, procedures } = req.body;

  if (!health_plan_id) {
    return res.status(400).json({ error: 'Selecione um plano de saúde' });
  }

  try {
    const [insertedId] = await dbHelper.query('empresa_planos_saude', 'insert', {
      empresa_id: parseInt(id),
      plano_saude_id: parseInt(health_plan_id),
      procedimentos: procedures
    });

    return res.status(201).json({
      message: 'Plano de saúde associado à empresa com sucesso!',
      relationId: insertedId
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao associar plano de saúde' });
  }
};

const removeCompanyHealthPlan = async (req, res) => {
  const { relationId } = req.params;
  try {
    await dbHelper.query('empresa_planos_saude', 'delete', { id: parseInt(relationId) });
    return res.json({ message: 'Plano de saúde desassociado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao desassociar plano de saúde' });
  }
};

// Registrar pagamento manual da licença da empresa
const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paid } = req.body;

  try {
    await dbHelper.query('empresas', 'update', { id: parseInt(id) }, { pago: !!paid });
    return res.json({ message: 'Status de pagamento atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  registerCompany,
  addCompanyHealthPlan,
  removeCompanyHealthPlan,
  updatePaymentStatus
};
