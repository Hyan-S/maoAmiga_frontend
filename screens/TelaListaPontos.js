import { View, FlatList, StyleSheet } from 'react-native';
import { pontosMock } from '../data/pontos';
import PontoItem from '../components/PontoItem';

function TelaListaPontos({ navigation }) {
  return (
    <View style={styles.container}>
      <FlatList
        data={pontosMock}
        keyExtractor={(ponto) => ponto.id}
        renderItem={({ item }) => (
          <PontoItem
            ponto={item}
            onPress={() => navigation.navigate('DetalhePonto', { pontoId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        contentContainerStyle={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  lista: {
    padding: 16,
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});

export default TelaListaPontos;
