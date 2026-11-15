import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

// Tela inteira de carregando, erro ou vazio, cada uma com sua mensagem.
export function Carregando({ mensagem = 'Carregando...' }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color="#1B3A5C" />
      <Text style={styles.texto}>{mensagem}</Text>
    </View>
  );
}

export function Erro({ titulo = 'Não foi possível carregar', mensagem, aoTentarDeNovo }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{mensagem}</Text>
      {aoTentarDeNovo && (
        <TouchableOpacity style={styles.botao} onPress={aoTentarDeNovo} accessibilityRole="button">
          <Text style={styles.botaoTexto}>Tentar de novo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function Vazio({ titulo, mensagem, rotuloAcao, aoAcionar }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>{titulo}</Text>
      {mensagem ? <Text style={styles.texto}>{mensagem}</Text> : null}
      {rotuloAcao && (
        <TouchableOpacity style={styles.botao} onPress={aoAcionar} accessibilityRole="button">
          <Text style={styles.botaoTexto}>{rotuloAcao}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B3A5C',
    textAlign: 'center',
  },
  texto: {
    fontSize: 14,
    color: '#6B7B8C',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  botao: {
    backgroundColor: '#1B3A5C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 20,
  },
  botaoTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
