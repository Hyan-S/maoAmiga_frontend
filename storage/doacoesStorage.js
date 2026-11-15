import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_DOACOES = '@mao_amiga:doacoes';

function gerarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function listarDoacoes() {
  try {
    const salvo = await AsyncStorage.getItem(CHAVE_DOACOES);
    if (salvo === null) {
      return [];
    }
    const doacoes = JSON.parse(salvo);
    if (!Array.isArray(doacoes)) {
      return [];
    }
    return doacoes;
  } catch (erro) {
    console.warn('Nao foi possivel ler as doacoes salvas:', erro);
    return [];
  }
}

export async function salvarDoacao(doacao) {
  const nova = {
    id: gerarId(),
    tipoItem: doacao.tipoItem,
    quantidade: doacao.quantidade,
    pontoDestino: doacao.pontoDestino,
    criadoEm: new Date().toISOString(),
  };

  try {
    const doacoes = await listarDoacoes();
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify([...doacoes, nova]));
    return nova;
  } catch (erro) {
    console.warn('Nao foi possivel salvar a doacao:', erro);
    return null;
  }
}

export async function buscarDoacao(id) {
  const doacoes = await listarDoacoes();
  const achada = doacoes.find((doacao) => doacao.id === id);
  return achada === undefined ? null : achada;
}

export async function atualizarDoacao(doacao) {
  try {
    const doacoes = await listarDoacoes();
    const atualizadas = doacoes.map((salva) =>
      salva.id === doacao.id ? { ...salva, ...doacao } : salva
    );
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(atualizadas));
    return true;
  } catch (erro) {
    console.warn('Nao foi possivel atualizar a doacao:', erro);
    return false;
  }
}

export async function excluirDoacao(id) {
  try {
    const doacoes = await listarDoacoes();
    const restantes = doacoes.filter((doacao) => doacao.id !== id);
    await AsyncStorage.setItem(CHAVE_DOACOES, JSON.stringify(restantes));
    return true;
  } catch (erro) {
    console.warn('Nao foi possivel excluir a doacao:', erro);
    return false;
  }
}
