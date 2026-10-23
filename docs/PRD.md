# PRD — Previsão Financeira para Android

**Status:** planejamento inicial
**Nome de trabalho:** Previsão Financeira
**Plataforma inicial:** Android
**Público:** pessoas que querem organizar as próprias finanças

## 1. Resumo

O aplicativo ajuda a pessoa a responder “quanto posso gastar e o que vai acontecer com meu saldo?” usando lançamentos simples e uma projeção diária e mensal. O produto privilegia clareza e baixa fricção, sem exigir que toda despesa seja classificada em uma categoria ou submetida a um limite de orçamento.

O nome, o pacote Android e a identidade visual usados nesta primeira estrutura são provisórios. O produto não é afiliado à Escola do Breno nem depende de matrícula, curso ou comunidade.

## 2. Análise pública da referência

A página pública do [App do Breno no Google Play](https://play.google.com/store/apps/details?id=com.escoladobreno.app) afirma que o app permite:

- registrar entradas e saídas rapidamente;
- ver o saldo futuro dia a dia e mês a mês;
- acompanhar cartões, assinaturas, economias e resultados mensais;
- entender o impacto de decisões antes que aconteçam.

A página informa que o acesso ao produto de referência é exclusivo a alunos com matrícula ativa. Os termos públicos descrevem a ferramenta como apoio informativo e organizacional, sem constituir consultoria financeira ou recomendação de investimento: [termos de uso](https://planilhadobreno.com.br/termos-de-uso-app/).

Esta análise registra apenas capacidades anunciadas publicamente. Não houve acesso a uma conta de aluno, inspeção de telas privadas, tráfego de rede, API, conteúdo do curso, planilha ou código. O novo produto implementará fluxos, regras, textos e identidade próprios.

## 3. Problema e oportunidade

Anotar o que já aconteceu ajuda a fechar o mês, mas não responde se uma decisão de hoje compromete o dinheiro necessário amanhã. Planilhas extensas e categorias obrigatórias também podem tornar a manutenção cansativa.

O app deve tornar o futuro do saldo visível com poucos dados e permitir experimentar cenários sem alterar os lançamentos reais.

## 4. Público e necessidades

### Público principal

- Pessoas no Brasil que recebem renda em datas previsíveis ou variáveis.
- Pessoas que precisam acompanhar contas, cartão e compromissos recorrentes.
- Pessoas que querem começar uma reserva ou acompanhar o saldo entre contas.

### Necessidades

- registrar um movimento em poucos campos;
- diferenciar o que já aconteceu do que é esperado;
- descobrir a data e o tamanho de um possível saldo negativo;
- corrigir uma previsão sem perder o histórico de um lançamento realizado;
- usar o app sem conexão constante e sem entregar dados financeiros a terceiros.

## 5. Objetivos e indicadores

### Objetivos do MVP

1. Registrar movimentos e consultar o saldo projetado sem depender de planilha ou conexão.
2. Mostrar o efeito de recorrências e faturas de cartão sem contar valores duas vezes.
3. Permitir que a pessoa mantenha uma rotina simples; categorias são opcionais.
4. Manter os dados financeiros privados no dispositivo por padrão.

### Indicadores de produto a definir antes de adicionar telemetria

- tempo mediano para criar um lançamento comum;
- percentual de usuários que concluem a configuração inicial;
- uso da projeção futura e da revisão mensal;
- taxa de correção ou cancelamento de previsões.

Não coletar esses indicadores com analytics no MVP. Se telemetria vier a ser proposta, documentar finalidade, dados, retenção, consentimento e alternativa sem coleta antes da implementação.

## 6. Escopo do MVP

### Incluído

- configuração de saldo inicial e data de referência;
- contas próprias com saldo atual;
- cadastro, edição e remoção de entradas e saídas, com título, valor, data e estado realizado ou previsto;
- categorias opcionais;
- projeção do saldo por dia e por mês, com identificação de compromissos futuros;
- recorrências mensais ou semanais simples;
- cartões, compras parceladas e previsão de pagamento de fatura;
- assinaturas tratadas como recorrências de despesas;
- contas ou objetivos de economia, sem tratá-los como investimento;
- resumo mensal de receitas, despesas e variação;
- operação local e offline;
- exclusão dos dados locais e exportação manual em formato documentado antes de qualquer sincronização.

### Fora do MVP

- leitura de contas bancárias ou Open Finance;
- sincronização entre dispositivos, conta de usuário ou backend;
- importação automática de extrato;
- pagamentos, transferências bancárias ou processamento de cartão;
- recomendação de investimento, crédito, imposto ou aconselhamento financeiro;
- metas de orçamento obrigatórias por categoria;
- comunidade, conteúdo educativo pago ou bloqueio por matrícula;
- publicação em loja, assinatura ou monetização.

## 7. Requisitos funcionais

### RF-01 — Configuração inicial

A pessoa informa saldo inicial, data daquele saldo e nome opcional de uma conta. O app explica que a data de referência determina quais movimentos entram na projeção. Deve existir pelo menos uma conta de caixa para usar a projeção.

**Aceite**

- O saldo inicial pode ser zero, positivo ou negativo.
- A data inicial é apresentada como data local, sem horário.
- Nenhuma conta é criada a partir de informação externa.
- A pessoa pode editar a configuração sem apagar os movimentos já registrados.

### RF-02 — Lançamentos rápidos

Criar entrada ou saída com valor, título e data; categoria, conta e observação são opcionais. A pessoa escolhe se o movimento já ocorreu ou está previsto.

**Aceite**

- Valor inválido, vazio ou acima do limite documentado não é salvo.
- O app diferencia realizado, previsto e cancelado.
- Editar uma previsão recalcula o saldo futuro.
- Remover um movimento exige confirmação na interface e oferece desfazer enquanto a ação estiver disponível.

### RF-03 — Projeção

Mostrar saldo em contas e saldo previsto em uma linha do tempo diária e em resumo mensal. Permitir abrir o dia e ver os movimentos que explicam cada variação.

**Aceite**

- Cada valor exibido pode ser explicado por saldo inicial e movimentos considerados.
- A primeira data negativa é destacada quando existir.
- Uma mudança de cenário não altera movimentos reais até ser confirmada como lançamento.
- Contas ocultas ou inativas não são somadas silenciosamente.

### RF-04 — Recorrências e assinaturas

Criar regra com periodicidade, próxima data e término opcional. Uma ocorrência prevista pode ser confirmada, ignorada ou ajustada sem duplicar as seguintes.

**Aceite**

- Ocorrências calculadas são determinísticas e não são salvas como movimentos confirmados sem ação da pessoa.
- A pessoa pode editar apenas uma ocorrência ou toda a regra futura.
- Uma recorrência removida deixa de aparecer após a data de término escolhida.

### RF-05 — Cartões

Cadastrar cartão com dias de fechamento e vencimento. Compras e parcelas entram na previsão de fatura; pagamento da fatura afeta o saldo em conta na data prevista.

**Aceite**

- Compra no cartão aparece no resultado do mês da compra.
- Pagamento da fatura afeta o saldo previsto na data de vencimento.
- O mesmo gasto não é subtraído do saldo de caixa tanto na compra quanto no pagamento.
- Vencimentos e parcelas são ajustáveis e têm origem explicável.

### RF-06 — Economias e resultados

Permitir acompanhar uma conta reservada ou objetivo opcional e apresentar o fechamento mensal.

**Aceite**

- Transferir dinheiro entre contas próprias não aparece como receita ou despesa.
- A pessoa consegue separar despesas, compras no cartão e transferências internas no resumo.
- Resultados podem ser consultados por mês sem substituir os dados de origem.

## 8. Requisitos não funcionais

- **Privacidade:** sem conta, analytics ou rede no MVP; a intenção futura de sincronizar exige nova decisão de produto.
- **Segurança:** banco local com SQLCipher; chave aleatória protegida por armazenamento seguro do Android; falha de criptografia deve bloquear a abertura e mostrar erro recuperável, nunca cair para SQLite aberto.
- **Transparência:** cada projeção deve indicar período, estado dos movimentos e origem de valores recorrentes ou de cartão.
- **Precisão:** valores BRL persistidos em centavos inteiros; sem aritmética financeira em ponto flutuante.
- **Acessibilidade:** contraste suficiente, tamanho de texto escalável, rótulos para leitor de tela e interação que não dependa somente de cor.
- **Disponibilidade:** leitura e escrita local sem internet; erro ou interrupção não pode substituir banco válido por um banco vazio.
- **Idioma:** português do Brasil inicialmente; formatar datas e moeda com convenções de pt-BR.

## 9. Privacidade e limites de uso

O app guarda informações financeiras pessoais. Antes de usar dados reais, a implementação deve demonstrar criptografia ativa, proteção da chave, migrações seguras, bloqueio de logs sensíveis e exclusão funcional. O manifesto da Google Play e uma política de privacidade deverão refletir o comportamento real, não uma promessa de planejamento.

O produto apenas organiza dados informados pela pessoa e calcula cenários. Deve mostrar que previsões dependem de datas e valores informados e não substituem orientação profissional.

## 10. Dependências e decisões em aberto

- Confirmar nome definitivo e identidade visual antes da publicação.
- Confirmar o identificador Android definitivo antes de qualquer publicação; o pacote atual é provisório.
- Definir a versão mínima de Android antes de gerar o primeiro build de distribuição.
- Fechar cenários de cartão, datas de fechamento e ajuste de vencimento na issue correspondente.
- Definir formato, senha e aviso de segurança para exportação antes de lançar backup.
- Não introduzir backend sem revisar consentimento, autenticação, criptografia em trânsito, regras de acesso e exclusão remota.

## 11. Definition of Done

- Critérios da issue satisfeitos e fluxo de erro/estado vazio considerado.
- Regras monetárias e de data cobertas por testes de domínio nas issues que adicionarem lógica.
- Persistência e migração verificadas em build Android apropriado quando a mudança envolver SQLite/SQLCipher.
- Documentação e backlog atualizados quando uma decisão de produto mudar.
- Nenhum dado financeiro de teste real, token, chave ou arquivo de build incluído no commit.
