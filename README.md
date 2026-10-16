# 💻 ProgrammingRoom

> **Plataforma Web Colaborativa em Tempo Real para o Ensino e Monitoramento de Programação**  
> Trabalho de Conclusão de Curso (TCC) — Bacharelado em Ciência da Computação  
> **Universidade Estadual de Mato Grosso do Sul (UEMS)** — Dourados, MS (2026)

---

## 📌 Sobre o Projeto

O **ProgrammingRoom** é uma solução web desenvolvida para superar os desafios de escalabilidade e acompanhamento pedagógico síncrono em aulas práticas de programação. 

Em laboratórios tradicionais, o instrutor precisa se deslocar fisicamente máquina por máquina ou solicitar compartilhamentos de tela individuais para identificar erros sintáticos e lógicos. O ProgrammingRoom transforma essa dinâmica ao oferecer:

1. **Dashboard Centralizado para o Professor:** Visualização em tempo real de uma grade com os editores de todos os alunos conectados, acompanhada de um **semáforo de status** (ativo, inativo/ocioso, com erro de compilação ou desconectado).
2. **Execução Segura no Navegador (Client-Side):** Utilização de **WebAssembly via Pyodide** (para Python) e **Web Workers** (para JavaScript), garantindo que os algoritmos dos estudantes rodem de forma isolada e distribuída no próprio navegador, sem sobrecarregar o servidor nem expô-lo a códigos arbitrários.
3. **Colaboração e Pair Programming:** O professor pode expandir o cartão de qualquer aluno para realizar correções ao vivo em conjunto, visualizando o cursor remoto e sincronizando o código via WebSocket.
4. **Quadro Global (Lousa Virtual):** Espaço para demonstrações do professor, com transmissão instantânea do código de exemplo para todos os alunos em modo de visualização.
5. **Exportação de Sessões:** Download dos arquivos de código dos alunos de forma individual (`.py`/`.js`) ou empacotados em arquivo `.zip` da turma.

---

## 🚀 Tecnologias e Arquitetura

O projeto foi construído utilizando uma arquitetura orientada a serviços e conteinerizada:

- **Frontend:**
  - [React 19](https://react.dev) + [Vite](https://vitejs.dev)
  - [Tailwind CSS](https://tailwindcss.com) (Design system e padronização visual)
  - [CodeMirror 6](https://codemirror.net) (Editor de código leve com realce de sintaxe)
  - [Pyodide](https://pyodide.org) (Interpretador Python compilado para WebAssembly)
  - [Socket.io Client](https://socket.io) (Comunicação bidirecional de baixa latência)
  - [JSZip](https://stuk.github.io/jszip/) & [FileSaver](https://github.com/eligrey/FileSaver.js/) (Exportação em lote de arquivos)

- **Backend:**
  - [Node.js](https://nodejs.org) + [Express](https://expressjs.com)
  - [Socket.io](https://socket.io) (Sincronização em tempo real com debounce e recuperação de estado *in-memory*)
  - [Sequelize](https://sequelize.org) (ORM para persistência e integridade relacional)
  - [JSON Web Tokens (JWT)](https://jwt.io) & [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) (Autenticação e segurança)

- **Banco de Dados & Infraestrutura:**
  - [PostgreSQL 16](https://www.postgresql.org)
  - [pgAdmin 4](https://www.pgadmin.org) (Administração do banco de dados)
  - [Docker](https://www.docker.com) & [Docker Compose](https://docs.docker.com/compose/) (Orquestração completa de contêineres)

---

## 📦 Estrutura de Diretórios

```plaintext
ProgrammingRoom/
├── backend/               # API REST, modelos Sequelize e eventos Socket.io
│   ├── src/
│   │   ├── config/        # Conexão com o PostgreSQL
│   │   ├── controllers/   # Regras de negócio (Auth, Rooms)
│   │   ├── models/        # Modelos (User, Room, UserInRoom)
│   │   ├── routes/        # Rotas da API REST
│   │   └── sockets/       # Gerenciamento de eventos WebSocket em tempo real
│   └── Dockerfile
├── frontend/              # Interface do usuário (SPA React)
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis (CodeEditor, StudentCard)
│   │   ├── pages/         # Telas (Login, Register, Dashboard, Room, TeacherRoom)
│   │   └── services/      # Cliente Socket.io e chamadas à API
│   └── Dockerfile
├── docker-compose.yml     # Orquestrador dos serviços (db, pgadmin, backend, frontend)
├── LICENSE                # Licença MIT
└── README.md
```

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
- [Docker](https://www.docker.com/products/docker-desktop/) e [Docker Compose](https://docs.docker.com/compose/) instalados.
- (Opcional) [Node.js 20+](https://nodejs.org/) caso queira executar sem Docker.

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/ProgrammingRoom.git
cd ProgrammingRoom
```

### 2. Executar via Docker Compose (Recomendado)
Para subir toda a infraestrutura (Banco PostgreSQL, pgAdmin, Backend e Frontend) com um único comando:

```bash
docker compose up --build
```

Após a inicialização dos contêineres:
- **Aplicação Web (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API REST & WebSockets (Backend):** [http://localhost:3000](http://localhost:3000)
- **pgAdmin (Gerenciador do Banco):** [http://localhost:5050](http://localhost:5050)
  - *E-mail:* `admin@admin.com` | *Senha:* `admin`

---

## 🎓 Autoria e Contexto Acadêmico

- **Autor:** Caio Eduardo Gouveia Dias  
- **Orientador:** Me. André Chastel Lima  
- **Curso:** Bacharelado em Ciência da Computação  
- **Instituição:** Universidade Estadual de Mato Grosso do Sul (UEMS) — Dourados, MS  

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.
