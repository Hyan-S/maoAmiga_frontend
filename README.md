# Instituto Mão Amiga

App do projeto individual da disciplina (React Native + Expo), agora consumindo uma API
Spring Boot feita para ele.

O Instituto Mão Amiga é um banco de alimentos comunitário de Goiânia. O app mostra os pontos de
coleta e distribuição e registra as doações. Pontos e doações ficam na API; os pontos favoritos
ficam no aparelho.

**Onde está a API:** num repositório separado, <https://github.com/Hyan-S/maoAmiga_backend>. Endpoints, regras de
validação e prints do Swagger estão no README de lá.

## Como rodar

### 1. API (Spring Boot)

Precisa do **JDK 21** (por exemplo, Eclipse Temurin 21 ou Microsoft OpenJDK 21). O Maven não
precisa estar instalado: o projeto traz o wrapper (`mvnw`).

    git clone https://github.com/Hyan-S/maoAmiga_backend.git
    cd maoAmiga_backend
    ./mvnw spring-boot:run          # Windows (cmd/PowerShell): mvnw.cmd spring-boot:run

A API sobe em `http://localhost:8080`, escutando em todas as interfaces de rede.

- Swagger: <http://localhost:8080/swagger-ui.html>
- Na primeira vez ela cadastra 25 pontos em Goiânia. O banco H2 grava na pasta `data/` do
  repositório da API; para voltar ao estado inicial, pare a API e apague essa pasta.

### 2. App (Expo)

    npm install
    npx expo start

**Onde trocar o IP:** em `src/services/api.ts`, na constante `IP_DO_COMPUTADOR`. No celular
(Expo Go) não dá para usar `localhost`, porque para o celular `localhost` é o próprio celular.
Coloque o IP do computador na rede local (no Windows, `ipconfig` → "Endereço IPv4") e deixe o
celular no mesmo Wi-Fi. Se o celular não conectar, libere a porta 8080 no firewall do Windows.

Para testar no navegador do próprio computador: `npx expo start --web`. **Os testes desta
entrega foram feitos no navegador**, com a API rodando na mesma máquina.

## O que o app faz

**Pontos de coleta (API)**

- Lista com rolagem infinita (`onEndReached`), 10 por página, e busca por nome ou bairro feita
  pela API. Cada busca volta para a primeira página.
- Detalhe que recebe só o id e busca o ponto na API. Um 404 mostra "Ponto não encontrado".
- Cadastrar, editar (mesmo formulário, já preenchido, com "Salvar alterações") e excluir com
  confirmação. O tipo é escolhido entre "coleta" e "distribuição" em dois `TouchableOpacity`.
- ♡/♥ em cada ponto para favoritar, com área de toque de 48x48.

**Meus pontos (aparelho + API)**

- Os favoritos são só os ids, guardados no AsyncStorage (`storage/favoritosStorage.js`), e
  continuam lá depois de fechar e reabrir o app.
- A tela "Meus pontos" busca cada favorito na API pelo id. Um ponto que foi excluído fica de
  fora sem quebrar a tela, e o id dele sai do AsyncStorage. Tem estado vazio e um botão para
  desmarcar ali mesmo.

**Doações (API)**

- Cadastro validado no app antes do `POST`. O ponto de destino é escolhido entre os pontos da
  API, e vai para a API o nome do ponto.
- Histórico da mais nova para a mais antiga, com rolagem infinita, filtro por tipo de item
  feito pela API e estados próprios de carregando, erro e vazio. Uma doação nova aparece no
  topo ao voltar para o histórico.
- Detalhe por id (404 mostra "Doação não encontrada"), edição no mesmo formulário do cadastro
  (a API mantém id e data) e exclusão com confirmação.

**Quando a API recusa ou está desligada,** o app mostra uma mensagem, mantém o que foi
digitado e não finge que deu certo. Listas e detalhes têm "Tentar de novo".

## Como o código fala com a API

- `src/services/api.ts` é o **único** arquivo que chama `fetch`. Tem a URL do servidor num lugar
  só e as funções `get`, `post`, `put` e `del`. Uma resposta de erro vira `ApiError` com o
  `status` (0 quando nem houve resposta) e a mensagem que a API mandou. Sem resposta em 10 s,
  desiste, para o app não ficar preso carregando.
- `src/services/pontosService.ts` e `src/services/doacoesService.ts` montam os caminhos. Nenhuma
  tela monta URL.
- `src/hooks/useListaPaginada.js` faz a rolagem infinita das duas listas: guarda as páginas já
  pedidas (não pede a mesma duas vezes), para em `page.totalPages` e descarta resposta atrasada
  de uma busca anterior.

