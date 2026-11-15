export function calcularResumo(doacoes) {
  const porTipo = new Map();

  for (const doacao of doacoes) {
    const rotulo = String(doacao.tipoItem).trim();
    const chave = rotulo.toLowerCase();
    const quantidade = Number(doacao.quantidade) || 0;
    const acumulado = porTipo.get(chave);

    if (acumulado === undefined) {
      porTipo.set(chave, { tipo: rotulo, quantidade, doacoes: 1 });
    } else {
      acumulado.quantidade += quantidade;
      acumulado.doacoes += 1;
    }
  }

  const tipos = [...porTipo.values()].sort((a, b) => b.quantidade - a.quantidade);

  return {
    totalDoacoes: doacoes.length,
    totalItens: tipos.reduce((soma, tipo) => soma + tipo.quantidade, 0),
    tipos,
  };
}
