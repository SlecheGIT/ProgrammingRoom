# ProgrammingRoom

Plataforma web colaborativa em tempo real para o ensino e monitoramento de programação.  
*Trabalho de Conclusão de Curso (TCC) — Bacharelado em Ciência da Computação (UEMS)*

---

## 🚀 Funcionalidades

- **Dashboard do Professor:** Visualização em tempo real dos editores de todos os alunos conectados com semáforo de status (ativo, ocioso, erro).
- **Execução Client-Side:** Execução isolada de Python via WebAssembly (Pyodide) e JavaScript via Web Workers diretamente no navegador do aluno.
- **Pair Programming:** O professor pode expandir o código de qualquer aluno para realizar correções ao vivo com cursor compartilhado.
- **Quadro Global:** Transmissão instantânea do código de exemplo do professor para a tela de toda a turma.
- **Exportação:** Download dos exercícios dos alunos individualmente ou empacotados em arquivo `.zip`.

---

## 🛠️ Tecnologias

- **Frontend:** React, Vite, Tailwind CSS, CodeMirror 6, Pyodide (WebAssembly), Socket.io Client
- **Backend:** Node.js, Express, Socket.io, Sequelize, JWT
- **Infraestrutura:** PostgreSQL 16, Docker, Docker Compose

---

## ⚡ Como Executar

Com o **Docker** instalado, basta executar na raiz do projeto:

```bash
docker compose up --build
```

Acesse no navegador:
- **Aplicação (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API (Backend):** [http://localhost:3000](http://localhost:3000)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050) *(admin@admin.com / admin)*

---

## 👨‍💻 Autor

- **Autor:** Caio Eduardo Gouveia Dias  
- **Orientador:** Me. André Chastel Lima  
- **Instituição:** Universidade Estadual de Mato Grosso do Sul (UEMS)  
- **Licença:** [MIT](LICENSE)
