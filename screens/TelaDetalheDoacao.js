import { useState, useCallback } from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarDoacao } from '../src/services/doacoesService';
import { mensagemDeErro } from '../src/services/api';
import { formatarData } from '../utils/formatarData';
import { Carregando, Erro } from '../components/EstadoTela';

// Recebe só o id pela navegação e busca a doação na API
function TelaDetalheDoacao({ route }) {
  const { doacaoId } = route.params;
  const [doacao, setDoacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null); // { status, mensagem }

  const carregar = useCallback(
    async (ativo = () => true) => {
      setCarregando(true);
      try {
        const achada = await buscarDoacao(doacaoId);
        if (!ativo()) return;
        setDoacao(achada);
        setErro(null);
      } catch (falha) {
        if (!ativo()) return;
        setDoacao(null);
        setErro({ status: falha?.status, mensagem: mensagemDeErro(falha) });
      } finally {
        if (ativo()) setCarregando(false);
      }
    },
    [doacaoId]
  );

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregar(() => ativo);
      return () => {
        ativo = false;
      };
    }, [carregar])
  );

  if (carregando && doacao === null) {
    return <Carregando mensagem="Carregando doação..." />;
  }

  if (erro?.status === 404) {
    return <Erro titulo="Doação não encontrada" mensagem="Ela pode ter sido excluída." />;
  }

  if (erro !== null) {
    return (
      <Erro
        titulo="Não foi possível carregar a doação"
        mensagem={erro.mensagem}
        aoTentarDeNovo={() => carregar()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>
        {doacao.quantidade} x {doacao.tipoItem}
      </Text>

      <Text style={styles.rotulo}>Tipo do item</Text>
      <Text style={styles.texto}>{doacao.tipoItem}</Text>

      <Text style={styles.rotulo}>Quantidade</Text>
      <Text style={styles.texto}>{doacao.quantidade}</Text>

      <Text style={styles.rotulo}>Ponto de destino</Text>
      <Text style={styles.texto}>{doacao.pontoDestino}</Text>

      <Text style={styles.rotulo}>Registrada em</Text>
      <Text style={styles.texto}>{formatarData(doacao.criadoEm)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
  rotulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginTop: 20,
    marginBottom: 4,
  },
  texto: {
    fontSize: 15,
    lineHeight: 22,
    color: '#33475B',
  },
});

export default TelaDetalheDoacao;
