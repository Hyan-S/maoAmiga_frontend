// Único arquivo do app que chama fetch. As telas usam os services
// (pontosService, doacoesService), que usam as funções daqui.

// Endereço da API. No celular (Expo Go) tem que ser o IP do computador na rede local,
// não localhost: para o celular, localhost é o próprio celular.
// Descubra o IP com `ipconfig` (Windows) ou `ip addr` (Linux) e troque aqui.
const IP_DO_COMPUTADOR = '192.168.1.6';
export const URL_DA_API = `http://${IP_DO_COMPUTADOR}:8080/api/v1`;

// Sem resposta em 10 s, desiste: com a API desligada o app não fica preso carregando.
const TEMPO_LIMITE_MS = 10000;

// Erro de qualquer chamada. status 0 quer dizer que nem chegou resposta
// (API desligada, IP errado, sem rede ou tempo esgotado).
export class ApiError extends Error {
  status: number;
  campos: Record<string, string>;

  constructor(status: number, mensagem: string, campos: Record<string, string> = {}) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.campos = campos;
  }
}

async function requisitar<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const controle = new AbortController();
  const cronometro = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${URL_DA_API}${caminho}`, {
      method: metodo,
      headers: corpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: controle.signal,
    });
  } catch {
    throw new ApiError(0, 'Não foi possível falar com a API. Confira se ela está ligada e se o celular está na mesma rede.');
  } finally {
    clearTimeout(cronometro);
  }

  if (!resposta.ok) {
    let mensagem = `A API respondeu com erro ${resposta.status}.`;
    let campos: Record<string, string> = {};
    try {
      const erro = await resposta.json();
      if (typeof erro?.mensagem === 'string') mensagem = erro.mensagem;
      if (erro?.campos) campos = erro.campos;
    } catch {
      // corpo vazio ou sem JSON: fica a mensagem genérica com o status
    }
    throw new ApiError(resposta.status, mensagem, campos);
  }

  // 204 (DELETE) não tem corpo
  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}

export function get<T>(caminho: string): Promise<T> {
  return requisitar<T>('GET', caminho);
}

export function post<T>(caminho: string, corpo: unknown): Promise<T> {
  return requisitar<T>('POST', caminho, corpo);
}

export function put<T>(caminho: string, corpo: unknown): Promise<T> {
  return requisitar<T>('PUT', caminho, corpo);
}

export function del(caminho: string): Promise<void> {
  return requisitar<void>('DELETE', caminho);
}

// Formato do Page do Spring com serialization-mode=via_dto
export type Pagina<T> = {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
};

// Monta a query string sem deixar parâmetro vazio
export function montarQuery(parametros: Record<string, string | number | undefined>): string {
  const partes = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && String(valor).trim() !== '')
    .map(([chave, valor]) => `${encodeURIComponent(chave)}=${encodeURIComponent(String(valor).trim())}`);
  return partes.length === 0 ? '' : `?${partes.join('&')}`;
}

// Texto para mostrar ao usuário a partir de qualquer erro
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    return erro.message;
  }
  return 'Algo deu errado. Tente de novo.';
}
