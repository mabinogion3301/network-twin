# Network Twin — Etapa 0/1 (Setup + Schema + Autenticação)

## O que já está implementado nesta etapa

- Estrutura do monorepo (`backend/`, `frontend/`).
- `docker-compose.yml` com PostgreSQL pronto para uso local.
- Schema Prisma completo (Station, Equipment, Port, Connection, StationLink,
  User, Role, AuditLog, FailureSimulation) — ver `backend/prisma/schema.prisma`.
- Seed inicial: roles "Administrador" e "Operador", usuário admin, tipos de
  equipamento padrão.
- Autenticação JWT (access + refresh token) com RBAC por permissões
  granulares (`stations.create`, `simulations.run`, etc.), guards reutilizáveis
  (`JwtAuthGuard`, `PermissionsGuard`) e decorator `@Permissions(...)`.
- Módulos de Users e Roles com CRUD protegido por permissão.

> Observação importante: a tabela `StationLink` foi adicionada ao schema para
> representar exatamente o que você descreveu — a conexão **direta entre
> Estação A e Estação B**, usada como base do cálculo de disponibilidade
> (independente do caminho físico real via equipamentos/portas).

## Como rodar localmente (forma rápida — script automático)

Pré-requisitos: **Docker Desktop** instalado e aberto, e **Node.js 18+** instalado.

- **Windows**: dê duplo-clique em `setup.bat` (ou rode no terminal: `setup.bat`)
- **Linux/Mac**: no terminal, dentro da pasta `network-twin`: `./setup.sh`

O script faz tudo: sobe o Postgres, instala dependências, cria o `.env`,
roda as migrations, popula os dados iniciais e inicia a API.

> Por que não vem com `node_modules` já pronto? O Prisma e algumas
> dependências usam binários nativos compilados especificamente para cada
> sistema operacional (Windows/Mac/Linux). Um `node_modules` gerado no meu
> ambiente não funcionaria no seu computador — por isso o `npm install`
> precisa rodar na sua máquina. O script acima automatiza isso para você,
> então você só precisa ter Docker e Node.js instalados e rodar um comando.

## Como rodar localmente (passo a passo manual)

```bash
# 1. Subir o Postgres
docker compose up -d

# 2. Instalar dependências do backend
cd backend
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Rodar a primeira migration (cria as tabelas)
npm run prisma:migrate -- --name init

# 5. Popular dados iniciais (admin + tipos de equipamento)
npm run prisma:seed

# 6. Iniciar a API
npm run start:dev
```

A API sobe em `http://localhost:3000/api`.

### Login de teste

```
POST /api/auth/login
{
  "email": "admin@telebras.local",
  "password": "admin123"
}
```

Retorna `accessToken` e `refreshToken`. Use o `accessToken` no header
`Authorization: Bearer <token>` para acessar rotas protegidas (`/api/users`,
`/api/roles`).

## Próxima etapa (Etapa 2)

CRUDs de Stations → Equipments → Ports → Connections → StationLink, seguindo
o mesmo padrão de módulo (controller + service + dto) já estabelecido em
Users/Roles, com o `AuditLogInterceptor` plugado a partir desta etapa.

---

## Etapa 2 — CRUDs e Auditoria (concluída)

Módulos novos, todos protegidos por JWT + permissão e com auditoria automática:

| Recurso | Rota base | Observações |
|---|---|---|
| Estações | `/api/stations` | filtros: city, state, status, search |
| Tipos de equipamento | `/api/equipment-types` | |
| Fabricantes | `/api/manufacturers` | |
| Modelos | `/api/models` | |
| Equipamentos | `/api/equipments` | informar `portCount` no create já gera as portas automaticamente |
| Portas | `/api/ports` | bloqueia número de porta duplicado no mesmo equipamento |
| Conexões | `/api/connections` | bloqueia conectar uma porta nela mesma e bloqueia porta já em uso |
| **Vínculo direto entre estações** | `/api/station-links` | é o `StationLink` (Estação A ⟷ Estação B) que vai alimentar o cálculo de disponibilidade na Etapa 4 |
| Histórico de alterações | `/api/audit-log` | filtros: `entityType`, `entityId` |

