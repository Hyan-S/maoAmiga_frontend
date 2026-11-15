import { memo } from 'react';
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';

function PontoItem({ ponto, onPress, favorito, onAlternarFavorito }) {
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

      {onAlternarFavorito && (
        <TouchableOpacity
          style={styles.favorito}
          onPress={() => onAlternarFavorito(ponto.id)}
          accessibilityRole="button"
          accessibilityLabel={favorito ? `Desfavoritar ${ponto.nome}` : `Favoritar ${ponto.nome}`}
          accessibilityState={{ selected: favorito }}
        >
          <Text style={[styles.coracao, favorito && styles.coracaoMarcado]}>{favorito ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      )}
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
  // Área de toque de 48x48, acima do mínimo de 44x44
  favorito: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  coracao: {
    fontSize: 26,
    color: '#9AA7B4',
  },
  coracaoMarcado: {
    color: '#C62828',
  },
});

export default memo(PontoItem);
