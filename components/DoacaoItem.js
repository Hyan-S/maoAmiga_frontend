import { memo } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { formatarData } from '../utils/formatarData';

function DoacaoItem({ doacao, onPress }) {
  return (
    <Pressable
      style={styles.item}
      onPress={() => onPress(doacao)}
      accessibilityRole="button"
      accessibilityLabel={`Doação de ${doacao.quantidade} ${doacao.tipoItem}`}
    >
      <Text style={styles.titulo}>
        {doacao.quantidade} x {doacao.tipoItem}
      </Text>
      <Text style={styles.destino}>para {doacao.pontoDestino}</Text>
      <Text style={styles.data}>{formatarData(doacao.criadoEm)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
  destino: {
    fontSize: 14,
    color: '#33475B',
    marginTop: 4,
  },
  data: {
    fontSize: 13,
    color: '#6B7B8C',
    marginTop: 4,
  },
});

export default memo(DoacaoItem);
