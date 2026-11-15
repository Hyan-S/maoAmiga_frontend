import { useState, useLayoutEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { pontosMock } from '../data/pontos';
import { salvarDoacao, atualizarDoacao } from '../storage/doacoesStorage';

const pontosQueRecebem = pontosMock.filter((ponto) => ponto.recebe !== '');

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

function TelaCadastroDoacao({ route, navigation }) {
  const doacaoEditada = route.params?.doacao ?? null;
  const editando = doacaoEditada !== null;

  const [tipoItem, setTipoItem] = useState(editando ? doacaoEditada.tipoItem : '');
  const [quantidade, setQuantidade] = useState(
    editando ? String(doacaoEditada.quantidade) : ''
  );
  const [pontoDestino, setPontoDestino] = useState(editando ? doacaoEditada.pontoDestino : '');
  const [erros, setErros] = useState({ tipoItem: '', quantidade: '', pontoDestino: '' });
  const [confirmacao, setConfirmacao] = useState('');
  const [falhaSalvar, setFalhaSalvar] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar doação' : 'Nova doação' });
  }, [navigation, editando]);

  function aoDigitarTipoItem(valor) {
    setTipoItem(valor);
    setConfirmacao('');
    setFalhaSalvar('');
    setErros({ ...erros, tipoItem: '' });
  }

  function aoDigitarQuantidade(valor) {
    setQuantidade(valor);
    setConfirmacao('');
    setFalhaSalvar('');
    setErros({ ...erros, quantidade: validarQuantidade(valor) });
  }

  function aoEscolherPonto(nome) {
    setPontoDestino(nome);
    setConfirmacao('');
    setFalhaSalvar('');
    setErros({ ...erros, pontoDestino: '' });
  }

  async function aoRegistrar() {
    const novosErros = {
      tipoItem: validarTipoItem(tipoItem),
      quantidade: validarQuantidade(quantidade),
      pontoDestino: validarPontoDestino(pontoDestino),
    };

    setErros(novosErros);

    const temErro =
      novosErros.tipoItem !== '' ||
      novosErros.quantidade !== '' ||
      novosErros.pontoDestino !== '';

    if (temErro) {
      setConfirmacao('');
      setFalhaSalvar('');
      return;
    }

    const campos = {
      tipoItem: tipoItem.trim(),
      quantidade: Number(quantidade.trim()),
      pontoDestino,
    };

    if (editando) {
      const atualizou = await atualizarDoacao({ ...doacaoEditada, ...campos });

      if (!atualizou) {
        setConfirmacao('');
        setFalhaSalvar('Não foi possível salvar as alterações. Tente de novo.');
        return;
      }

      navigation.goBack();
      return;
    }

    const salva = await salvarDoacao(campos);

    if (salva === null) {
      setConfirmacao('');
      setFalhaSalvar('Não foi possível salvar a doação. Tente de novo.');
      return;
    }

    setFalhaSalvar('');
    setTipoItem('');
    setQuantidade('');
    setPontoDestino('');

    setConfirmacao(
      `Doação registrada: ${salva.quantidade} x ${salva.tipoItem} para ${salva.pontoDestino}.`
    );
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
      />
      {erros.quantidade !== '' && <Text style={styles.erro}>{erros.quantidade}</Text>}

      <Text style={styles.rotulo}>Ponto de destino</Text>
      <View style={styles.opcoes}>
        {pontosQueRecebem.map((ponto) => (
          <Pressable
            key={ponto.id}
            style={[styles.opcao, pontoDestino === ponto.nome && styles.opcaoEscolhida]}
            onPress={() => aoEscolherPonto(ponto.nome)}
            accessibilityRole="button"
            accessibilityState={{ selected: pontoDestino === ponto.nome }}
          >
            <Text
              style={[
                styles.opcaoTexto,
                pontoDestino === ponto.nome && styles.opcaoTextoEscolhido,
              ]}
            >
              {ponto.nome}
            </Text>
          </Pressable>
        ))}
      </View>
      {erros.pontoDestino !== '' && <Text style={styles.erro}>{erros.pontoDestino}</Text>}

      <Pressable style={styles.botao} onPress={aoRegistrar} accessibilityRole="button">
        <Text style={styles.botaoTexto}>
          {editando ? 'Salvar alterações' : 'Registrar doação'}
        </Text>
      </Pressable>

      {editando && (
        <Pressable
          style={styles.botaoSecundario}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
        </Pressable>
      )}

      {confirmacao !== '' && <Text style={styles.confirmacao}>{confirmacao}</Text>}
      {falhaSalvar !== '' && <Text style={styles.erro}>{falhaSalvar}</Text>}

      {confirmacao !== '' && (
        <Pressable
          style={styles.botaoSecundario}
          onPress={() => navigation.navigate('HistoricoDoacoes')}
          accessibilityRole="button"
        >
          <Text style={styles.botaoSecundarioTexto}>Ver minhas doações</Text>
        </Pressable>
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
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
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
    paddingVertical: 14,
    minHeight: 44,
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
