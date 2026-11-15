import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarPaginaDoacoes } from '../src/services/doacoesService';
import { useListaPaginada } from '../src/hooks/useListaPaginada';
import { useValorAtrasado } from '../src/hooks/useValorAtrasado';
import DoacaoItem from '../components/DoacaoItem';
import { Carregando, Erro, Vazio } from '../components/EstadoTela';

function TelaHistoricoDoacoes({ navigation }) {
  const [busca, setBusca] = useState('');
  const filtro = useValorAtrasado(busca.trim());
  const lista = useListaPaginada(buscarPaginaDoacoes, filtro);
  const { recarregar } = lista;
  const refLista = useRef(null);

  // Ao abrir, ao voltar (depois de cadastrar, editar ou excluir) e a cada busca:
  // pede a página 0 de novo, então a doação mais nova aparece no topo.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  useEffect(() => {
    refLista.current?.scrollToOffset({ offset: 0, animated: false });
  }, [filtro]);

  const abrirDetalhe = useCallback(
    (doacao) => navigation.navigate('DetalheDoacao', { doacaoId: doacao.id }),
    [navigation]
  );

  const irParaCadastro = () => navigation.navigate('CadastroDoacao');

  function renderConteudo() {
    if (lista.carregandoPrimeira && lista.itens.length === 0) {
      return <Carregando mensagem="Carregando doações..." />;
    }
    if (lista.erro !== '') {
      return (
        <Erro
          titulo="Não foi possível carregar as doações"
          mensagem={lista.erro}
          aoTentarDeNovo={recarregar}
        />
      );
    }
    return (
      <FlatList
        ref={refLista}
        data={lista.itens}
        keyExtractor={(doacao) => doacao.id}
        renderItem={({ item }) => <DoacaoItem doacao={item} onPress={abrirDetalhe} />}
        ItemSeparatorComponent={Separador}
        contentContainerStyle={styles.lista}
        onEndReached={lista.carregarMais}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          filtro === '' ? (
            <Vazio
              titulo="Nenhuma doação registrada ainda"
              mensagem="Assim que você registrar uma doação, ela aparece nesta lista."
              rotuloAcao="Registrar uma doação"
              aoAcionar={irParaCadastro}
            />
          ) : (
            <Vazio titulo={`Nenhuma doação com o tipo "${filtro}".`} />
          )
        }
        ListFooterComponent={
          <Rodape
            carregandoMais={lista.carregandoMais}
            erroMais={lista.erroMais}
            acabou={lista.acabou}
            temItens={lista.itens.length > 0}
            aoTentarDeNovo={lista.tentarMaisDeNovo}
          />
        }
      />
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
        {lista.carregandoPrimeira && lista.itens.length > 0 && (
          <ActivityIndicator style={styles.buscando} color="#1B3A5C" />
        )}
      </View>
      {renderConteudo()}
    </KeyboardAvoidingView>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

function Rodape({ carregandoMais, erroMais, acabou, temItens, aoTentarDeNovo }) {
  if (carregandoMais) {
    return <ActivityIndicator style={styles.rodape} color="#1B3A5C" />;
  }
  if (erroMais !== '') {
    return (
      <View style={styles.rodape}>
        <Text style={styles.rodapeErro}>{erroMais}</Text>
        <TouchableOpacity style={styles.botaoRodape} onPress={aoTentarDeNovo} accessibilityRole="button">
          <Text style={styles.botaoRodapeTexto}>Tentar de novo</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (acabou && temItens) {
    return <Text style={[styles.rodape, styles.rodapeFim]}>Fim do histórico</Text>;
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  buscaArea: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  busca: {
    flex: 1,
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
  buscando: {
    marginLeft: 12,
  },
  lista: {
    padding: 16,
    flexGrow: 1,
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  rodape: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  rodapeFim: {
    textAlign: 'center',
    fontSize: 13,
    color: '#9AA7B4',
  },
  rodapeErro: {
    fontSize: 13,
    color: '#C62828',
    textAlign: 'center',
  },
  botaoRodape: {
    borderWidth: 1,
    borderColor: '#1B3A5C',
    borderRadius: 8,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 8,
  },
  botaoRodapeTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
});

export default TelaHistoricoDoacoes;
