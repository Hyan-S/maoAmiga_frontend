import { Pressable, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TelaListaPontos from './screens/TelaListaPontos';
import TelaDetalhePonto from './screens/TelaDetalhePonto';
import TelaCadastroDoacao from './screens/TelaCadastroDoacao';
import TelaHistoricoDoacoes from './screens/TelaHistoricoDoacoes';
import TelaDetalheDoacao from './screens/TelaDetalheDoacao';

const Stack = createNativeStackNavigator();

const estilos = StyleSheet.create({
  botaoCabecalho: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoCabecalhoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A5C',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ListaPontos">
        <Stack.Screen
          name="ListaPontos"
          component={TelaListaPontos}
          options={({ navigation }) => ({
            title: 'Instituto Mão Amiga',
            headerLeft: () => (
              <Pressable
                onPress={() => navigation.navigate('HistoricoDoacoes')}
                accessibilityRole="button"
                accessibilityLabel="Minhas doações"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={estilos.botaoCabecalho}
              >
                <Text style={estilos.botaoCabecalhoTexto}>Doações</Text>
              </Pressable>
            ),
            headerRight: () => (
              <Pressable
                onPress={() => navigation.navigate('CadastroDoacao', { doacao: undefined })}
                accessibilityRole="button"
                accessibilityLabel="Doar"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={estilos.botaoCabecalho}
              >
                <Text style={estilos.botaoCabecalhoTexto}>Doar</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="DetalhePonto"
          component={TelaDetalhePonto}
          options={{ title: 'Detalhe do ponto' }}
        />
        <Stack.Screen
          name="CadastroDoacao"
          component={TelaCadastroDoacao}
          options={{ title: 'Nova doação' }}
        />
        <Stack.Screen
          name="HistoricoDoacoes"
          component={TelaHistoricoDoacoes}
          options={{ title: 'Minhas doações' }}
        />
        <Stack.Screen
          name="DetalheDoacao"
          component={TelaDetalheDoacao}
          options={{ title: 'Detalhe da doação' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
