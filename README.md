# CardNest — Front-end

Interface web do **CardNest**, plataforma que reúne dois jogos de cartas criados em Unity (**Hi-Lo** e **Blackjack**) e adiciona ranking, histórico de partidas, comunidade e suporte. Os jogos rodam direto no navegador via WebGL.

Projeto de conclusão do curso de Tecnologia em Sistemas para Internet (IFSul).

- **Aplicação online:** https://card-nest.vercel.app
- **API (Laravel):** https://github.com/derickbit/BlackJack2_Back

## Funcionalidades

- **Jogos no navegador:** Hi-Lo e Blackjack em Unity/WebGL embutidos nas páginas do site.
- **Conta de usuário:** cadastro, login, verificação de e-mail, recuperação e redefinição de senha, edição de perfil.
- **Ranking e histórico:** classificação entre jogadores e histórico das próprias partidas.
- **Comunidade:** fórum com tópicos, comentários, curtidas e menções.
- **Atualizações:** mural de novidades (patch notes) da plataforma.
- **Suporte:** envio de denúncias e acompanhamento da conversa.
- **Tema claro e escuro**, com interface responsiva.

## Stack

| Camada | Tecnologias |
|---|---|
| Interface | React, Vite, React Router |
| Estilo | Tailwind CSS, CSS Modules, styled-components, animações com Anime.js |
| Dados | Axios consumindo a API Laravel |
| Estado | Context API (autenticação, ranking, histórico, fórum, tema, denúncias) |
| Jogos | Unity (C#) exportado para WebGL |
| Deploy | Vercel |

## Estrutura

```
src/
├── Components/
│   ├── Pages/      # Telas: Home, Ranking, Histórico, Comunidade, Atualizações...
│   ├── Layout/     # Navbar, Footer, Toast, modais
│   ├── Form/       # Inputs, menções, botões
│   └── Cards/      # Cards de ranking, tópico e comentário
├── contexts/       # Providers de estado global
├── Config/         # Rota protegida por autenticação
└── utils/          # Cliente Axios e hooks auxiliares
public/             # Builds WebGL dos jogos
```

## Nota sobre os jogos

As builds WebGL do Hi-Lo e do Blackjack ficam em `public/`. O código-fonte Unity do Hi-Lo está em [`hilogame`](https://github.com/derickbit/hilogame); o do Blackjack não está disponível, apenas a build.

## Como rodar localmente

Pré-requisitos: Node.js 18+ e a [API](https://github.com/derickbit/BlackJack2_Back) rodando.

```bash
git clone https://github.com/derickbit/Blackjack_react.git
cd Blackjack_react
npm install
```

Crie um arquivo `.env.local` apontando para a API:

```
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

## Design

As decisões de padronização visual (paleta, gradientes, ajustes de cada página) estão em [`DESIGN_DOCUMENTATION.md`](DESIGN_DOCUMENTATION.md).

## Autor

**Dérick Bitencourte da Silva** · [GitHub](https://github.com/derickbit) · [LinkedIn](https://www.linkedin.com/in/derick-bitencourte-da-silva/)
