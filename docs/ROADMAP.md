# Roadmap inicial

As issues do GitHub são a unidade de trabalho para Codex. As fases abaixo definem a ordem e os resultados esperados; a implementação financeira ainda não começou.

## Issues iniciais

| Issue | Entrega | Prioridade |
|---|---|---|
| [#1](https://github.com/LuKingProgram/previsao-financeira-android/issues/1) | Identidade própria e onboarding | P0 |
| [#2](https://github.com/LuKingProgram/previsao-financeira-android/issues/2) | Domínio monetário e projeção | P0 |
| [#3](https://github.com/LuKingProgram/previsao-financeira-android/issues/3) | SQLCipher, chave e migrações | P0 |
| [#4](https://github.com/LuKingProgram/previsao-financeira-android/issues/4) | Onboarding e cadastro de movimentos | P1 |
| [#5](https://github.com/LuKingProgram/previsao-financeira-android/issues/5) | Visão geral e projeção diária/mensal | P1 |
| [#6](https://github.com/LuKingProgram/previsao-financeira-android/issues/6) | Recorrências e assinaturas | P1 |
| [#7](https://github.com/LuKingProgram/previsao-financeira-android/issues/7) | Cartões, parcelas e faturas | P1 |
| [#8](https://github.com/LuKingProgram/previsao-financeira-android/issues/8) | Economias e resultado mensal | P2 |
| [#9](https://github.com/LuKingProgram/previsao-financeira-android/issues/9) | Exportação e exclusão local | P2 |
| [#10](https://github.com/LuKingProgram/previsao-financeira-android/issues/10) | Qualidade contínua e build Android | P1 |

## Fase 0 — Base e decisões

- [x] Criar repositório privado e projeto Expo Android-first em TypeScript.
- [x] Registrar análise pública, PRD, mapa de telas, arquitetura, modelo de dados e regras financeiras.
- [ ] Definir identidade visual/nome definitivo e fluxo inicial.
- [ ] Decidir versão mínima Android, pacote definitivo e dados de teste sintéticos.

**Saída:** escopo estável e tela inicial aprovada antes de conectar os fluxos financeiros.

## Fase 1 — Domínio e armazenamento seguro

- [ ] Implementar tipos monetários, calendário local e motor de projeção sem dependência visual.
- [ ] Implementar banco SQLCipher com chave protegida, migrações e repositórios.
- [ ] Comprovar a criptografia no build Android e tratar falha sem fallback aberto.

**Saída:** domínio reprodutível, migração inicial segura e dados locais persistidos.

## Fase 2 — Lançamentos e previsão

- [ ] Implementar onboarding com saldo e data de referência.
- [ ] Implementar criação, edição, cancelamento e remoção de entradas e saídas.
- [ ] Implementar visão geral, projeção diária/mensal e explicação de valores.

**Saída:** usuário consegue consultar uma projeção útil com lançamentos simples.

## Fase 3 — Compromissos

- [ ] Implementar recorrências e assinaturas com exceções por ocorrência.
- [ ] Implementar cartão, compras parceladas e vencimentos sem dupla contagem.
- [ ] Implementar contas de economia e resultado mensal.

**Saída:** projeção contempla compromissos comuns e separa resultado de fluxo de caixa.

## Fase 4 — Privacidade e preparação de distribuição

- [ ] Implementar exportação, exclusão de dados e recuperação documentada.
- [ ] Revisar acessibilidade, estados de erro, migrações e comportamento offline.
- [ ] Confirmar nome, ícone, pacote, versão mínima, política de privacidade e declarações da Google Play.
- [ ] Preparar pipeline de qualidade e build Android de release.

**Saída:** candidato de MVP com dados protegidos, identidade própria e informações de loja alinhadas ao comportamento real.

## Critérios de passagem

- Não avançar para cartões antes de saldo e transferências terem cobertura de domínio.
- Não usar dados reais para validar até haver build com SQLCipher verificado.
- Não habilitar sync, analytics ou contas sem rever o PRD e os requisitos de consentimento.
- Não publicar com nome, pacote ou política de privacidade provisórios.
