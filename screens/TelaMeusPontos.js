import { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarPonto } from '../src/services/pontosService';
import { mensagemDeErro } from '../src/services/api';
import { listarFavoritos, removerFavorito, removerFavoritos } from '../storage/favoritosStorage';
import PontoItem from '../components/PontoItem';
import { Carregando, Erro, Vazio } from '../components/EstadoTela';

// Favoritos: os ids vêm do AsyncStorage e cada ponto é buscado na API pelo id
function TelaMeusPontos({ navigation }) {
  const [pontos, setPontos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(async (ativo = () => true) => {
    setCarregando(true);
    setErro('');
    setAviso('');
    const ids = await listarFavoritos();
    const resultados = await Promise.allSettled(ids.map((id) => buscarPonto(id)));
    if (!ativo()) return;

    const achados = [];
    const excluidos = [];
    const falhas = [];
    resultados.forEach((resultado, i) => {
      if (resultado.status === 'fulfilled') {
        achados.push(resultado.value);
      } else if (resultado.reason?.status === 404) {
        excluidos.push(ids[i]); // ponto excluído na API: fica de fora
      } else {
        falhas.push(resultado.reason);
      }
    });

    if (excluidos.length > 0) {
      await removerFavoritos(excluidos);
    }

    achados.sort((a, b) => a.nome.localeCompare(b.nome));
    setPontos(achados);
    if (falhas.length > 0 && achados.length === 0) {
      setErro(mensagemDeErro(falhas[0]));
    } else if (falhas.length > 0) {
      setAviso(`${falhas.length} favorito(s) não carregaram. ${mensagemDeErro(falhas[0])}`);
    }
    setCarregando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      carregar(() => ativo);
      return () => {
        ativo = false;
      };
    }, [carregar])
  );

  // Desmarca na hora: some da tela e sai do AsyncStorage
  const desmarcar = useCallback(async (id) => {
    setPontos((anteriores) => anteriores.filter((ponto) => ponto.id !== id));
    await removerFavorito(id);
  }, []);

  const abrirDetalhe = useCallback(
    (ponto) => navigation.navigate('DetalhePonto', { pontoId: ponto.id }),
    [navigation]
  );

  if (carregando) {
    return <Carregando mensagem="Carregando seus pontos..." />;
  }

  if (erro !== '') {
    return (
      <Erro titulo="Não foi possível carregar seus pontos" mensagem={erro} aoTentarDeNovo={() => carregar()} />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pontos}
        keyExtractor={(ponto) => ponto.id}
        renderItem={({ item }) => (
          <PontoItem ponto={item} onPress={abrirDetalhe} favorito onAlternarFavorito={desmarcar} />
        )}
        ItemSeparatorComponent={Separador}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={aviso !== '' ? <Text style={styles.aviso}>{aviso}</Text> : null}
        ListEmptyComponent={
          <Vazio
            titulo="Nenhum ponto favorito"
            mensagem="Toque no ♡ de um ponto na lista para ele aparecer aqui."
            rotuloAcao="Ver pontos"
            aoAcionar={() => navigation.navigate('ListaPontos')}
          />
        }
      />
    </View>
  );
}

function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  lista: {
    padding: 16,
    flexGrow: 1,
  },
  separador: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  aviso: {
    fontSize: 13,
    color: '#8A5A00',
    backgroundColor: '#FFF4E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
});

export default TelaMeusPontos;
