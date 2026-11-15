# Roteiro de demonstração — até 3 minutos

App do Instituto Mão Amiga, semana das Issues #08 a #14.

**Rode no Expo Go ou num emulador, não na versão web.** No `react-native-web` o
`Alert.alert` é um método vazio, então a confirmação de exclusão não abre no navegador.

Antes de começar: apague o app do aparelho ou limpe os dados, para a demonstração
partir do histórico vazio.

## Passo a passo

| # | Tempo | O que fazer | O que mostrar |
|---|---|---|---|
| 1 | 0:00 | Abrir o app na lista de pontos | Os 7 pontos de coleta e distribuição |
| 2 | 0:15 | Tocar em **Doações** no cabeçalho | Estado vazio: "Nenhuma doação registrada ainda" e o botão que leva ao cadastro |
| 3 | 0:25 | Tocar em **Registrar uma doação** | O formulário |
| 4 | 0:30 | Tentar salvar com os campos vazios, e depois digitar letras na quantidade | As três validações: campo obrigatório, só números inteiros, maior que zero |
| 5 | 0:50 | Registrar `Arroz`, `10`, Paróquia São Benedito | A confirmação e o atalho "Ver minhas doações" |
| 6 | 1:05 | Registrar mais duas: `Roupa` `5` e `roupa` `3` | Que o formulário se limpa a cada registro |
| 7 | 1:25 | Abrir **Minhas doações** | O resumo no topo: total e soma por tipo, com Roupa somando as duas grafias em 8 unidades. A lista com a doação mais nova primeiro |
| 8 | 1:45 | Digitar `rou` no campo de busca | A lista filtra enquanto digita. Apagar o texto traz todas de volta |
| 9 | 1:55 | Digitar `xyz` | A mensagem citando o texto buscado |
| 10 | 2:05 | Limpar a busca e tocar em `10 x Arroz` | A tela de detalhe com todos os campos e a data formatada |
| 11 | 2:15 | Tocar em **Editar doação**, trocar a quantidade para `25`, salvar | O título diz "Editar doação", o formulário já vem preenchido. Ao voltar, detalhe e histórico mostram 25, com a mesma data de registro |
| 12 | 2:35 | Tocar em **Excluir doação** e depois em **Cancelar** | Nada é apagado |
| 13 | 2:40 | Tocar em **Excluir doação** de novo e confirmar | Volta ao histórico sem a doação, e o resumo já desconta ela |
| 14 | 2:50 | Fechar o app de verdade e reabrir em **Doações** | As doações continuam lá: o histórico está no aparelho, não na memória |

## O que foi conferido antes de apresentar

Histórico, detalhe e edição foram medidos em duas larguras, 360 px e 1920 px, lendo o
tamanho real de cada elemento na tela:

- Nenhum texto cortado e nenhum elemento fora da área visível, nas duas larguras.
- Alvos de toque do app, todos com 44 px ou mais: os campos do formulário (44), os cinco
  chips de ponto de destino (44 de altura, de 164 a 280 de largura), os botões Registrar,
  Salvar alterações, Cancelar, Editar e Excluir (48), os itens do histórico (89) e os
  botões Doações e Doar do cabeçalho.
- O campo de busca fica acima da lista, então o teclado não o cobre. A lista usa
  `keyboardShouldPersistTaps="handled"`, para o primeiro toque num item valer com o teclado
  aberto, e `keyboardDismissMode="on-drag"`. O formulário usa
  `automaticallyAdjustKeyboardInsets`, que recua a ScrollView quando o teclado sobe.

Uma ressalva honesta: o botão de voltar do cabeçalho mede 30x30, abaixo dos 44. Ele não é
um componente do app, é o botão padrão do `@react-navigation/elements` e essa medida é da
versão web. No Expo Go o `createNativeStackNavigator` usa o cabeçalho nativo, cujo botão
de voltar já segue o tamanho mínimo da plataforma (44 pt no iOS, 48 dp no Android). Por
isso ele foi mantido como está, em vez de trocar o controle nativo por um botão próprio.

O comportamento do teclado só pode ser confirmado de verdade no aparelho: o navegador não
tem teclado virtual.

## A decisão técnica para defender

**Por que os totais do resumo são calculados e não salvos.**

O resumo sai de `calcularResumo()` a cada renderização, a partir do mesmo array que a
tela já leu. Ele não tem chave própria no AsyncStorage.

Se o total ficasse salvo à parte, haveria dois lugares guardando o mesmo fato. Registrar,
editar e excluir teriam, cada um, que lembrar de atualizar a conta. No dia em que uma
dessas três esquecesse, o número apareceria errado na tela sem erro nenhum no console —
e ninguém descobriria olhando o código, só conferindo na mão. Calculando, o resumo não
tem como discordar da lista: ele é a lista, somada.

O custo é um loop no array a cada render. Para o tamanho desse histórico, é barato.

**Reserva, se perguntarem outra coisa:** por que o acesso ao armazenamento ficou num
arquivo só (`storage/doacoesStorage.js`). A chave `@mao_amiga:doacoes` e o formato
guardado aparecem em um lugar só; as telas pedem `listarDoacoes()` e `salvarDoacao()` sem
saber como está gravado. Trocar AsyncStorage por outra coisa mexe num arquivo, não em
quatro telas.
