import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarDoacoes } from '../storage/doacoesStorage';
import DoacaoItem from '../components/DoacaoItem';
import ResumoDoacoes from '../components/ResumoDoacoes';

function TelaHistoricoDoacoes({ navigation }) {
  const [doacoes, setDoacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        const salvas = await listarDoacoes();
        if (ativo) {
          setDoacoes(salvas);
          setCarregando(false);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const maisNovasPrimeiro = useMemo(
    () => [...doacoes].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [doacoes]
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (termo === '') {
      return maisNovasPrimeiro;
    }
    return maisNovasPrimeiro.filter((doacao) =>
      doacao.tipoItem.toLowerCase().includes(termo)
    );
  }, [maisNovasPrimeiro, busca]);

  const abrirDetalhe = useCallback(
    (doacao) => {
      navigation.navigate('DetalheDoacao', { doacao });
    },
    [navigation]
  );

  if (carregando) {
    return <View style={styles.container} />;
  }

  if (doacoes.length === 0) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioTitulo}>Nenhuma doação registrada ainda</Text>
        <Text style={styles.vazioTexto}>
          Assim que você registrar uma doação, ela aparece nesta lista.
        </Text>
        <Pressable
          style={styles.botao}
          onPress={() => navigation.navigate('CadastroDoacao', { doacao: undefined })}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>Registrar uma doação</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.buscaArea}>
        <TextInput
          style={styles.busca}
          value={busca}
          onChangeText={setBusca}
          placeholder="Filtrar por tipo de item"
          placeholderTextColor="#9AA7B4"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Filtrar por tipo de item"
        />
      </View>

      <FlatList
        data={filtradas}
        keyExtractor={(doacao) => doacao.id}
        renderItem={({ item }) => <DoacaoItem doacao={item} onPress={abrirDetalhe} />}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        contentContainerStyle={styles.lista}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={<ResumoDoacoes doacoes={doacoes} />}
        ListEmptyComponent={
          <View style={styles.semResultado}>
            <Text style={styles.semResultadoTexto}>
              Nenhuma doação com o tipo "{busca.trim()}".
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  lista: {
    padding: 16,
    flexGrow: 1,
  },
  buscaArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  busca: {
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
  semResultado: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  semResultadoTexto: {
    fontSize: 14,
    color: '#6B7B8C',
    textAlign: 'center',
    lineHeight: 20,
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  vazio: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B3A5C',
    textAlign: 'center',
  },
  vazioTexto: {
    fontSize: 14,
    color: '#6B7B8C',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  botao: {
    backgroundColor: '#1B3A5C',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 24,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TelaHistoricoDoacoes;
