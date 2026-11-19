# Frontend do Monevo

Interface web responsiva construída com React, TypeScript, Tailwind CSS e Vite.

## Funcionalidades

- Home, Login e Cadastro.
- Dashboard com totais do mês, gráficos, contas e pagamentos recentes.
- Filtros de período, categoria e situação.
- Página **Minha conta** para atualizar nome, foto e senha.
- Tema claro/escuro, com preferência salva no navegador.
- Layout adaptado para desktop e dispositivos móveis.

## Requisitos

- Node.js 20 ou superior.
- Dependências instaladas na raiz do repositório (`npm install`).
- Backend do Monevo em execução para autenticação e operações com dados. Consulte [backend/README.md](../backend/README.md).

## Executar

Na raiz do repositório:

```powershell
npm install
npm run dev --workspace frontend
```

O Vite inicia em `http://localhost:5173`. Para iniciar frontend e API ao mesmo tempo, use `npm run dev` na raiz.

## Configuração da API

Por padrão, o frontend usa `http://localhost:3000/api`. Para usar outra URL, crie `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Após alterar variáveis `VITE_*`, reinicie o servidor do Vite. A API precisa permitir credenciais e configurar `FRONTEND_URL` com a origem do frontend.

## Build

```powershell
npm run build --workspace frontend
npm run preview --workspace frontend
```

O build de produção é gerado em `frontend/dist`.
