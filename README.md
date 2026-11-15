# Instituto Mão Amiga

App do projeto individual da disciplina (React Native + Expo).

O Instituto Mão Amiga é um banco de alimentos comunitário. O app mostra os pontos de
coleta e distribuição: onde ficam, quando abrem e o que cada um recebe ou distribui.

## Estado atual (Issue #14)

Pontos de coleta:

- Lista de pontos com FlatList, no lugar do `.map()`.
- Array com 7 pontos, cada um com endereço completo, dias/horários e o que recebe ou distribui.
- Navegação lista para detalhe com `Stack.Navigator`, passando `pontoId` por `route.params`.

Doações:

- Formulário de cadastro (`screens/TelaCadastroDoacao.js`) com tipo do item, quantidade e
  ponto de destino, aberto pelo botão "Doar" no cabeçalho da lista.
- Validação campo a campo: os três campos são obrigatórios e a quantidade só aceita
  números inteiros maiores que zero, mostrando mensagem de erro abaixo do campo.
- Histórico com todas as doações salvas, em "Minhas doações", com FlatList e estado vazio.
- Detalhe de cada doação, com edição e exclusão confirmada por `Alert.alert`.
- A edição reaproveita a mesma tela do cadastro, preenchida pelos dados da doação.
- Campo de busca que filtra o histórico pelo tipo do item enquanto se digita.
- Resumo no topo do histórico com o total de doações e a soma por tipo, ordenado da maior
  quantidade para a menor.

Ainda não há backend remoto: tudo fica no aparelho.

## Como os dados são guardados

Todo o acesso ao AsyncStorage para doações passa por `storage/doacoesStorage.js`, que
oferece `listarDoacoes`, `salvarDoacao`, `buscarDoacao`, `atualizarDoacao` e
`excluirDoacao`. Nenhuma tela importa o AsyncStorage diretamente.

A chave `@mao_amiga:doacoes` guarda um array, e cada doação tem este formato:

```js
{ id, tipoItem, quantidade, pontoDestino, criadoEm }
```

O resumo por tipo não é salvo: sai de `utils/resumoDoacoes.js`, calculado a partir do
array a cada renderização.

## Estrutura

    App.js                          rotas do Stack.Navigator
    screens/TelaListaPontos.js      lista de pontos
    screens/TelaDetalhePonto.js     detalhe de um ponto
    screens/TelaCadastroDoacao.js   cadastro e edição de doação
    screens/TelaHistoricoDoacoes.js histórico, busca e resumo
    screens/TelaDetalheDoacao.js    detalhe, editar e excluir
    components/PontoItem.js         item da lista de pontos
    components/DoacaoItem.js        item do histórico (React.memo)
    components/ResumoDoacoes.js     totais por tipo
    storage/doacoesStorage.js       único acesso ao AsyncStorage
    utils/formatarData.js           data legível em pt-BR
    utils/resumoDoacoes.js          cálculo dos totais
    data/pontos.js                  os 7 pontos

## Como rodar

    npm install
    npx expo start

Leia o QR Code com o Expo Go.

## Demonstração

O roteiro da apresentação está em [ROTEIRO-DEMO.md](ROTEIRO-DEMO.md).

Para demonstrar, use o Expo Go ou um emulador. Na versão web o `Alert.alert` do
`react-native-web` é um método vazio, então a confirmação de exclusão não abre.

Endereços e horários são dados fictícios de exercício acadêmico.
