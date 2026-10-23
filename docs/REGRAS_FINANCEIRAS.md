# Regras financeiras

Este arquivo define as regras que uma implementação deve seguir. Mudança de comportamento deve atualizar o documento e a issue correspondente.

## 1. Representação de dinheiro

- Moeda do MVP: BRL.
- Persistir valores em centavos inteiros: R$ 12,34 é 1234.
- Guardar magnitude positiva e representar direção por kind; não alternar convenções de sinal entre telas e tabelas.
- Não usar ponto flutuante binário para cálculo, comparação ou persistência.
- Validar entradas digitadas como texto decimal pt-BR e converter uma única vez para centavos.
- Formatar apenas na apresentação com convenção pt-BR; a formatação nunca muda o valor guardado.
- Valores acima do limite seguro definido pela issue devem ser recusados com mensagem clara, não truncados.

## 2. Datas e estados

- Data de movimento é uma data local de calendário, sem horário.
- “Realizado” significa que a pessoa confirma o movimento; “previsto” significa estimativa futura; “cancelado” não afeta saldo.
- O saldo inicial é válido no fim da data balance_as_of. Movimentos até essa data já estão refletidos nele e não são somados de novo.
- Movimento previsto pode ser editado ou cancelado. Confirmar uma ocorrência substitui aquela previsão, sem manter os dois valores.
- Salvar horário UTC para auditoria não pode deslocar a data financeira exibida.

## 3. Contas e saldo projetado

Para cada conta de caixa, a projeção em uma data D é:

~~~text
saldo(D) = saldo inicial na data de referência
        + entradas efetivas até D
        - saídas efetivas até D
        + entradas previstas até D
        - saídas previstas até D
        + transferências recebidas até D
        - transferências enviadas até D
~~~

Somar os saldos de contas de caixa inclui cada transferência interna uma vez em cada lado oposto; portanto a soma consolidada não muda por uma transferência entre contas incluídas. Se uma conta estiver arquivada, o app deve mostrar o escopo da soma e não simplesmente descartar dinheiro.

No saldo previsto, incluir somente movimentos não cancelados cuja data seja posterior à data refletida no saldo inicial. O app deve explicar os movimentos incluídos.

## 4. Resultado do mês

- Receita: entradas confirmadas por data de ocorrência.
- Despesa: saídas confirmadas pela data de ocorrência e compras no cartão pela data da compra.
- Transferências entre contas próprias são excluídas de receita e despesa.
- Pagamento de fatura é transferência para liquidar passivo; não cria segunda despesa.
- Previsões podem aparecer em uma seção separada, nunca misturadas ao resultado realizado sem rótulo.
- Economizar por transferência para uma conta própria não é despesa; o resumo pode apresentar valor destinado a economias como métrica informativa.

## 5. Cartões e faturas

- Registrar a compra no cartão na data em que ocorreu para o resultado mensal.
- Parcelar o total exatamente em N parcelas inteiras em centavos; distribuir eventual resto de centavos de forma determinística e documentada.
- A projeção de caixa subtrai a fatura apenas na data de vencimento prevista.
- Quando a fatura é paga, retirar seu valor de compromissos futuros previstos; o pagamento confirmado não pode subtrair a mesma despesa uma segunda vez.
- O saldo de cartão representa dívida/limite usado; não deve ser somado ao saldo de caixa como se fosse dinheiro disponível.
- Dia de fechamento ou vencimento que não exista no mês é ajustado ao último dia daquele mês. A ocorrência real pode ser corrigida pela pessoa.
- Mudar fechamento ou vencimento não reescreve compras confirmadas; altera somente previsões ainda abertas.

## 6. Recorrências

- A regra gera ocorrências previstas para um intervalo sob demanda; não grava ocorrências futuras como realizadas.
- Para ocorrência mensal no dia 29, 30 ou 31 em mês curto, usar o último dia do mês. No mês seguinte retomar o dia configurado.
- Intervalos semanais mantêm dia da semana e data local.
- Exceção para uma ocorrência (ajuste, confirmação ou cancelamento) não altera a regra inteira.
- Cada ocorrência tem identidade estável por regra e data para não duplicar ao recalcular.
- Encerrar regra conserva ocorrências anteriores e para de gerar a partir da data escolhida.

## 7. Cenários e categorias

- Cenário simulado é uma cópia de cálculo; não altera movimento nem saldo real até decisão explícita de salvar.
- Categorias são metadados opcionais; ausência de categoria nunca impede registro, projeção ou resumo.
- O app não deve impedir uma despesa porque excede um orçamento de categoria.

## 8. Segurança e comunicação

- Nunca mostrar “saldo garantido”; preferir “saldo previsto” e informar que depende dos valores e datas inseridos.
- Se faltar dado para calcular uma fatura ou ocorrência, mostrar incerteza e a origem ausente em vez de inventar uma data silenciosamente.
- A projeção é organização informativa, não orientação de investimento, crédito ou endividamento.

## 9. Casos de aceite para domínio

1. Uma entrada prevista de R$ 100,00 em 10 dias aumenta a projeção apenas a partir dessa data.
2. Uma saída confirmada de R$ 20,01 reduz saldo em exatamente 2001 centavos.
3. Transferir R$ 50,00 entre duas contas incluídas não altera o saldo consolidado.
4. Uma compra de R$ 120,00 no cartão aparece no resultado da data da compra; a projeção de caixa considera a fatura no vencimento, sem descontar R$ 240,00.
5. Confirmar uma recorrência para 31 de janeiro em fevereiro curto não gera ocorrência duplicada nem data inválida.
6. Cancelar uma previsão deixa o saldo calculado inalterado em relação à situação sem aquele movimento.
7. Um valor de saldo zero é distinto de erro de leitura do banco.
