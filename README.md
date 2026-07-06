# CaloCount Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react\&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite\&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript\&logoColor=fff)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-styling-06B6D4?logo=tailwindcss\&logoColor=fff)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

Frontend do **CaloCount**, uma aplicação web para acompanhamento alimentar, registro de refeições e visualização de consumo calórico. A interface foi desenvolvida com React, Vite e TailwindCSS, consumindo a API do CaloCount Backend.

## Visão geral

O CaloCount Frontend oferece uma interface para que o usuário possa acessar sua conta, registrar refeições, acompanhar dados nutricionais e visualizar informações do perfil. O projeto foi estruturado com páginas separadas, componentes reutilizáveis e integração com API por meio de uma camada de serviços.

## Funcionalidades

* Login e autenticação de usuários.
* Dashboard com visão geral do consumo alimentar.
* Registro e listagem de refeições.
* Perfil do usuário.
* Integração com API backend.
* Gerenciamento de estado e requisições com React Query.
* Interface responsiva.
* Componentização da interface.
* Preparado para evolução com análise de alimentos por imagem.

## Tecnologias

* **React**
* **Vite**
* **TypeScript**
* **TailwindCSS**
* **TanStack React Query**
* **Axios**
* **React Router DOM**
* **Lucide React**
* **ESLint**

## Estrutura do projeto

```txt id="v1u7zf"
src/
├── assets/        # Imagens e recursos estáticos
├── components/    # Componentes reutilizáveis
├── lib/           # Cliente HTTP, configurações e utilitários
├── pages/         # Páginas principais da aplicação
├── App.tsx        # Rotas e estrutura principal
├── main.tsx       # Ponto de entrada da aplicação
└── index.css      # Estilos globais
```

## Páginas principais

* **Login**: autenticação do usuário.
* **Dashboard**: visão geral dos dados alimentares.
* **Refeições**: registro e acompanhamento das refeições.
* **Perfil**: informações e configurações do usuário.

## Como executar localmente

### Pré-requisitos

* Node.js 20+
* npm
* CaloCount Backend em execução

### Passo a passo

```bash id="m0gd95"
git clone https://github.com/NasserCaixeta/Calocount-Frontend.git
cd Calocount-Frontend
npm install
npm run dev
```

A aplicação será iniciada localmente pelo Vite.

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com a URL da API:

```env id="eyoj5x"
VITE_API_URL=http://localhost:8000
```

> Ajuste a variável de acordo com o nome usado no cliente HTTP do projeto.

## Scripts disponíveis

```bash id="xj3xj2"
npm run dev       # Inicia o ambiente de desenvolvimento
npm run build     # Gera a build de produção
npm run preview   # Visualiza a build localmente
npm run lint      # Executa verificação de lint
```

## Backend relacionado

* [Calocount-Backend](https://github.com/NasserCaixeta/Calocount-Backend)

## Possíveis casos de uso

* Controle de calorias diárias.
* Organização de refeições.
* Acompanhamento de hábitos alimentares.
* Registro de histórico nutricional.
* Base para aplicação com análise de alimentos por imagem.

## Próximas melhorias sugeridas

* Adicionar prints reais das telas.
* Documentar fluxo completo de login e registro de refeições.
* Melhorar feedback visual de carregamento e erro.
* Criar testes de componentes e páginas.
* Adicionar página de onboarding do usuário.
* Integrar análise de imagem de alimentos, caso disponível no backend.
* Melhorar SEO e metadados da aplicação.

## Deploy

Para gerar a versão de produção:

```bash id="ajh7kh"
npm run build
```

Depois, publique a pasta `dist` em uma plataforma como:

* Vercel
* Netlify
* Cloudflare Pages
* Render Static Site

## Autor

Desenvolvido por [Nasser Caixeta](https://github.com/NasserCaixeta).