## Estrutura

    App.js                            rotas do Stack.Navigator
    src/services/api.ts               único fetch, URL da API, get/post/put/del
    src/services/pontosService.ts     pontos: listar, página, por id, cadastrar, editar, excluir
    src/services/doacoesService.ts    doações: página, por id, cadastrar, editar, excluir
    src/hooks/useListaPaginada.js     rolagem infinita sem repetir página
    src/hooks/useValorAtrasado.js     espera parar de digitar para buscar
    screens/TelaListaPontos.js        lista, busca e favoritos
    screens/TelaDetalhePonto.js       detalhe, editar e excluir ponto
    screens/TelaFormPonto.js          cadastro e edição de ponto
    screens/TelaMeusPontos.js         favoritos buscados na API
    screens/TelaCadastroDoacao.js     cadastro e edição de doação
    screens/TelaHistoricoDoacoes.js   histórico com filtro
    screens/TelaDetalheDoacao.js      detalhe, editar e excluir doação
    components/PontoItem.js           item de ponto com ♡/♥
    components/DoacaoItem.js          item do histórico
    components/EstadoTela.js          carregando, erro e vazio
    storage/favoritosStorage.js       único acesso ao AsyncStorage (ids dos favoritos)
    utils/confirmar.js                confirmação de exclusão (Alert.alert)

## Roteiro de demonstração (até 3 minutos)

Antes: suba a API com o banco limpo (apague a pasta `data` da API), abra o app e deixe o Swagger aberto
numa aba.

| # | Tempo | O que fazer | O que mostrar |
|---|---|---|---|
| 1 | 0:00 | Abrir o app e rolar a lista até o fim | Pontos da API chegando de 10 em 10, até "Fim da lista" |
| 2 | 0:15 | Buscar `campinas` | A API filtra por bairro e a lista volta para a primeira página |
| 3 | 0:25 | **+ Novo ponto**: tentar salvar vazio, depois preencher e escolher "Coleta" | Validação no app; o ponto novo aparece no topo da lista |
| 4 | 0:50 | Abrir o ponto novo → **Editar ponto**, mudar nome e tipo, **Salvar alterações** | Formulário já preenchido; detalhe e lista com os valores novos |
| 5 | 1:10 | **Excluir ponto** → Cancelar → Excluir de novo e confirmar | Pede confirmação; o ponto some da lista |
| 6 | 1:25 | Tocar no ♡ de dois pontos → **♥ Meus pontos** | Favoritos buscados na API; desmarcar um ali mesmo |
| 7 | 1:45 | **Doar**: `Arroz`, `10`, escolher um ponto, registrar → **Ver minhas doações** | A doação no topo do histórico |
| 8 | 2:05 | Abrir a doação → **Editar doação**, quantidade `25`, salvar | Mesma data de registro, valores novos no detalhe e no histórico |
| 9 | 2:20 | **Excluir doação** e confirmar | Volta ao histórico sem ela |
| 10 | 2:30 | No Swagger: `POST /api/v1/doacoes` com `quantidade: 0` | **400** "a quantidade deve ser maior que zero" |
| 11 | 2:45 | No Swagger: `GET /api/v1/pontos/{id}` com um id inexistente | **404** "Ponto ... não encontrado" |

Extra, se sobrar tempo: desligar a API e puxar a lista. Aparece "Não foi possível carregar os
pontos", com "Tentar de novo", sem travar.

## Decisão técnica para explicar

**Por que os favoritos ficam no aparelho, e pontos e doações ficam no servidor.**

Pontos e doações são dados **compartilhados**. Um ponto cadastrado precisa aparecer para todo
mundo que usa o app, e uma doação registrada precisa ser vista por quem administra o banco de
alimentos. Se ficassem no AsyncStorage, cada celular teria a sua própria versão. Por isso eles
estão na API, num lugar só, com validação no servidor: um app desatualizado ou uma chamada pelo
Swagger não conseguem gravar quantidade zero.

Favorito é **preferência pessoal**: só interessa a quem marcou e não precisa de login nem de
servidor. Por isso fica no aparelho. Mas só o id fica guardado, não o ponto inteiro: a tela
"Meus pontos" busca cada um na API. Assim, se alguém edita o horário de um ponto, o favorito já
mostra o horário novo. E se o ponto é excluído, a API responde 404, ele sai da lista e o id é
limpo do AsyncStorage. Guardar a cópia inteira deixaria o favorito mostrando um dado velho ou
um ponto que não existe mais.

**Outra, se perguntarem:** por que só o `api.ts` chama `fetch`. A URL e o IP aparecem num lugar
só; trocar de rede é mudar uma linha. O tratamento de erro também é um só: toda falha vira um
`ApiError` com status, e as telas só decidem o que mostrar (404 → "não encontrado", 0 → "API
desligada").

Endereços e horários são dados fictícios de exercício acadêmico.
