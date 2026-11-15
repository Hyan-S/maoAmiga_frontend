import { useState, useCallback, useRef } from 'react';
import { Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarDoacao, excluirDoacao } from '../src/services/doacoesService';
import { confirmarExclusao } from '../utils/confirmar';
import { mensagemDeErro } from '../src/services/api';
import { formatarData } from '../utils/formatarData';
import { Carregando, Erro } from '../components/EstadoTela';

// Recebe só o id pela navegação e busca a doação na API
function TelaDetalheDoacao({ route, navigation }) {
  const { doacaoId } = route.params;
  const [doacao, setDoacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null); // { status, mensagem }
  const [avisoRecarga, setAvisoRecarga] = useState('');
  const jaCarregou = useRef(false);
  const [excluindo, setExcluindo] = useState(false);
  const [falhaExcluir, setFalhaExcluir] = useState('');

  const carregar = useCallback(
    async (ativo = () => true) => {
      setCarregando(true);
      try {
        const achada = await buscarDoacao(doacaoId);
        if (!ativo()) return;
        setDoacao(achada);
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

  async function excluir() {
    setExcluindo(true);
    setFalhaExcluir('');
    try {
      await excluirDoacao(doacao.id);
      navigation.goBack(); // volta ao histórico, que busca de novo e a doação some
    } catch (falha) {
      // API desligada: avisa e não finge que excluiu
      setFalhaExcluir(`Não foi possível excluir. ${mensagemDeErro(falha)}`);
      setExcluindo(false);
    }
  }

  function pedirConfirmacao() {
    confirmarExclusao(
      'Excluir doação',
      `Excluir ${doacao.quantidade} x ${doacao.tipoItem}? Essa ação não pode ser desfeita.`,
      excluir
    );
  }

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
      {avisoRecarga !== '' && <Text style={styles.aviso}>{avisoRecarga}</Text>}
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

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('CadastroDoacao', { doacao })}
        accessibilityRole="button"
      >
        <Text style={styles.botaoEditarTexto}>Editar doação</Text>
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
          <Text style={styles.botaoExcluirTexto}>Excluir doação</Text>
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

export default TelaDetalheDoacao;
