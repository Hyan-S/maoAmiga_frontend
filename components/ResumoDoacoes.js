import { View, Text, StyleSheet } from 'react-native';
import { calcularResumo } from '../utils/resumoDoacoes';

function plural(valor, um, varios) {
  return `${valor} ${valor === 1 ? um : varios}`;
}

function ResumoDoacoes({ doacoes }) {
  const resumo = calcularResumo(doacoes);

  if (resumo.totalDoacoes === 0) {
    return (
      <View style={styles.resumo}>
        <Text style={styles.titulo}>Resumo de todas as doações</Text>
        <Text style={styles.vazio}>Nenhuma doação registrada ainda.</Text>
      </View>
    );
  }

  return (
    <View style={styles.resumo}>
      <Text style={styles.titulo}>Resumo de todas as doações</Text>
      <Text style={styles.total}>
        {plural(resumo.totalDoacoes, 'doação registrada', 'doações registradas')},{' '}
        {plural(resumo.totalItens, 'unidade no total', 'unidades no total')}
      </Text>

      {resumo.tipos.map((tipo) => (
        <Text key={tipo.tipo.toLowerCase()} style={styles.linha}>
          {tipo.tipo}: {plural(tipo.quantidade, 'unidade', 'unidades')} em{' '}
          {plural(tipo.doacoes, 'doação', 'doações')}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  resumo: {
    borderWidth: 1,
    borderColor: '#C6D0DA',
    borderRadius: 8,
    backgroundColor: '#F4F7FA',
    padding: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6B7B8C',
  },
  total: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1B3A5C',
    marginTop: 6,
  },
  linha: {
    fontSize: 14,
    color: '#33475B',
    marginTop: 6,
    lineHeight: 20,
  },
  vazio: {
    fontSize: 14,
    color: '#6B7B8C',
    marginTop: 6,
  },
});

export default ResumoDoacoes;
