import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

function PontoItem({ ponto, onPress }) {
  return (
    <View style={styles.linha}>
      <Pressable
        style={styles.item}
        onPress={() => onPress(ponto)}
        accessibilityRole="button"
        accessibilityLabel={`${ponto.nome}, ponto de ${ponto.tipo}`}
      >
        <Text style={styles.nome}>{ponto.nome}</Text>
        <Text style={styles.tipo}>{ponto.tipo}</Text>
        <Text style={styles.endereco}>
          {ponto.endereco} — {ponto.bairro}
        </Text>
        <Text style={styles.horario}>{ponto.horario}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    paddingVertical: 12,
    minHeight: 44,
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
    textTransform: 'capitalize',
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

export default memo(PontoItem);