Todas as rotas de escrita (POST/PATCH/DELETE) desses módulos já gravam
automaticamente em `AuditLog` quem fez o quê e quando, via
`AuditLogInterceptor` (não precisa fazer nada extra nos services).

Depois de subir a API (`setup.bat`/`setup.sh` ou manual), rode as migrations
de novo para criar as tabelas novas:

```bash
cd backend
npx prisma migrate dev --name etapa2_crud
```

### Próxima etapa (Etapa 3)

Endpoint de topologia (`GET /api/topology`) formatando nós/arestas para o
Cytoscape.js, e a tela de mapa no frontend com filtros e drag.

---

## Etapa 3 — Mapa de Topologia (concluída)

### Backend

- `GET /api/topology` — retorna `{ nodes, edges }` já formatados para o
  Cytoscape.js. Filtros via query string: `city`, `stationId`, `typeId`, `status`.
- `GET /api/topology/filters` — retorna listas de cidades/estações/tipos para
  popular os selects do frontend.

### Frontend (novo!)

Projeto React + Vite + TypeScript em `frontend/`, com:
- Tela de login (`/login`) consumindo `/api/auth/login`, com refresh automático
  de token em caso de 401 (`services/api/client.ts`).
- Tela de mapa (`/topology`) com Cytoscape.js: nós coloridos por status do
  equipamento, arestas coloridas por status da conexão (verde/vermelho/
  amarelo/cinza), arestas tracejadas para links backup.
- Filtros por cidade, estação, tipo de equipamento e status.
- Painel de detalhes lateral: clique em um nó ou aresta para ver os dados.

### Como rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

Abre em `http://localhost:5173`. O Vite já está configurado para fazer proxy
de `/api` para `http://localhost:3000` (backend), então não precisa configurar
CORS extra nem mudar URLs.

> Pré-requisito: o backend (Etapas 0-2) precisa estar rodando antes, e deve
> existir ao menos uma Estação + Equipamento cadastrados para o mapa mostrar
> algo (pode cadastrar via `curl`/Postman nas rotas `/api/stations` e
> `/api/equipments` enquanto não temos as telas de CRUD no frontend — isso
> vem na Etapa 6, junto com os formulários de cadastro).

### Próxima etapa (Etapa 4)

Motor de simulação de falhas: `GraphService` (BFS/DFS em memória), endpoint
`POST /api/simulations`, e o cálculo de pares de estações indisponíveis via
`StationLink`, conforme definido na arquitetura.

---

## Etapa 4 — Motor de Simulação de Falhas (concluída)

### `GraphService` (`backend/src/modules/graph/graph.service.ts`)

Serviço **puro**, sem dependência de Prisma (só recebe arrays já carregados),
o que permite testá-lo isoladamente e trocá-lo de motor no futuro sem
reescrever o resto do sistema, conforme previsto na arquitetura.

Algoritmo: BFS para calcular componentes conectados antes/depois de remover
a(s) conexão(ões)/equipamento(s) informados. A disponibilidade é avaliada
**por par de estações com `StationLink` cadastrado** — se ainda existir
qualquer caminho entre os equipamentos das duas estações, o par continua
disponível (mesmo que a conexão específica tenha caído).

4 testes unitários cobrindo: falha sem redundância, falha COM redundância
(não deve reportar impacto), topologia em cadeia (A-B-C) e isolamento de
equipamento por queda total. Para rodar:

```bash
cd backend
npx jest
```

### Endpoint

```
POST /api/simulations
{
  "connectionIds": ["FO-001"],   // aceita nome OU id da conexão
  "equipmentIds": []              // opcional: equipamentos que caíram totalmente
}
```

