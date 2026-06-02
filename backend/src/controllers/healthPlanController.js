const dbHelper = require('../utils/dbHelper');

const getHealthPlans = async (req, res) => {
  try {
    const plans = await dbHelper.query('planos_saude', 'select');
    return res.json(plans);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar planos de saúde' });
  }
};

const createHealthPlan = async (req, res) => {
  const { operadora, plano, produto } = req.body;

  if (!operadora || !plano || !produto) {
    return res.status(400).json({ error: 'Operadora, nome do plano e nome do produto são obrigatórios' });
  }

  try {
    const [insertedId] = await dbHelper.query('planos_saude', 'insert', {
      operadora,
      plano,
      produto
    });

    return res.status(201).json({
      message: 'Plano de saúde criado com sucesso pelo Admin Master!',
      healthPlanId: insertedId
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar plano de saúde' });
  }
};

const deleteHealthPlan = async (req, res) => {
  const { id } = req.params;
  try {
    await dbHelper.query('planos_saude', 'delete', { id: parseInt(id) });
    return res.json({ message: 'Plano de saúde excluído com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao excluir plano de saúde' });
  }
};

module.exports = {
  getHealthPlans,
  createHealthPlan,
  deleteHealthPlan
};
