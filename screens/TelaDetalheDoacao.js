import { useState, useCallback } from 'react';
import { Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { excluirDoacao, buscarDoacao } from '../storage/doacoesStorage';
import { formatarData } from '../utils/formatarData';

function TelaDetalheDoacao({ route, navigation }) {
  const [doacao, setDoacao] = useState(route.params.doacao);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function recarregar() {
        const salva = await buscarDoacao(route.params.doacao.id);
        if (ativo && salva !== null) {
          setDoacao(salva);
        }
      }

      recarregar();

      return () => {
        ativo = false;
      };
    }, [route.params.doacao.id])
  );

  async function excluir() {
    await excluirDoacao(doacao.id);
    navigation.goBack();
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir doação',
      `Excluir ${doacao.quantidade} x ${doacao.tipoItem}? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
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

      <Pressable
        style={styles.botaoEditar}
        onPress={() => navigation.navigate('CadastroDoacao', { doacao })}
        accessibilityRole="button"
      >
        <Text style={styles.botaoEditarTexto}>Editar doação</Text>
      </Pressable>

      <Pressable
        style={styles.botaoExcluir}
        onPress={confirmarExclusao}
        accessibilityRole="button"
      >
        <Text style={styles.botaoExcluirTexto}>Excluir doação</Text>
      </Pressable>
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
    paddingVertical: 14,
    minHeight: 44,
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
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  botaoExcluirTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
  },
});

export default TelaDetalheDoacao;