Resposta inclui: `unavailableStationPairs` (pares de estação sem comunicação),
`isolatedEquipment`, `impactedConnections`, e persiste tudo em
`FailureSimulation` para histórico (`GET /api/simulations`).

### Teste rápido (continuando o exemplo de Estação A/B que você já cadastrou)

```cmd
curl -X POST http://localhost:3000/api/simulations -H "Content-Type: application/json" -H "Authorization: Bearer %TOKEN%" -d "{\"connectionIds\":[\"FO-001\"]}"
```

Como nesse exemplo não há rota redundante entre as duas estações, o resultado
deve mostrar o par Estação A/B em `unavailableStationPairs`.

### Próxima etapa (Etapa 5)

WebSocket gateway para refletir o resultado da simulação em tempo real no
mapa de todos os usuários conectados (sem precisar dar refresh).

---

## Etapa 5 — Tempo Real (concluída)

### Backend

`EventsGateway` (Socket.IO, namespace `/events`) — sempre que `POST /api/simulations`
é executado, o resultado é transmitido via `broadcastSimulationResult` para
**todos** os clientes conectados (evento `simulation:result`), não só quem
disparou a simulação.

### Frontend

- `useWebSocket` — conecta automaticamente ao abrir a tela de topologia.
- **Painel de Impactos** (lateral direita) — mostra em tempo real: pares de
  estações sem comunicação, equipamentos isolados, conexões impactadas.
- **Painel de Eventos** (barra de simulação, no topo do mapa) — campo para
  digitar o nome de uma conexão (ex: `FO-001`) e botão "Romper", que já
  dispara a simulação direto da interface, sem precisar de `curl`.
- O mapa (`NetworkGraph`) já destaca visualmente: bordas vermelhas pulsantes
  em equipamentos isolados, arestas tracejadas vermelhas em conexões
  impactadas.

### Como testar

1. Suba backend e frontend normalmente.
2. Abra `http://localhost:5173/topology` em **duas abas/janelas** (ou dois
   navegadores) — ambas logadas.
3. Em uma aba, digite o nome de uma conexão existente (ex: `FO-001`) na barra
   de simulação e clique "Romper".
4. A outra aba deve atualizar o Painel de Impactos e o mapa **sozinha**,
   sem refresh — prova de que o WebSocket está funcionando para todos os
   usuários conectados.

### Próxima etapa (Etapa 6)

Dashboard com KPIs, busca global, e telas de CRUD no frontend (Stations,
Equipments, Ports, Connections) para parar de depender de `curl`/Postman
para cadastrar dados.

---

## Etapa 6 — Dashboard, Busca Global e Telas de Cadastro (concluída — plano original completo)

### Backend

- `GET /api/dashboard/overview` — contagem de estações/equipamentos/conexões,
  quantos estão offline, e as 5 últimas simulações executadas.
- `GET /api/search?q=termo` — busca global por nome de estação, nome/IP de
  equipamento, nome de conexão e nome/número de porta (mínimo 2 caracteres).

### Frontend — agora com interface completa, sem precisar de `curl`

- **Layout** (`AppShell` + `Sidebar` + `Topbar`) — menu lateral com Dashboard,
  Mapa, Estações, Equipamentos, Conexões e botão de logout.
- **Busca global** na barra superior — digite e veja resultados de qualquer
  entidade em tempo real (debounce de 300ms).
- **Dashboard** (`/dashboard`) — KPIs coloridos + lista das últimas simulações.
- **Tela de Estações** (`/stations`) — CRUD completo com modal de
  criar/editar/excluir.
- **Tela de Equipamentos** (`/equipments`) — CRUD completo; ao criar, ainda é
  possível informar a quantidade de portas para criação automática.
- **Tela de Conexões** (`/connections`) — formulário em cascata (escolhe o
  equipamento de origem → carrega as portas dele → escolhe o equipamento de
  destino → carrega as portas dele), exatamente o fluxo que você fazia via
  `curl` manualmente.

