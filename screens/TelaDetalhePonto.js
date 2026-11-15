import { useState, useCallback, useRef } from 'react';
import { Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarPonto, excluirPonto } from '../src/services/pontosService';
import { confirmarExclusao } from '../utils/confirmar';
import { removerFavorito } from '../storage/favoritosStorage';
import { mensagemDeErro } from '../src/services/api';
import { Carregando, Erro } from '../components/EstadoTela';

// Recebe só o id pela navegação e busca o ponto na API
function TelaDetalhePonto({ route, navigation }) {
  const { pontoId } = route.params;
  const [ponto, setPonto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null); // { status, mensagem }
  const [avisoRecarga, setAvisoRecarga] = useState('');
  const jaCarregou = useRef(false);
  const [excluindo, setExcluindo] = useState(false);
  const [falhaExcluir, setFalhaExcluir] = useState('');

  const carregar = useCallback(async (ativo = () => true) => {
    setCarregando(true);
    try {
      const achado = await buscarPonto(pontoId);
      if (!ativo()) return;
      setPonto(achado);
      jaCarregou.current = true;
      setAvisoRecarga('');
      setErro(null);
    } catch (falha) {
      if (!ativo()) return;
      if (falha?.status !== 404 && jaCarregou.current) {
        // Já tinha os dados: continua mostrando e só avisa que não atualizou
        setAvisoRecarga(`Não foi possível atualizar. ${mensagemDeErro(falha)}`);
        return;
      }
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

  async function excluir() {
    setExcluindo(true);
    setFalhaExcluir('');
    try {
      await excluirPonto(ponto.id);
      await removerFavorito(ponto.id); // se era favorito, deixa de ser
      navigation.goBack(); // a lista busca de novo ao voltar e o ponto some
    } catch (falha) {
      setFalhaExcluir(mensagemDeErro(falha));
      setExcluindo(false);
    }
  }

  function pedirConfirmacao() {
    confirmarExclusao(
      'Excluir ponto',
      `Excluir "${ponto.nome}"? Essa ação não pode ser desfeita.`,
      excluir
    );
  }

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
      {avisoRecarga !== '' && <Text style={styles.aviso}>{avisoRecarga}</Text>}
      <Text style={styles.nome}>{ponto.nome}</Text>
      <Text style={styles.tipo}>{ponto.tipo}</Text>

      <Text style={styles.rotulo}>Endereço</Text>
      <Text style={styles.texto}>{ponto.endereco}</Text>

      <Text style={styles.rotulo}>Bairro</Text>
      <Text style={styles.texto}>{ponto.bairro}</Text>

      <Text style={styles.rotulo}>Horário</Text>
      <Text style={styles.texto}>{ponto.horario}</Text>

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('FormPonto', { ponto })}
        accessibilityRole="button"
      >
        <Text style={styles.botaoEditarTexto}>Editar ponto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoExcluir}
        onPress={pedirConfirmacao}
        disabled={excluindo}
        accessibilityRole="button"
      >
        {excluindo ? (
          <ActivityIndicator color="#C62828" />
        ) : (
          <Text style={styles.botaoExcluirTexto}>Excluir ponto</Text>
        )}
      </TouchableOpacity>

      {falhaExcluir !== '' && <Text style={styles.falha}>{falhaExcluir}</Text>}
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
  botaoEditar: {
    backgroundColor: '#1B3A5C',
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  botaoEditarTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  botaoExcluir: {
    borderWidth: 1,
    borderColor: '#C62828',
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  botaoExcluirTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
  },
  aviso: {
    fontSize: 13,
    color: '#8A5A00',
    backgroundColor: '#FFF4E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  falha: {
    fontSize: 14,
    color: '#C62828',
    marginTop: 16,
    lineHeight: 20,
  },
});

export default TelaDetalhePonto;
