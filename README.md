# Previsão Financeira para Android

Projeto independente para organizar entradas, saídas e saldo futuro com uma rotina simples. O nome e a identidade visual ainda são provisórios.

Este repositório foi criado a partir de funcionalidades anunciadas publicamente por aplicativos de previsibilidade financeira: lançamentos rápidos, projeção de saldo por dia e mês, cartões, recorrências, economias e resultados mensais. A implementação, a marca, o conteúdo e o código deste projeto são próprios. Não reutilizamos código, imagens, textos, telas ou materiais privados de terceiros.

## Situação atual

- Repositório privado: [LuKingProgram/previsao-financeira-android](https://github.com/LuKingProgram/previsao-financeira-android)
- Plataforma do produto: Android
- Base técnica: Expo SDK 58, React Native, TypeScript e Expo Router
- Persistência prevista: SQLite local com SQLCipher
- Escopo implementado: somente a estrutura inicial e uma tela de apresentação; as funções financeiras ainda estão planejadas

## Começar

Requisitos: Node.js compatível com o Expo SDK 58, pnpm e ambiente Android para desenvolvimento local (Android Studio/SDK e emulador ou dispositivo).

~~~bash
pnpm install
pnpm android
~~~

O projeto está preparado para SQLCipher. Para desenvolver as funções que leem ou salvam dados, use um development build Android; o Expo Go não inclui SQLCipher. A configuração do plugin não significa que a camada de dados, o armazenamento da chave ou a verificação de criptografia já estejam implementados. Não use dados financeiros reais nesta tela inicial.

## Documentação

- [PRD](docs/PRD.md): público, objetivos, escopo e critérios de aceite.
- [Telas](docs/TELAS.md): mapa de navegação e estados planejados.
- [Arquitetura](docs/ARQUITETURA.md): limites entre apresentação, domínio e persistência.
- [Banco de dados](docs/BANCO_DE_DADOS.md): entidades e estratégia local.
- [Regras financeiras](docs/REGRAS_FINANCEIRAS.md): projeções, recorrências, cartão e arredondamento.
- [Roadmap](docs/ROADMAP.md): etapas de implementação.
- [AGENTS.md](AGENTS.md): instruções para Codex e demais agentes.

## Backlog no GitHub

As issues iniciais estão organizadas no milestone [**MVP — base de planejamento**](https://github.com/LuKingProgram/previsao-financeira-android/milestone/1) e usam labels por prioridade, área, tipo e codex-ready. Cada issue deve ser trabalhada com os documentos deste repositório como fonte de escopo.

## Princípios do produto

- O app deve funcionar sem vínculo com escola, comunidade ou serviço de terceiros.
- O usuário registra somente o necessário; categorias são opcionais e não impõem limites rígidos.
- A tela principal explica o que pode acontecer com o saldo antes de cada decisão.
- Valores são calculados em centavos inteiros. Transferências internas não viram renda ou despesa.
- Dados financeiros ficam no dispositivo por padrão. Sincronização em nuvem não faz parte do MVP.
- O app organiza informações e cenários; não oferece consultoria, recomendação de investimento ou garantia de resultado.

## Referência de escopo

A descrição pública do [App do Breno no Google Play](https://play.google.com/store/apps/details?id=com.escoladobreno.app) e os [termos públicos do aplicativo](https://planilhadobreno.com.br/termos-de-uso-app/) foram consultados para identificar categorias de funcionalidade. A referência permanece independente: este projeto não representa, não se associa e não se apresenta como produto da Escola do Breno.
