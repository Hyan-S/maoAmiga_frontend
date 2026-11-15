import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { pontosMock } from '../data/pontos';

function PontoDetalhe({ ponto }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.nome}>{ponto.nome}</Text>
      <Text style={styles.tipo}>{ponto.tipo}</Text>

      <Text style={styles.rotulo}>Endereço</Text>
      <Text style={styles.texto}>{ponto.endereco}</Text>

      <Text style={styles.rotulo}>Dias e horários</Text>
      <Text style={styles.texto}>
        {ponto.dias} - {ponto.horario}
      </Text>

      {ponto.recebe !== '' && (
        <View>
          <Text style={styles.rotulo}>O que recebe</Text>
          <Text style={styles.texto}>{ponto.recebe}</Text>
        </View>
      )}

      {ponto.distribui !== '' && (
        <View>
          <Text style={styles.rotulo}>O que distribui</Text>
          <Text style={styles.texto}>{ponto.distribui}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function TelaDetalhePonto({ route }) {
  const { pontoId } = route.params;
  const ponto = pontosMock.find((p) => p.id === pontoId);

  return <PontoDetalhe ponto={ponto} />;
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
