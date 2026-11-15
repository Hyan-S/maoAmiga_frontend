import { get, post, put, del, montarQuery, Pagina } from './api';

export type Doacao = {
  id: string;
  tipoItem: string;
  quantidade: number;
  pontoDestino: string; // nome do ponto
  criadoEm: string; // LocalDateTime da API, ex.: "2026-11-15T16:05:59.001"
};

// O que vai no POST e no PUT. id e criadoEm são da API.
export type DoacaoForm = Pick<Doacao, 'tipoItem' | 'quantidade' | 'pontoDestino'>;

export const TAMANHO_PAGINA_DOACOES = 10;

// Página do histórico, da mais nova para a mais antiga (ordem padrão da API)
export function buscarPaginaDoacoes(filtro: string, pagina: number): Promise<Pagina<Doacao>> {
  const query = montarQuery({ filtro, page: pagina, size: TAMANHO_PAGINA_DOACOES });
  return get<Pagina<Doacao>>(`/doacoes/filtro${query}`);
}

export function buscarDoacao(id: string): Promise<Doacao> {
  return get<Doacao>(`/doacoes/${encodeURIComponent(id)}`);
}

export function cadastrarDoacao(doacao: DoacaoForm): Promise<Doacao> {
  return post<Doacao>('/doacoes', doacao);
}

export function editarDoacao(id: string, doacao: DoacaoForm): Promise<Doacao> {
  return put<Doacao>(`/doacoes/${encodeURIComponent(id)}`, doacao);
}

export function excluirDoacao(id: string): Promise<void> {
  return del(`/doacoes/${encodeURIComponent(id)}`);
}
