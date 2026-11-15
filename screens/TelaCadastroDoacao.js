import { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { listarPontos } from '../src/services/pontosService';
import { cadastrarDoacao, editarDoacao } from '../src/services/doacoesService';
import { mensagemDeErro } from '../src/services/api';

function validarTipoItem(valor) {
  if (valor.trim() === '') {
    return 'Informe o tipo do item doado.';
  }
  if (valor.trim().length < 3) {
    return 'O tipo do item precisa ter ao menos 3 caracteres.';
  }
  return '';
}

function validarQuantidade(valor) {
  if (valor.trim() === '') {
    return 'Informe a quantidade.';
  }
  if (/[^0-9]/.test(valor.trim())) {
    return 'A quantidade aceita apenas números inteiros.';
  }
  if (Number(valor) === 0) {
    return 'A quantidade precisa ser maior que zero.';
  }
  return '';
}

function validarPontoDestino(valor) {
  if (valor === '') {
    return 'Escolha o ponto de destino da doação.';
  }
  return '';
}

// Mesmo formulário para cadastrar e editar. Editando, chega com route.params.doacao
// (a doação que o detalhe buscou na API).
function TelaCadastroDoacao({ route, navigation }) {
  const doacaoEditada = route.params?.doacao ?? null;
  const editando = doacaoEditada !== null;

  const [tipoItem, setTipoItem] = useState(editando ? doacaoEditada.tipoItem : '');
  const [quantidade, setQuantidade] = useState(editando ? String(doacaoEditada.quantidade) : '');
  // nome do ponto escolhido
  const [pontoDestino, setPontoDestino] = useState(editando ? doacaoEditada.pontoDestino : '');
  const [erros, setErros] = useState({ tipoItem: '', quantidade: '', pontoDestino: '' });
  const [confirmacao, setConfirmacao] = useState('');
  const [falhaSalvar, setFalhaSalvar] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [pontos, setPontos] = useState([]);
  const [carregandoPontos, setCarregandoPontos] = useState(true);
  const [erroPontos, setErroPontos] = useState('');

  async function carregarPontos() {
    setCarregandoPontos(true);
    try {
      setPontos(await listarPontos());
      setErroPontos('');
    } catch (falha) {
      setErroPontos(mensagemDeErro(falha));
    } finally {
      setCarregandoPontos(false);
    }
  }

  useEffect(() => {
    carregarPontos();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar doação' : 'Nova doação' });
  }, [navigation, editando]);

  // Se o ponto da doação editada não existe mais (foi renomeado ou excluído),
  // ele continua aparecendo como opção para não perder o valor atual.
  const opcoes =
    editando && pontoDestino !== '' && !carregandoPontos && !pontos.some((p) => p.nome === pontoDestino)
      ? [{ id: 'ponto-atual', nome: pontoDestino }, ...pontos]
      : pontos;

  function limparAvisos() {
    setConfirmacao('');
    setFalhaSalvar('');
  }

  function aoDigitarTipoItem(valor) {
    setTipoItem(valor);
    limparAvisos();
    setErros({ ...erros, tipoItem: '' });
  }

  function aoDigitarQuantidade(valor) {
    setQuantidade(valor);
    limparAvisos();
    setErros({ ...erros, quantidade: validarQuantidade(valor) });
  }

  function aoEscolherPonto(nome) {
    setPontoDestino(nome);
    limparAvisos();
    setErros({ ...erros, pontoDestino: '' });
  }

  async function aoRegistrar() {
    const novosErros = {
      tipoItem: validarTipoItem(tipoItem),
      quantidade: validarQuantidade(quantidade),
      pontoDestino: validarPontoDestino(pontoDestino),
    };
    setErros(novosErros);

    if (novosErros.tipoItem !== '' || novosErros.quantidade !== '' || novosErros.pontoDestino !== '') {
      limparAvisos();
      return;
    }

    const campos = {
      tipoItem: tipoItem.trim(),
      quantidade: Number(quantidade.trim()),
      pontoDestino, // vai para a API o nome do ponto
    };

    setEnviando(true);
    limparAvisos();
    try {
      if (editando) {
        // PUT: a API mantém o id e o criadoEm
        await editarDoacao(doacaoEditada.id, campos);
        navigation.goBack(); // o detalhe e o histórico buscam de novo ao voltar
        return;
      }
      const salva = await cadastrarDoacao(campos);
      setTipoItem('');
      setQuantidade('');
      setPontoDestino('');
      setConfirmacao(
        `Doação registrada: ${salva.quantidade} x ${salva.tipoItem} para ${salva.pontoDestino}.`
      );
    } catch (falha) {
      // API recusou (400) ou está desligada: avisa e mantém o que foi digitado
      setFalhaSalvar(
        `${editando ? 'Não foi possível salvar as alterações.' : 'Não foi possível registrar a doação.'} ${mensagemDeErro(falha)}`
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={styles.titulo}>{editando ? 'Editar doação' : 'Registrar doação'}</Text>
      <Text style={styles.subtitulo}>
        {editando
          ? 'Altere o que for preciso e salve. A data do registro não muda.'
          : 'Preencha o que será doado, a quantidade e o ponto que vai receber.'}
      </Text>

      <Text style={styles.rotulo}>Tipo do item</Text>
      <TextInput
        style={[styles.campo, erros.tipoItem !== '' && styles.campoComErro]}
        value={tipoItem}
        onChangeText={aoDigitarTipoItem}
        placeholder="Arroz, leite em pó, fralda infantil..."
        placeholderTextColor="#9AA7B4"
        accessibilityLabel="Tipo do item"
      />
      {erros.tipoItem !== '' && <Text style={styles.erro}>{erros.tipoItem}</Text>}

      <Text style={styles.rotulo}>Quantidade</Text>
      <TextInput
        style={[styles.campo, erros.quantidade !== '' && styles.campoComErro]}
        value={quantidade}
        onChangeText={aoDigitarQuantidade}
        placeholder="Somente números, ex: 12"
        placeholderTextColor="#9AA7B4"
        keyboardType="numeric"
        accessibilityLabel="Quantidade"
      />
      {erros.quantidade !== '' && <Text style={styles.erro}>{erros.quantidade}</Text>}

      <Text style={styles.rotulo}>Ponto de destino</Text>
      {carregandoPontos && <ActivityIndicator color="#1B3A5C" />}
      {erroPontos !== '' && (
        <View>
          <Text style={styles.erro}>{erroPontos}</Text>
          <TouchableOpacity style={styles.botaoSecundario} onPress={carregarPontos} accessibilityRole="button">
            <Text style={styles.botaoSecundarioTexto}>Carregar pontos de novo</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.opcoes}>
        {opcoes.map((ponto) => {
          const escolhido = pontoDestino === ponto.nome;
          return (
            <TouchableOpacity
              key={ponto.id}
              style={[styles.opcao, escolhido && styles.opcaoEscolhida]}
              onPress={() => aoEscolherPonto(ponto.nome)}
              accessibilityRole="button"
              accessibilityState={{ selected: escolhido }}
            >
              <Text style={[styles.opcaoTexto, escolhido && styles.opcaoTextoEscolhido]}>
                {ponto.nome}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {erros.pontoDestino !== '' && <Text style={styles.erro}>{erros.pontoDestino}</Text>}

      {falhaSalvar !== '' && <Text style={styles.falha}>{falhaSalvar}</Text>}

      <TouchableOpacity
        style={[styles.botao, enviando && styles.botaoDesativado]}
        onPress={aoRegistrar}
        disabled={enviando}
        accessibilityRole="button"
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botaoTexto}>{editando ? 'Salvar alterações' : 'Registrar doação'}</Text>
        )}
      </TouchableOpacity>

      {editando && (
        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
        </TouchableOpacity>
      )}

      {confirmacao !== '' && <Text style={styles.confirmacao}>{confirmacao}</Text>}

      {confirmacao !== '' && (
        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => navigation.navigate('HistoricoDoacoes')}
          accessibilityRole="button"
        >
          <Text style={styles.botaoSecundarioTexto}>Ver minhas doações</Text>
        </TouchableOpacity>
      )}
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
  subtitulo: {
    fontSize: 14,
    color: '#6B7B8C',
    marginTop: 6,
    lineHeight: 20,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginTop: 20,
    marginBottom: 6,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#C6D0DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    fontSize: 15,
    color: '#33475B',
    backgroundColor: '#FFFFFF',
  },
  campoComErro: {
    borderColor: '#C62828',
  },
  erro: {
    fontSize: 13,
    color: '#C62828',
    marginTop: 6,
  },
  falha: {
    fontSize: 14,
    color: '#C62828',
    marginTop: 20,
    lineHeight: 20,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  opcao: {
    borderWidth: 1,
    borderColor: '#C6D0DA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoEscolhida: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  opcaoTexto: {
    fontSize: 13,
    color: '#33475B',
  },
  opcaoTextoEscolhido: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  botao: {
    backgroundColor: '#1B3A5C',
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  botaoDesativado: {
    opacity: 0.7,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmacao: {
    fontSize: 14,
    color: '#2E7D32',
    marginTop: 16,
    lineHeight: 20,
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#1B3A5C',
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  botaoSecundarioTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
});

export default TelaCadastroDoacao;
