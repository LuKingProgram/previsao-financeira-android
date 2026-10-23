# Mapa de telas e navegação

Este documento descreve a navegação desejada para o MVP. As rotas listadas são planejadas; a versão atual contém apenas a tela inicial de apresentação.

## Princípios de interface

- Usar linguagem simples em português do Brasil.
- Mostrar o que aconteceu, o que é previsto e o efeito no saldo sem exigir classificação por categoria.
- Não usar exemplos que pareçam dados reais de uma pessoa.
- Destacar primeiro datas e valores que mudam o saldo, não gráficos decorativos.
- Não usar cor como único indicador de positivo, negativo, realizado ou previsto.
- Dar acesso rápido à criação de entrada ou saída, com poucos campos obrigatórios.

## Navegação proposta

~~~mermaid
flowchart TD
    A[Configuração inicial] --> B[Visão geral]
    B --> C[Projeção diária e mensal]
    B --> D[Novo movimento]
    B --> E[Contas e cartões]
    B --> F[Recorrências]
    B --> G[Economias]
    B --> H[Resultado mensal]
    B --> I[Configurações e privacidade]
    C --> J[Detalhe do dia]
    D --> K[Detalhe ou edição do movimento]
    E --> L[Detalhe do cartão e faturas]
    F --> M[Editar regra ou ocorrência]
~~~

## Inventário

| Tela | Rota prevista | Objetivo | Conteúdo e ações principais |
|---|---|---|---|
| Configuração inicial | /(onboarding)/start | Criar a referência inicial do saldo | Data do saldo, valor inicial, nome opcional da conta, aviso sobre projeção |
| Visão geral | / | Responder como está o saldo e o que vem a seguir | Saldo nas contas, saldo previsto, próximo compromisso, primeira data negativa, ações rápidas |
| Projeção | /forecast | Explorar o futuro | Alternar dia/mês, navegar período, ver entradas/saídas, abrir origem de cada valor |
| Detalhe do dia | /forecast/[date] | Explicar a variação diária | Saldo no início/fim do dia e movimentos por estado |
| Novo movimento | /transactions/new | Registrar uma entrada ou saída | Tipo, valor, título, data, conta, realizado/previsto; categoria e observação opcionais |
| Movimento | /transactions/[id] | Corrigir ou remover um lançamento | Origem, estado, edição, cancelamento e opção de recorrência |
| Contas | /accounts | Conferir saldos próprios | Lista de contas, saldos, conta ativa/arquivada, transferências internas |
| Cartões | /cards | Acompanhar limite e próximas faturas | Cartões, fechamento, vencimento, compras, parcelas e pagamentos previstos |
| Recorrências | /recurrences | Manter compromissos recorrentes | Regras ativas, próxima ocorrência, editar regra, encerrar e ignorar ocorrência |
| Economias | /savings | Acompanhar dinheiro reservado | Contas/objetivos opcionais, progresso e transferências |
| Resultado mensal | /monthly/[month] | Revisar o período | Entradas, despesas por data de ocorrência, compras no cartão, transferências separadas |
| Configurações | /settings | Controlar preferências e dados | Moeda/idioma, início do mês, exportar dados, apagar dados, versão e explicações |

## Estados obrigatórios

- **Primeiro uso:** explicação curta e ação para definir saldo inicial; não mostrar gráfico vazio como se houvesse dados.
- **Sem movimentos:** mostrar orientação para registrar o primeiro movimento e a definição de saldo previsto.
- **Sem projeções futuras:** informar que não existem compromissos conhecidos no período.
- **Carregamento:** reservar espaço para evitar que o saldo salte durante abertura.
- **Erro local:** explicar se o banco não pode ser aberto ou descriptografado; permitir tentar novamente e exportar diagnóstico sem conteúdo financeiro.
- **Sem dados:** não inventar saldo zero quando a consulta falhar. Diferenciar zero válido de falha de leitura.
- **Saldo negativo previsto:** informar data e componentes que causaram a queda; oferecer abrir os movimentos relacionados.
- **Acessibilidade:** todo gráfico deve ter resumo em texto/lista equivalente; campos e ações possuem rótulos.

## Regras de interação

- O formulário comum de movimento pede apenas o indispensável. Campos opcionais ficam recolhidos quando não ajudam o caso.
- Datas futuras permanecem previstas até confirmação. Uma previsão de cartão deve mostrar vencimento e origem.
- Ao confirmar uma ocorrência recorrente, substituir a ocorrência projetada correspondente em vez de acrescentar outra.
- Antes de apagar todos os dados, explicar o que será removido, pedir confirmação e oferecer exportação quando disponível.
- Confirmações de ações destrutivas devem usar texto direto e indicar se a exclusão pode ou não ser desfeita.
