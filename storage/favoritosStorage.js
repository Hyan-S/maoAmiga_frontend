import AsyncStorage from '@react-native-async-storage/async-storage';

// Favoritos ficam só no aparelho: um array com os ids dos pontos.
// Os dados de cada ponto continuam na API e são buscados pelo id quando precisa.
const CHAVE_FAVORITOS = '@mao_amiga:favoritos';

export async function listarFavoritos() {
  try {
    const salvo = await AsyncStorage.getItem(CHAVE_FAVORITOS);
    const ids = salvo === null ? [] : JSON.parse(salvo);
    return Array.isArray(ids) ? ids : [];
  } catch (erro) {
    console.warn('Nao foi possivel ler os favoritos:', erro);
    return [];
  }
}

async function gravar(ids) {
  await AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(ids));
  return ids;
}

// Marca ou desmarca. Devolve a lista de ids atualizada.
export async function alternarFavorito(id) {
  const ids = await listarFavoritos();
  return gravar(ids.includes(id) ? ids.filter((salvo) => salvo !== id) : [...ids, id]);
}

export async function removerFavorito(id) {
  const ids = await listarFavoritos();
  return gravar(ids.filter((salvo) => salvo !== id));
}

export async function removerFavoritos(idsParaTirar) {
  const ids = await listarFavoritos();
  return gravar(ids.filter((salvo) => !idsParaTirar.includes(salvo)));
}
