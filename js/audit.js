// ============================================
// SISTEMA DE AUDITORIA — ATTOS2
// ============================================
// Registra toda ação de qualquer admin no Firestore
// para sabermos quem fez o que e quando.
// ============================================

/**
 * Registra uma ação no log de auditoria.
 * 
 * @param {Object} db - Instância do Firestore
 * @param {Object} user - Usuário logado (auth.currentUser)
 * @param {string} acao - Descrição da ação (ex: "criou_produto", "alterou_status_pedido")
 * @param {string} detalhe - Detalhes adicionais (ex: "Produto: Camiseta Eu Sou do Meu Amado")
 * @param {string} [colecao] - Coleção afetada (ex: "produtos", "pedidos", "config")
 * @param {string} [documentoId] - ID do documento afetado
 * @param {Object} [dadosAntigos] - Dados antes da alteração (opcional)
 * @param {Object} [dadosNovos] - Dados depois da alteração (opcional)
 */
async function registrarAuditoria(db, user, acao, detalhe, colecao, documentoId, dadosAntigos, dadosNovos) {
  if (!db || !user) {
    console.warn('Audit: db ou user não disponível');
    return;
  }

  try {
    const logEntry = {
      acao: acao,
      detalhe: detalhe || '',
      colecao: colecao || '',
      documentoId: documentoId || '',
      adminUid: user.uid,
      adminEmail: user.email || '',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      dadosAntigos: dadosAntigos || null,
      dadosNovos: dadosNovos || null
    };

    await db.collection('auditoria').add(logEntry);
    console.log(`[AUDIT] ${user.email} — ${acao}: ${detalhe}`);
  } catch (err) {
    console.error('Erro ao registrar auditoria:', err);
  }
}

/**
 * Carrega o log de auditoria para exibição.
 * 
 * @param {Object} db - Instância do Firestore
 * @param {number} [limite=50] - Número máximo de registros
 * @param {string} [colecao] - Filtrar por coleção (opcional)
 * @param {string} [adminUid] - Filtrar por admin (opcional)
 * @returns {Promise<Array>} Lista de logs
 */
async function carregarAuditoria(db, limite = 50, colecao = '', adminUid = '') {
  try {
    let query = db.collection('auditoria').orderBy('timestamp', 'desc').limit(limite);
    
    if (colecao) {
      query = query.where('colecao', '==', colecao);
    }
    if (adminUid) {
      query = query.where('adminUid', '==', adminUid);
    }

    const snap = await query.get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Erro ao carregar auditoria:', err);
    return [];
  }
}

/**
 * Formata um timestamp do Firestore para exibição.
 */
function formatarTimestamp(timestamp) {
  if (!timestamp) return '—';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString('pt-BR');
}

/**
 * Mapeia ações para labels legíveis.
 */
const ACAO_LABELS = {
  'criou_produto': 'Criou produto',
  'editou_produto': 'Editou produto',
  'excluiu_produto': 'Excluiu produto',
  'alterou_status_pedido': 'Alterou status do pedido',
  'adicionou_cupom': 'Adicionou cupom',
  'removeu_cupom': 'Removeu cupom',
  'alterou_frete': 'Alterou configuração de frete',
  'alterou_versiculo': 'Alterou versículo do dia',
  'adicionou_admin': 'Adicionou administrador',
  'removeu_admin': 'Removeu administrador',
  'login_admin': 'Login no painel admin',
  'logout_admin': 'Logout do painel admin'
};

function labelAcao(acao) {
  return ACAO_LABELS[acao] || acao;
}
