# Backend do Monevo

API REST construída com Node.js, Express, TypeScript, Prisma e PostgreSQL.

## Requisitos

- Node.js 20 ou superior.
- PostgreSQL 16 ou superior instalado e em execução.
- Um banco chamado `monevo` e um usuário PostgreSQL com acesso a ele.
- Dependências instaladas na raiz do repositório (`npm install`).

## Configurar ambiente

Na raiz do repositório, copie o exemplo:

```powershell
Copy-Item backend\.env.example backend\.env
```

Edite `backend/.env` e informe a URL do seu PostgreSQL e um segredo JWT próprio:

```dotenv
DATABASE_URL="postgresql://usuario:senha@localhost:5432/monevo?schema=public"
JWT_SECRET="substitua-por-uma-chave-aleatoria-com-pelo-menos-32-caracteres"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

Crie o banco antes de aplicar as migrações. Conectado ao PostgreSQL como administrador, execute:

```sql
CREATE DATABASE monevo;
```

Gere um segredo aleatório com Node.js:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Use o valor gerado em `JWT_SECRET`. Não compartilhe nem versione `backend/.env`. Se a senha do banco tiver caracteres especiais, codifique-os para URL na variável `DATABASE_URL`.

## Banco de dados e execução

Na raiz do projeto:

```powershell
npm run db:generate
npm run db:migrate
npm run dev --workspace backend
```

A API ficará disponível em `http://localhost:3000`; `GET /api/health` verifica se o servidor está respondendo. Para iniciar backend e frontend juntos, use `npm run dev` na raiz.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev --workspace backend` | Inicia a API com recarga automática |
| `npm run build --workspace backend` | Compila TypeScript para `backend/dist` |
| `npm run start --workspace backend` | Inicia a versão compilada |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Cria e aplica migrações em desenvolvimento |

## Endpoints principais

- `/api/auth`: cadastro, login, sessão e logout.
- `/api/profile`: consulta e edição do perfil, troca de senha e gerenciamento da foto.
- `/api/bills`: cadastro, edição, exclusão, filtros e registro de pagamento.
- `/api/dashboard`: resumo mensal e dados dos gráficos.

## Segurança e arquivos de perfil

As senhas são armazenadas com hash. A sessão usa JWT em cookie HttpOnly; as rotas de dados e de foto exigem autenticação e operam no escopo do usuário autenticado. A API aplica Helmet, CORS e limite de tentativas nas rotas sensíveis.

Fotos JPEG, PNG e WebP de até 5 MB são validadas e armazenadas em `backend/uploads/avatars`, fora da pasta pública. A rota de imagem exige autenticação. Essa pasta é ignorada pelo Git; inclua-a nos backups. Em produção com múltiplas instâncias, configure armazenamento de arquivos compartilhado.
