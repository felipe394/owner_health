const db = require('../../knexfile');

exports.getNotificacoes = async (req, res) => {
  try {
    const notificacoes = await db('notificacoes_usuarios')
      .where({ usuario_id: req.user.id })
      .orderBy('criado_em', 'desc')
      .limit(50);

    res.json(notificacoes);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db('notificacoes_usuarios').where({ id, usuario_id: req.user.id }).update({ lida: 1 });
    res.json({ message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.deleteNotificacao = async (req, res) => {
  try {
    const { id } = req.params;
    await db('notificacoes_usuarios').where({ id, usuario_id: req.user.id }).del();
    res.json({ message: 'Notificação excluída' });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.bulkMarkAsRead = async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
      await db('notificacoes_usuarios').whereIn('id', ids).andWhere({ usuario_id: req.user.id }).update({ lida: 1 });
    }
    res.json({ message: 'Notificações marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (ids && ids.length > 0) {
      await db('notificacoes_usuarios').whereIn('id', ids).andWhere({ usuario_id: req.user.id }).del();
    }
    res.json({ message: 'Notificações excluídas' });
  } catch (error) {
    console.error('Erro ao excluir notificações:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};
