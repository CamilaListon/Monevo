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

### Usar o PostgreSQL do Supabase

No painel do projeto Supabase, abra **Connect** e copie a URI de conexão PostgreSQL. Prefira a conexão direta quando sua rede aceitar IPv6; caso contrário, use o **Session pooler**. Substitua somente o valor de `DATABASE_URL` em `backend/.env` pela URI fornecida, mantendo os parâmetros que o Supabase incluir. Não substitua o restante do arquivo: o backend também exige `JWT_SECRET` e `FRONTEND_URL`. Use a senha do banco de dados do Supabase — ela é diferente da `SUPABASE_SECRET_KEY`.

Para esta configuração, o Monevo continua usando o login e a API atuais; não precisa configurar `SUPABASE_URL`, as chaves de API ou `@supabase/server`. Não envie credenciais pelo chat nem versione o arquivo `.env`.

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
| `npm run db:migrate:deploy` | Aplica migrações pendentes no banco configurado para produção |

## Endpoints principais

- `/api/auth`: cadastro, login, sessão e logout.
- `/api/profile`: consulta e edição do perfil, troca de senha e gerenciamento da foto.
- `/api/bills`: cadastro, edição, exclusão, filtros e registro de pagamento.
- `/api/dashboard`: resumo mensal e dados dos gráficos.

## Segurança e arquivos de perfil

As senhas são armazenadas com hash. A sessão usa JWT em cookie HttpOnly; as rotas de dados e de foto exigem autenticação e operam no escopo do usuário autenticado. A API aplica Helmet, CORS e limite de tentativas nas rotas sensíveis.

Fotos JPEG, PNG e WebP de até 4 MB são validadas e armazenadas como texto Base64 no PostgreSQL, junto com seu MIME type. A rota de imagem exige autenticação. Fotos que já estavam no formato antigo em disco são lidas localmente como compatibilidade; novos uploads não dependem do filesystem.

## Deploy na Vercel

Configure as variáveis do backend nas configurações do projeto Vercel, para cada ambiente necessário:

- `DATABASE_URL`: URI PostgreSQL do Supabase.
- `JWT_SECRET`: segredo aleatório com pelo menos 32 caracteres.
- `FRONTEND_URL`: origem pública da aplicação, por exemplo `https://monevo.vercel.app`.
- `NODE_ENV`: `production`.

Depois de atualizar `DATABASE_URL` para a conexão de produção, aplique as migrações pendentes a partir da raiz do repositório com `npm run db:migrate:deploy`. Não use `db:migrate` em produção.
