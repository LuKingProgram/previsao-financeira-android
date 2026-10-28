# Financial metrics and explanations

This document records functional requirements from the user's reference screenshots. They are guidance for behavior only: use original names, copy, layout, icons, and code in this app.

## Metric behavior

- A metric value must open the movements included in that calculation.
- The savings indicator must show the selected period and support a year view with a yearly total and a month-by-month bar, with navigation between years.
- Keep realized and planned amounts distinguishable. The user has approved both states as separate financial concepts.
- A 20%–30% savings rate may be described as a general reference only. It is not a required target, alert threshold, or promise of financial health.

The screenshots' “how it works” content is reference material for understanding the meaning and composition of metrics. Expandable explanations and dedicated explanation screens are not required. Any future interface and copy must remain original.

## Approved definitions

| Metric | Behavior described by the reference | Candidate calculation | Status |
| --- | --- | --- | --- |
| Saved | Money explicitly recorded as set aside for savings, shown as a share of income. A year view shows annual and monthly savings and income amounts. | `savings / income * 100`. Show realized and projected rates separately. The yearly rate uses yearly sums (`year savings / year income`), not an average of monthly rates. | Approved. If period income is zero, the rate is unavailable rather than dividing by zero. |
| Performance | Period result: income minus fixed, daily, savings, card, and daily-forecast outflows. | Realized value uses realized movements only. Projected value combines realized and planned movements. Show the two values separately; the planned contribution remains separately available. | Approved. |
| Cost of living | Fixed, daily, card, and daily-forecast spending, excluding savings. | Realized value uses realized movements only. Projected value combines realized and planned movements. Show the two values separately; the planned contribution remains separately available. | Approved. |
| Daily average | Realized daily expenses, excluding future daily forecast, divided by every calendar day in the selected month. | `realized daily expenses / days in selected month` (28–31). | Approved. Only movements classified as daily expenses are included. |

## Rules already agreed for card movements

For performance and cost-of-living periods, count a card purchase once in the period of its purchase. Projected cash balance reflects the invoice on its due date. Confirming the invoice payment must not create a second expense. These rules prevent a purchase and its later payment from being counted twice.

## Implementation notes

1. A projected value combines realized movements and planned movements within the selected period. Its planned contribution is available separately, so the UI can explain how the projection differs from the realized result.
2. Savings are explicit movements. They reduce performance, are excluded from cost of living, and form the numerator of the savings rate.
3. The annual savings rate is calculated from annual savings and income sums, not from monthly percentage averages.
4. Daily average uses realized movements in the daily-expense category and all calendar days in the month. Round the resulting average to the nearest cent.
5. With no income in a period, its savings rate is unavailable; do not display a fabricated zero percent.

The calculation rules above have been approved and can be implemented. Display the 20%–30% range only as optional general guidance, never as a personalized goal.