> Cadastro de Portas isoladas e de `StationLink` continuam só via API por
> enquanto (uso mais raro/avançado) — pode pedir telas para eles depois, se
> sentir necessidade no dia a dia.

### Como rodar agora (resumo de tudo)

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name etapa6
npm run start:dev
```

```bash
# Frontend (outro terminal)
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`, faça login, e use o menu lateral — não
precisa mais de `curl`/Postman para o uso normal do sistema.

---

## Status do plano original

Todas as 8 etapas definidas na arquitetura inicial foram implementadas:
setup, fundação de dados + auth, CRUDs + auditoria, topologia/mapa, motor de
simulação, tempo real (WebSocket), e dashboard/busca/telas de cadastro.

Itens que ficaram como possível evolução futura (não bloqueiam o uso atual):
- Testes E2E automatizados dos fluxos de simulação (hoje só há testes
  unitários do `GraphService`)
- Telas de cadastro para Portas isoladas, `StationLink`, Usuários e Roles
  (hoje só via API)
- Refinamento visual adicional (tema, responsividade mobile)

---

## Extra 1 — Estação como "torre de telecom" no Mapa da Rede

No mapa lógico (`/topology`), a Estação agora aparece como um **nó composto**
(ícone de torre, desenhado em SVG puro — sem imagem externa), e os
equipamentos dela ficam visualmente agrupados **dentro** do retângulo da
estação (recurso nativo do Cytoscape chamado "compound node"). A cor da
borda da torre reflete o status da estação (verde=online, vermelho=offline).

## Extra 2 — Mapa Geográfico do Brasil

Nova tela `/geo-map` (menu "Mapa do Brasil"), usando **Leaflet** (mesma
biblioteca do seu projeto anterior "Telebras Network Map"):
- Mostra cada Estação como marcador de torre de telecom, posicionado pela
  **Latitude/Longitude reais** cadastradas nela.
- Desenha uma linha entre duas estações sempre que existir uma Conexão física
  ligando equipamentos delas — colorida pelo status (verde/vermelho/amarelo),
  tracejada se for link backup.
- Avisa no topo da tela quais estações ainda não têm coordenadas cadastradas
  (e por isso não aparecem no mapa).

### Como cadastrar as coordenadas

Na tela "Estações" (`/stations`), ao criar/editar, agora tem os campos
**Latitude** e **Longitude** (opcionais). Pegue as coordenadas de qualquer
endereço no Google Maps: clique direito no local → "O que há aqui?" → copia
os dois números (ex: `-15.7942, -47.8822` para Brasília).

> Endpoint novo no backend: `GET /api/topology/geo` — retorna estações com
> coordenadas + apenas as conexões que ligam uma estação a OUTRA (conexões
> internas de uma mesma estação não aparecem nesse mapa, só no mapa lógico).

## Extra 3 — Arrastar e organizar estações no Mapa da Rede

Agora você pode **arrastar qualquer estação** no mapa lógico (`/topology`)
para reorganizar o layout. Ao soltar, a posição (x, y) é salva automaticamente
no backend (`Station.mapPositionX/Y`) — então, da próxima vez que abrir o
mapa (ou outro usuário abrir), a estação aparece exatamente onde você deixou.

Estações que ainda não foram arrastadas continuam sendo posicionadas
automaticamente pelo algoritmo de layout (fcose), sem interferir nas que
você já organizou manualmente (usa o recurso `fixedNodeConstraint` do
fcose para "fixar" as estações já posicionadas enquanto organiza o resto).

> ⚠️ Esta é a única mudança desta entrega que **altera o schema do banco**
> (novos campos `mapPositionX`/`mapPositionY` em Station). É necessário
> rodar a migration:
> ```bash
> cd backend
> npx prisma migrate dev --name add_station_map_position
> ```
