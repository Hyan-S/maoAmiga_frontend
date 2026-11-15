# Instituto Mão Amiga

App do projeto individual da disciplina (React Native + Expo).

O Instituto Mão Amiga é um banco de alimentos comunitário. O app mostra os pontos de
coleta e distribuição: onde ficam, quando abrem e o que cada um recebe ou distribui.

## API

A partir da N2, os dados ficam numa API Spring Boot, que está num repositório separado:
<https://github.com/Hyan-S/maoAmiga_backend>. Como rodar, endpoints e prints do Swagger estão no README de lá.

### Como o app fala com a API

- Só `src/services/api.ts` chama `fetch`. É lá que fica a URL do servidor, num lugar só
  (`IP_DO_COMPUTADOR`), e as funções `get`, `post`, `put` e `del`. Resposta de erro lança
  `ApiError` com o `status` (0 quando a API nem respondeu: desligada, IP errado ou sem rede).
- `src/services/pontosService.ts` tem listar, buscar página (com filtro), buscar por id,
  cadastrar, editar e excluir. Nenhuma tela monta URL nem chama `fetch`.
- `src/hooks/useListaPaginada.js` faz a rolagem infinita: guarda os números de página já
  pedidos (não pede a mesma duas vezes), para quando chega em `page.totalPages` e descarta
  respostas atrasadas de uma busca anterior.
- A lista de pontos busca pela API (nome ou bairro) 400 ms depois que a pessoa para de digitar,
  e cada busca volta para a página 0.
- O detalhe recebe só o `pontoId` pela navegação e busca o ponto na API. Um 404 mostra
  "Ponto não encontrado".

- Pontos têm CRUD completo pelo app: "+ Novo ponto" abre `screens/TelaFormPonto.js`, que
  valida que nenhum campo está vazio antes de enviar. O tipo é escolhido em dois
  `TouchableOpacity` (coleta / distribuição). Editar abre o **mesmo formulário**, preenchido,
  com o botão "Salvar alterações" (`PUT`). Excluir pede confirmação com `Alert.alert`
  (Cancelar / Excluir) e envia `DELETE`. Se a API recusar (400) ou estiver desligada, o
  formulário mostra o motivo e mantém o que foi digitado.

- Doações também saíram do AsyncStorage e passaram para a API, por
  `src/services/doacoesService.ts` (listar página com filtro, buscar por id, cadastrar, editar e
  excluir, tudo pelo `api.ts`). O cadastro valida no app e envia `POST`. O ponto de destino é
  escolhido entre os pontos que vêm de `GET /api/v1/pontos`, um `TouchableOpacity` por ponto,
  e vai para a API o nome do ponto. O histórico usa a mesma rolagem infinita da lista de pontos,
  com filtro por tipo de item feito na API, e estados próprios de carregando, erro e vazio.
  O resumo de totais da N1 saiu da tela, junto com `storage/doacoesStorage.js`.

- O detalhe da doação recebe só o `doacaoId` e busca na API (404 mostra "Doação não
  encontrada"). Editar reaproveita o formulário do cadastro, preenchido, com "Salvar
  alterações" (`PUT`; a API mantém id e data de cadastro). Excluir confirma com `Alert.alert` e
  envia `DELETE`. Se a API estiver desligada ao salvar ou excluir, o app avisa e não finge que
  deu certo. Se ela cair com um detalhe já aberto, o detalhe continua mostrando o que já tinha,
  com um aviso de que não conseguiu atualizar.

**Testado no navegador** (`npx expo start --web`), com a API rodando no mesmo computador.
Para usar no celular com o Expo Go, troque `IP_DO_COMPUTADOR` em `src/services/api.ts` pelo
IP do computador na rede local (veja com `ipconfig`) e deixe o celular no mesmo Wi-Fi. Se não
conectar, libere a porta 8080 no firewall do Windows.

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
