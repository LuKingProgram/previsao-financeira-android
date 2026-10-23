# Banco de dados local

## Fonte de verdade

SQLite local com SQLCipher. O app guarda a chave aleatória em Expo SecureStore/Android Keystore e só expõe os repositórios depois de confirmar que o build usa SQLCipher. A versão inicial ainda não implementa abertura de banco nem migrações.

Usar valores em centavos inteiros de BRL, IDs UUID, consultas parametrizadas e datas de calendário no formato ISO YYYY-MM-DD. Guardar timestamps ISO UTC apenas para auditoria técnica (created_at, updated_at), nunca para substituir a data local de um lançamento.

## Entidades propostas

### user_settings

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | Chave única local |
| currency | TEXT | BRL no MVP |
| first_day_of_month | INTEGER | 1 a 28 no MVP |
| created_at / updated_at | TEXT | Timestamp de auditoria |

### accounts

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | UUID |
| name | TEXT | Nome escolhido pela pessoa |
| kind | TEXT | cash, savings ou credit_card_liability |
| opening_balance_minor | INTEGER | Centavos, positivo ou negativo |
| balance_as_of | TEXT | Data local que acompanha o saldo inicial |
| is_active | INTEGER | 0 ou 1 |
| created_at / updated_at | TEXT | Timestamp de auditoria |

### financial_entries

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | UUID |
| account_id | TEXT | Conta própria usada |
| kind | TEXT | income ou expense |
| amount_minor | INTEGER | Valor absoluto em centavos, maior que zero |
| title | TEXT | Descrição curta |
| category_id | TEXT nullable | Categoria opcional |
| occurred_on | TEXT | Data local da ocorrência ou compra |
| status | TEXT | planned, confirmed ou cancelled |
| recurring_rule_id | TEXT nullable | Regra de origem |
| installment_group_id | TEXT nullable | Grupo de parcelas |
| note | TEXT nullable | Observação opcional |
| created_at / updated_at | TEXT | Timestamp de auditoria |

### internal_transfers

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | UUID |
| from_account_id | TEXT | Conta de origem |
| to_account_id | TEXT | Conta de destino |
| amount_minor | INTEGER | Centavos positivos |
| occurred_on | TEXT | Data local |
| status | TEXT | planned, confirmed ou cancelled |
| created_at / updated_at | TEXT | Timestamp de auditoria |

Transferência é uma entidade própria para que o domínio não a classifique como receita ou despesa. Deve rejeitar a mesma conta na origem e no destino.

### credit_cards

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | UUID |
| liability_account_id | TEXT | Conta de passivo do cartão |
| name | TEXT | Nome escolhido pela pessoa |
| closing_day | INTEGER | Dia do mês |
| due_day | INTEGER | Dia do mês |
| credit_limit_minor | INTEGER nullable | Limite opcional em centavos |
| is_active | INTEGER | 0 ou 1 |

### card_purchases

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | UUID |
| card_id | TEXT | Cartão |
| total_minor | INTEGER | Total da compra |
| purchased_on | TEXT | Data local da compra |
| title | TEXT | Descrição |
| installment_count | INTEGER | 1 ou mais |
| status | TEXT | planned, confirmed ou cancelled |
| recurring_rule_id | TEXT nullable | Origem se aplicável |

As parcelas/faturas previstas podem ser calculadas ou materializadas conforme a implementação. Se forem salvas, cada parcela precisa de chave natural estável por compra e número de parcela para impedir duplicação.

### recurring_rules

| Campo | Tipo lógico | Regra |
|---|---|---|
| id | TEXT | UUID |
| kind | TEXT | Entrada, saída ou compra no cartão |
| amount_minor | INTEGER | Valor previsto em centavos |
| interval | TEXT | weekly, monthly ou outra periodicidade aprovada |
| start_on | TEXT | Data local da primeira ocorrência |
| end_on | TEXT nullable | Término opcional |
| day_of_month | INTEGER nullable | Dia mensal solicitado |
| is_active | INTEGER | 0 ou 1 |
| created_at / updated_at | TEXT | Timestamp de auditoria |

### recurrence_exceptions

Guarda ajuste, confirmação ou cancelamento de uma ocorrência específica usando a chave composta rule_id + occurrence_on. Impede que confirmar uma data produza uma previsão duplicada.

### categories

Lista pequena, editável e opcional de categorias. Remover uma categoria não deve apagar lançamentos; a referência fica nula ou preserva o rótulo histórico, conforme decisão da issue de implementação.

## Relações e índices

- financial_entries.account_id referencia accounts.id.
- internal_transfers referencia duas contas distintas.
- card_purchases.card_id referencia credit_cards.id.
- Ocorrências de recorrência referenciam uma regra e uma data específica.
- Índices para data/estado de movimento, cartão/data de compra, data de transferência e regra/data de ocorrência.
- Chaves estrangeiras habilitadas em cada conexão.
- Exclusão de conta com histórico deve ser bloqueada até reatribuição, arquivamento ou confirmação explícita da regra de produto.

## Dados derivados

Não persistir saldo projetado, resultado mensal, próxima ocorrência ou fatura calculada como fonte de verdade. Calcular a partir das entidades e regras vigentes, ou guardar apenas cache descartável com versão e invalidação explícitas.

## Migrações e integridade

- Cada alteração de esquema recebe versão incremental e migração testável.
- Migrações rodam em transação.
- Falha de migração não apaga ou substitui o arquivo original.
- IDs e valores não podem ser gerados por concatenação de texto fornecido pelo usuário.
- Toda gravação que altera mais de uma entidade deve ser atômica.
- Apagar todos os dados deve remover banco, WAL/SHM e chave segura; a experiência precisa confirmar o resultado.

## Decisões que antecedem implementação

- Código de migração inicial e política de backup.
- Persistir ou calcular parcelas de fatura.
- Limite máximo de valor e quantidade de parcelas.
- Tratamento de exclusão de conta com movimentos.
- Categoria removida e manutenção de resumo histórico.
- Cenário de chave perdida, falha no SecureStore e banco corrompido.
