# Instruções para Codex

Leia estes documentos antes de implementar uma issue:

1. docs/PRD.md
2. docs/ARQUITETURA.md
3. docs/REGRAS_FINANCEIRAS.md
4. docs/BANCO_DE_DADOS.md
5. docs/TELAS.md, quando a issue envolver interface

## Escopo e identidade

- Trate o produto como um aplicativo independente, Android-first e de uso geral.
- Use a referência pública apenas para entender categorias de funcionalidade. Não copie código, marca, textos, ícones, capturas, layout identificável, conteúdo de curso, API privada ou dados de usuários.
- Não implemente bloqueio por matrícula ou associação com a Escola do Breno.
- Não apresente cálculos como consultoria financeira ou recomendação de investimento.
- Mantenha o idioma inicial em português do Brasil, com texto acessível e direto.

## Código e domínio

- Siga a separação descrita em docs/ARQUITETURA.md: rotas e componentes não calculam saldos; regras financeiras ficam em módulos de domínio sem dependência de React Native.
- Armazene e calcule dinheiro como centavos inteiros em BRL. Não use ponto flutuante para persistência ou aritmética financeira.
- Use datas financeiras como datas locais sem horário. Não converta uma data de calendário para UTC de forma que ela mude de dia.
- Mantenha lançamentos agendados, realizados e cancelados explícitos. Uma projeção deve ser reproduzível a partir dos dados e das regras documentadas.
- Transferências entre contas próprias não são renda nem despesa.
- Não conte a compra do cartão e o pagamento da fatura como duas despesas.

## Dados e segurança

- O armazenamento padrão é local e offline-first. Não adicione analytics, sincronização ou envio de dados financeiros sem uma decisão de produto documentada.
- A configuração SQLite deve usar SQLCipher. Nunca faça fallback silencioso para banco sem criptografia.
- Antes de considerar a camada de dados pronta, confirme em runtime que PRAGMA cipher_version retorna uma versão e que a chave do banco é criada e recuperada com segurança.
- Nunca registre valores, descrições, saldos, nomes de contas, tokens ou chaves em logs.
- Não adicione segredos, arquivos .env locais, keystores ou dados reais ao Git.

## Fluxo de trabalho

- Trabalhe no escopo de uma issue por alteração e mantenha os critérios de aceite verificáveis.
- Preserve as versões Expo compatíveis com o SDK 58. Use o comando pnpm expo install <pacote> para bibliotecas Expo.
- Atualize pnpm-lock.yaml junto com mudanças em dependências.
- Não gere diretórios nativos para commit sem uma decisão explícita no roadmap; o projeto usa Continuous Native Generation.
- Se uma regra financeira ou de privacidade não estiver definida, registre a lacuna na issue e nos documentos antes de escolher um comportamento de produto.
