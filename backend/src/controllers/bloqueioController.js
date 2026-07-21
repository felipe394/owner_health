const db = require('../../knexfile');
const dbHelper = require('../utils/dbHelper');

// Lista os bloqueios do médico logado ou do médico pesquisado
exports.listarBloqueios = async (req, res) => {
  try {
    const { profissional_id } = req.query;
    
    let targetId = profissional_id;
    if (!targetId || targetId == 0 || targetId == '0') {
      const prof = await db('profissionais').where({ usuario_id: req.user.id }).first();
      if (prof) targetId = prof.id;
    }

    if (!targetId) {
      return res.status(400).json({ error: 'profissional_id é obrigatório' });
    }

    let bloqueios = [];
    try {
      bloqueios = await db('agenda_bloqueios').where({ profissional_id: targetId });
    } catch {
      bloqueios = await dbHelper.query('agenda_bloqueios', 'select', { profissional_id: parseInt(targetId) });
      if (!Array.isArray(bloqueios)) bloqueios = [];
    }
    res.json(bloqueios);
  } catch (error) {
    console.error('Erro ao listar bloqueios:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Fecha (bloqueia) um mês específico
exports.fecharMes = async (req, res) => {
  try {
    const { profissional_id, mes, ano } = req.body;
    const criado_por = req.user.id;

    let targetId = profissional_id;
    if (!targetId || targetId == 0 || targetId == '0') {
      const prof = await db('profissionais').where({ usuario_id: req.user.id }).first();
      if (prof) targetId = prof.id;
    }

    if (!targetId || !mes || !ano) {
      return res.status(400).json({ error: 'Faltam parâmetros obrigatórios' });
    }

    // Verificar se já existe bloqueio
    const existente = await db('agenda_bloqueios')
      .where({ profissional_id: targetId, mes, ano })
      .first();

    if (existente) {
      return res.status(400).json({ error: 'Mês já está bloqueado' });
    }

    await db('agenda_bloqueios').insert({
      profissional_id: targetId,
      mes,
      ano,
      criado_por,
      status: 'bloqueado'
    });

    res.json({ message: 'Mês bloqueado com sucesso' });
  } catch (error) {
    console.error('Erro ao fechar mês:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Abre (desbloqueia) ou solicita abertura de um mês
exports.abrirMes = async (req, res) => {
  try {
    const { id } = req.params; // id do bloqueio
    const usuario_id = req.user.id;
    const isEmpresa = req.user.eh_empresa === 1;

    const bloqueio = await db('agenda_bloqueios').where({ id }).first();
    if (!bloqueio) {
      return res.status(404).json({ error: 'Bloqueio não encontrado' });
    }

    // Se quem está abrindo for a própria pessoa que bloqueou OU for um médico
    if (bloqueio.criado_por === usuario_id || !isEmpresa) {
      await db('agenda_bloqueios').where({ id }).del();
      return res.json({ message: 'Agenda aberta com sucesso', status: 'aberto' });
    }

    // Se for secretária tentando abrir bloqueio feito por médico, precisa solicitar
    if (isEmpresa && bloqueio.criado_por !== usuario_id) {
      // Verifica se já não tem solicitação pendente
      const pendente = await db('agenda_solicitacoes_desbloqueio')
        .where({ bloqueio_id: id, status: 'pendente' })
        .first();

      if (pendente) {
        return res.status(400).json({ error: 'Já existe uma solicitação pendente para este mês' });
      }

      // Criar solicitação
      const [solicitacao_id] = await db('agenda_solicitacoes_desbloqueio').insert({
        bloqueio_id: id,
        solicitado_por: usuario_id,
        status: 'pendente'
      });

      // Atualizar status do bloqueio
      await db('agenda_bloqueios').where({ id }).update({ status: 'desbloqueio_solicitado' });

      // Pegar os dados para notificar o médico
      const prof = await db('profissionais').where({ id: bloqueio.profissional_id }).first();
      
      const mesFormatado = `${String(bloqueio.mes).padStart(2, '0')}/${bloqueio.ano}`;
      
      await db('notificacoes_usuarios').insert({
        usuario_id: prof.usuario_id,
        mensagem: `A secretaria solicitou a abertura da sua agenda de ${mesFormatado}.`,
        tipo: 'acao_necessaria',
        referencia_id: solicitacao_id
      });

      return res.json({ message: 'Solicitação enviada ao médico', status: 'solicitado' });
    }

  } catch (error) {
    console.error('Erro ao abrir mês:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Médico responde à solicitação
exports.responderSolicitacao = async (req, res) => {
  try {
    const { id } = req.params; // id da solicitacao
    const { aprovado } = req.body; // boolean

    const solicitacao = await db('agenda_solicitacoes_desbloqueio').where({ id }).first();
    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada' });
    }

    const bloqueio = await db('agenda_bloqueios').where({ id: solicitacao.bloqueio_id }).first();
    const mesFormatado = `${String(bloqueio.mes).padStart(2, '0')}/${bloqueio.ano}`;
    const prof = await db('profissionais').where({ usuario_id: req.user.id }).first();

    if (aprovado) {
      await db('agenda_solicitacoes_desbloqueio').where({ id }).update({ status: 'aprovado' });
      await db('agenda_bloqueios').where({ id: bloqueio.id }).del();
      
      await db('notificacoes_usuarios').insert({
        usuario_id: solicitacao.solicitado_por,
        mensagem: `O Dr(a). ${prof.nome} APROVOU a abertura da agenda de ${mesFormatado}.`,
        tipo: 'aviso'
      });

      res.json({ message: 'Abertura de agenda aprovada.' });
    } else {
      await db('agenda_solicitacoes_desbloqueio').where({ id }).update({ status: 'negado' });
      await db('agenda_bloqueios').where({ id: bloqueio.id }).update({ status: 'bloqueado' });
      
      await db('notificacoes_usuarios').insert({
        usuario_id: solicitacao.solicitado_por,
        mensagem: `O Dr(a). ${prof.nome} RECUSOU a abertura da agenda de ${mesFormatado}.`,
        tipo: 'aviso'
      });

      res.json({ message: 'Abertura de agenda recusada.' });
    }
  } catch (error) {
    console.error('Erro ao responder solicitação:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
