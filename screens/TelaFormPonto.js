import { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { cadastrarPonto, editarPonto } from '../src/services/pontosService';
import { mensagemDeErro } from '../src/services/api';

const TIPOS = ['coleta', 'distribuição'];

const CAMPOS = [
  { chave: 'nome', rotulo: 'Nome', exemplo: 'Paróquia São Judas Tadeu' },
  { chave: 'endereco', rotulo: 'Endereço', exemplo: 'Avenida T-7, 1420' },
  { chave: 'bairro', rotulo: 'Bairro', exemplo: 'Setor Bueno' },
  { chave: 'horario', rotulo: 'Horário', exemplo: 'Seg a Sex, 8h às 17h' },
];

const VAZIO = { nome: '', endereco: '', bairro: '', horario: '', tipo: '' };

function validar(valores) {
  const erros = {};
  for (const campo of CAMPOS) {
    if (valores[campo.chave].trim() === '') {
      erros[campo.chave] = `Informe o ${campo.rotulo.toLowerCase()}.`;
    }
  }
  if (!TIPOS.includes(valores.tipo)) {
    erros.tipo = 'Escolha se o ponto é de coleta ou de distribuição.';
  }
  return erros;
}

// Mesmo formulário para cadastrar e editar. Editando, chega com route.params.ponto.
function TelaFormPonto({ route, navigation }) {
  const pontoEditado = route.params?.ponto ?? null;
  const editando = pontoEditado !== null;

  const [valores, setValores] = useState(
    editando
      ? {
          nome: pontoEditado.nome,
          endereco: pontoEditado.endereco,
          bairro: pontoEditado.bairro,
          horario: pontoEditado.horario,
          tipo: pontoEditado.tipo,
        }
      : VAZIO
  );
  const [erros, setErros] = useState({});
  const [falha, setFalha] = useState('');
  const [enviando, setEnviando] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar ponto' : 'Novo ponto' });
  }, [navigation, editando]);

  function alterar(chave, valor) {
    setValores((anteriores) => ({ ...anteriores, [chave]: valor }));
    setErros((anteriores) => ({ ...anteriores, [chave]: undefined }));
    setFalha('');
  }

  async function salvar() {
    const novosErros = validar(valores);
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) {
      return;
    }

    const dados = {
      nome: valores.nome.trim(),
      endereco: valores.endereco.trim(),
      bairro: valores.bairro.trim(),
      horario: valores.horario.trim(),
      tipo: valores.tipo,
    };

    setEnviando(true);
    setFalha('');
    try {
      if (editando) {
        await editarPonto(pontoEditado.id, dados);
        navigation.goBack(); // o detalhe e a lista buscam de novo ao voltar
      } else {
        const criado = await cadastrarPonto(dados);
        navigation.navigate('ListaPontos', { pontoCriado: criado });
      }
    } catch (erro) {
      // 400 ou API desligada: mostra o motivo e mantém o que foi digitado
      setFalha(mensagemDeErro(erro));
      if (erro?.campos) {
        setErros(erro.campos);
      }
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
      {CAMPOS.map((campo) => (
        <View key={campo.chave}>
          <Text style={styles.rotulo}>{campo.rotulo}</Text>
          <TextInput
            style={[styles.campo, erros[campo.chave] && styles.campoComErro]}
            value={valores[campo.chave]}
            onChangeText={(texto) => alterar(campo.chave, texto)}
            placeholder={campo.exemplo}
            placeholderTextColor="#9AA7B4"
            accessibilityLabel={campo.rotulo}
          />
          {erros[campo.chave] ? <Text style={styles.erro}>{erros[campo.chave]}</Text> : null}
        </View>
      ))}

      <Text style={styles.rotulo}>Tipo</Text>
      <View style={styles.opcoes}>
        {TIPOS.map((tipo) => {
          const escolhido = valores.tipo === tipo;
          return (
            <TouchableOpacity
              key={tipo}
              style={[styles.opcao, escolhido && styles.opcaoEscolhida]}
              onPress={() => alterar('tipo', tipo)}
              accessibilityRole="button"
              accessibilityState={{ selected: escolhido }}
            >
              <Text style={[styles.opcaoTexto, escolhido && styles.opcaoTextoEscolhido]}>
                {tipo === 'coleta' ? 'Coleta' : 'Distribuição'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {erros.tipo ? <Text style={styles.erro}>{erros.tipo}</Text> : null}

      {falha !== '' && <Text style={styles.falha}>{falha}</Text>}

      <TouchableOpacity
        style={[styles.botao, enviando && styles.botaoDesativado]}
        onPress={salvar}
        disabled={enviando}
        accessibilityRole="button"
      >
        {enviando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.botaoTexto}>{editando ? 'Salvar alterações' : 'Cadastrar ponto'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoSecundario}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginTop: 16,
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
  },
  opcao: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#C6D0DA',
    borderRadius: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  opcaoEscolhida: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  opcaoTexto: {
    fontSize: 15,
    color: '#33475B',
  },
  opcaoTextoEscolhido: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  falha: {
    fontSize: 14,
    color: '#C62828',
    marginTop: 20,
    lineHeight: 20,
  },
  botao: {
    backgroundColor: '#1B3A5C',
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  botaoDesativado: {
    opacity: 0.7,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#1B3A5C',
    borderRadius: 8,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  botaoSecundarioTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
});

export default TelaFormPonto;
