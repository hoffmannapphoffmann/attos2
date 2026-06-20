window.Carrinho = (function() {
  const STORAGE_KEY = 'attos2_carrinho';

  function obter() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function salvar(itens) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    dispararEvento(itens);
  }

  function dispararEvento(itens) {
    const total = totalItens(itens);
    window.dispatchEvent(new CustomEvent('carrinhoAtualizado', {
      detail: { total, itens }
    }));
  }

  function adicionar(item) {
    const itens = obter();

    // Não usar "item.quantidade || 1": como 0 é falsy em JS, isso
    // mascararia quantidade:0 como se fosse 1. Tratar ausência (undefined)
    // separado de inválido (<= 0).
    const qtdPedida = (item.quantidade === undefined || item.quantidade === null)
      ? 1
      : item.quantidade;
    if (qtdPedida <= 0) {
      return { ok: false, motivo: 'Quantidade inválida.', itens };
    }

    if (item.estoqueDisponivel === undefined || item.estoqueDisponivel === null) {
      return { ok: false, motivo: 'Estoque não informado.', itens };
    }

    if (item.estoqueDisponivel <= 0) {
      return { ok: false, motivo: 'Produto esgotado.', itens };
    }

    const idx = itens.findIndex(i =>
      i.id === item.id && i.tamanho === item.tamanho && i.corte === item.corte
    );

    let quantidadeNoCarrinho = 0;
    if (idx >= 0) quantidadeNoCarrinho = itens[idx].quantidade;

    const novaQuantidade = quantidadeNoCarrinho + qtdPedida;

    if (novaQuantidade > item.estoqueDisponivel) {
      const restam = item.estoqueDisponivel - quantidadeNoCarrinho;
      if (restam <= 0) {
        return { ok: false, motivo: `Só restam ${item.estoqueDisponivel} unidade(s) em estoque, e você já tem ${quantidadeNoCarrinho} no carrinho.`, itens };
      }
      return { ok: false, motivo: `Só é possível adicionar mais ${restam} unidade(s). Restam ${item.estoqueDisponivel} em estoque.`, itens };
    }

    if (idx >= 0) {
      itens[idx].quantidade = novaQuantidade;
    } else {
      itens.push({
        id: item.id, nome: item.nome, preco: item.preco,
        versiculo: item.versiculo || '', imagem: item.imagem || '',
        tamanho: item.tamanho, corte: item.corte, quantidade: qtdPedida
      });
    }

    salvar(itens);
    return { ok: true, itens };
  }

  function remover(index) {
    const itens = obter();
    if (index < 0 || index >= itens.length) return { ok: false, motivo: 'Item não encontrado.', itens };
    itens.splice(index, 1);
    salvar(itens);
    return { ok: true, itens };
  }

  function alterarQuantidade(index, delta, estoqueDisponivel) {
    const itens = obter();
    if (index < 0 || index >= itens.length) return { ok: false, motivo: 'Item não encontrado.', itens };

    const item = itens[index];
    const novaQtd = item.quantidade + delta;

    if (novaQtd <= 0) {
      itens.splice(index, 1);
      salvar(itens);
      return { ok: true, itens };
    }

    if (delta > 0) {
      if (estoqueDisponivel === undefined || estoqueDisponivel === null) {
        return { ok: false, motivo: 'Não foi possível confirmar o estoque. Tente novamente.', itens };
      }
      if (novaQtd > estoqueDisponivel) {
        const podeAdicionar = estoqueDisponivel - item.quantidade;
        if (podeAdicionar <= 0) {
          return { ok: false, motivo: `Você já tem ${item.quantidade} unidade(s) no carrinho. Só restam ${estoqueDisponivel} em estoque.`, itens };
        }
        return { ok: false, motivo: `Só é possível adicionar mais ${podeAdicionar} unidade(s). Restam ${estoqueDisponivel} em estoque.`, itens };
      }
    }

    item.quantidade = novaQtd;
    salvar(itens);
    return { ok: true, itens };
  }

  function limpar() { salvar([]); }

  function totalItens(itens) {
    return (itens || obter()).reduce((acc, i) => acc + (i.quantidade || 0), 0);
  }

  function subtotal(itens) {
    return (itens || obter()).reduce((acc, i) => acc + ((i.preco || 0) * (i.quantidade || 0)), 0);
  }

  async function sincronizarComFirestore(db, user) {
    if (!db || !user) return;
    const itens = obter();
    try {
      await db.collection('clientes').doc(user.uid).update({ carrinho: itens });
    } catch {
      try {
        await db.collection('clientes').doc(user.uid).set({
          carrinho: itens, email: user.email, nome: user.displayName || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Erro ao sincronizar carrinho com Firestore:', err);
      }
    }
  }

  async function limparTudo(db, user) {
    salvar([]);
    if (db && user) {
      try {
        await db.collection('clientes').doc(user.uid).update({ carrinho: [] });
      } catch {}
    }
  }

  return {
    obter, salvar, adicionar, remover, alterarQuantidade, limpar,
    totalItens, subtotal, sincronizarComFirestore, limparTudo
  };
})();
