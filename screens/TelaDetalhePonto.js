import { useState, useCallback } from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarPonto } from '../src/services/pontosService';
import { mensagemDeErro } from '../src/services/api';
import { Carregando, Erro } from '../components/EstadoTela';

// Recebe só o id pela navegação e busca o ponto na API
function TelaDetalhePonto({ route }) {
  const { pontoId } = route.params;
  const [ponto, setPonto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null); // { status, mensagem }

  const carregar = useCallback(async (ativo = () => true) => {
    setCarregando(true);
    try {
      const achado = await buscarPonto(pontoId);
      if (!ativo()) return;
      setPonto(achado);
      setErro(null);
    } catch (falha) {
      if (!ativo()) return;
      setPonto(null);
      setErro({ status: falha?.status, mensagem: mensagemDeErro(falha) });
    } finally {
      if (ativo()) setCarregando(false);
    }
  }, [pontoId]);

  // Busca de novo ao voltar para a tela (depois de editar, por exemplo)
  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregar(() => ativo);
      return () => {
        ativo = false;
      };
    }, [carregar])
  );

  if (carregando && ponto === null) {
    return <Carregando mensagem="Carregando ponto..." />;
  }

  if (erro?.status === 404) {
    return <Erro titulo="Ponto não encontrado" mensagem="Ele pode ter sido excluído." />;
  }

  if (erro !== null) {
    return (
      <Erro
        titulo="Não foi possível carregar o ponto"
        mensagem={erro.mensagem}
        aoTentarDeNovo={() => carregar()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.nome}>{ponto.nome}</Text>
      <Text style={styles.tipo}>{ponto.tipo}</Text>

      <Text style={styles.rotulo}>Endereço</Text>
      <Text style={styles.texto}>{ponto.endereco}</Text>

      <Text style={styles.rotulo}>Bairro</Text>
      <Text style={styles.texto}>{ponto.bairro}</Text>

      <Text style={styles.rotulo}>Horário</Text>
      <Text style={styles.texto}>{ponto.horario}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
  tipo: {
    fontSize: 13,
    color: '#6B7B8C',
    marginTop: 4,
    textTransform: 'capitalize',
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

export default TelaDetalhePonto;
