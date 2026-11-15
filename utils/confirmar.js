import { Alert, Platform } from 'react-native';

// Pergunta antes de excluir, com os botões Cancelar e Excluir.
// No celular usa Alert.alert. No navegador o Alert.alert do react-native-web não faz
// nada, então ali cai no window.confirm, só para a versão web também funcionar.
export function confirmarExclusao(titulo, mensagem, aoConfirmar) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) {
      aoConfirmar();
    }
    return;
  }

  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: aoConfirmar },
  ]);
}
