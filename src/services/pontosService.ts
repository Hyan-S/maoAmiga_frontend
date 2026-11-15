import { get, post, put, del, montarQuery, Pagina } from './api';

export type Ponto = {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  horario: string;
  tipo: 'coleta' | 'distribuição';
};

// O que vai no POST e no PUT: tudo menos o id, que é a API que gera
export type PontoForm = Omit<Ponto, 'id'>;

export const TAMANHO_PAGINA_PONTOS = 10;

export function listarPontos(): Promise<Ponto[]> {
  return get<Ponto[]>('/pontos');
}

export function buscarPaginaPontos(filtro: string, pagina: number): Promise<Pagina<Ponto>> {
  const query = montarQuery({ filtro, page: pagina, size: TAMANHO_PAGINA_PONTOS });
  return get<Pagina<Ponto>>(`/pontos/filtro${query}`);
}

export function buscarPonto(id: string): Promise<Ponto> {
  return get<Ponto>(`/pontos/${encodeURIComponent(id)}`);
}

export function cadastrarPonto(ponto: PontoForm): Promise<Ponto> {
  return post<Ponto>('/pontos', ponto);
}

export function editarPonto(id: string, ponto: PontoForm): Promise<Ponto> {
  return put<Ponto>(`/pontos/${encodeURIComponent(id)}`, ponto);
}

export function excluirPonto(id: string): Promise<void> {
  return del(`/pontos/${encodeURIComponent(id)}`);
}
