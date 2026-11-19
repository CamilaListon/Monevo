# Monevo

O Monevo é uma aplicação web responsiva para reunir contas pessoais, vencimentos e pagamentos em um só lugar. A ideia é facilitar a organização financeira do dia a dia, ajudar a lembrar das contas e dar uma visão clara dos gastos do mês.

## O que você pode fazer

- Criar uma conta pessoal e acessar seus dados com segurança.
- Cadastrar, editar, consultar e excluir contas.
- Acompanhar contas pagas, pendentes e atrasadas.
- Filtrar contas por período, categoria e situação.
- Visualizar totais mensais, gráficos por categoria e pagamentos recentes.
- Atualizar seu nome, foto de perfil e senha na página **Minha conta**.
- Alternar entre tema claro e escuro.

Cada usuário tem seu próprio espaço: as contas e a foto de perfil são acessíveis somente após a autenticação daquele usuário. Fotos aceitas: JPEG, PNG e WebP, com até 4 MB.

## Sobre esta versão

A interface funciona em navegadores de desktop e dispositivos móveis. Nesta versão, cada conta pode ser marcada como paga uma vez; pagamentos parciais e contas recorrentes ainda não estão incluídos.

## Tecnologias

- Frontend: React, TypeScript, Tailwind CSS e Vite.
- Backend: Node.js, Express, Prisma e PostgreSQL.

## Documentação técnica

- [Configuração do frontend](frontend/README.md)
- [Configuração do backend e banco de dados](backend/README.md)
