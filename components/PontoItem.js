import { View, Text, Pressable, StyleSheet } from 'react-native';

function PontoItem({ ponto, onPress }) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <Text style={styles.nome}>{ponto.nome}</Text>
      <Text style={styles.tipo}>{ponto.tipo}</Text>
      <Text style={styles.endereco}>{ponto.endereco}</Text>
      <Text style={styles.horario}>
        {ponto.dias} - {ponto.horario}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
  tipo: {
    fontSize: 12,
    color: '#6B7B8C',
    marginTop: 2,
  },
  endereco: {
    fontSize: 14,
    color: '#33475B',
    marginTop: 6,
  },
  horario: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 4,
  },
});

export default PontoItem;
