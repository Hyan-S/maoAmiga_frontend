import { useState, useRef, useCallback } from 'react';
import { mensagemDeErro } from '../services/api';

// Lista com rolagem infinita sobre um endpoint paginado do Spring ({ content, page }).
//
// buscarPagina(filtro, numeroDaPagina) é uma função do service.
// - Nunca pede a mesma página duas vezes: cada número pedido fica guardado em `pedidas`.
// - Para na última página (page.totalPages).
// - recarregar() volta para a página 0; uma resposta que chega atrasada de uma busca
//   anterior é descartada pela `geracao`.
export function useListaPaginada(buscarPagina, filtro) {
  const [itens, setItens] = useState([]);
  const [carregandoPrimeira, setCarregandoPrimeira] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState('');
  const [erroMais, setErroMais] = useState('');
  const [acabou, setAcabou] = useState(false);

  const estado = useRef(novoEstado(0));

  const pedirPagina = useCallback(
    async (numero) => {
      const atual = estado.current;
      if (atual.acabou || atual.ocupado || atual.pedidas.has(numero)) {
        return;
      }
      atual.pedidas.add(numero);
      atual.ocupado = true;
      if (numero === 0) {
        setCarregandoPrimeira(true);
      } else {
        setCarregandoMais(true);
      }

      try {
        const resposta = await buscarPagina(filtro, numero);
        if (atual !== estado.current) return; // chegou depois de outra busca

        setItens((anteriores) => {
          if (numero === 0) return resposta.content;
          const ids = new Set(anteriores.map((item) => item.id));
          return [...anteriores, ...resposta.content.filter((item) => !ids.has(item.id))];
        });
        atual.proxima = numero + 1;
        atual.acabou = numero + 1 >= resposta.page.totalPages;
        atual.erroMais = false;
        setAcabou(atual.acabou);
        setErro('');
        setErroMais('');
      } catch (falha) {
        if (atual !== estado.current) return;
        atual.pedidas.delete(numero); // deixa tentar de novo
        if (numero === 0) {
          setItens([]);
          setErro(mensagemDeErro(falha));
        } else {
          atual.erroMais = true;
          setErroMais(mensagemDeErro(falha));
        }
      } finally {
        if (atual === estado.current) {
          atual.ocupado = false;
          setCarregandoPrimeira(false);
          setCarregandoMais(false);
        }
      }
    },
    [buscarPagina, filtro]
  );

  const recarregar = useCallback(() => {
    estado.current = novoEstado(estado.current.geracao + 1);
    setAcabou(false);
    setErroMais('');
    pedirPagina(0);
  }, [pedirPagina]);

  // Ligado no onEndReached da FlatList
  const carregarMais = useCallback(() => {
    const atual = estado.current;
    if (atual.proxima === 0 || atual.erroMais) return; // a primeira página ainda não veio
    pedirPagina(atual.proxima);
  }, [pedirPagina]);

  const tentarMaisDeNovo = useCallback(() => {
    estado.current.erroMais = false;
    pedirPagina(estado.current.proxima);
  }, [pedirPagina]);

  return {
    itens,
    carregandoPrimeira,
    carregandoMais,
    erro,
    erroMais,
    acabou,
    recarregar,
    carregarMais,
    tentarMaisDeNovo,
  };
}

function novoEstado(geracao) {
  return { geracao, pedidas: new Set(), proxima: 0, acabou: false, ocupado: false, erroMais: false };
}
