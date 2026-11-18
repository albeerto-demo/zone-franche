# Zone franche

L'elenco dei locali che aderiscono a **Blocca Social**: quando una persona con l'app (e con il "blocco nelle zone franche" attivo) entra nel raggio di uno di questi locali, i social sul suo telefono si bloccano.

- **Mappa pubblica:** https://albeerto-demo.github.io/zone-franche/
- **Elenco usato dalle app:** [`locali.json`](locali.json). Le app lo riscaricano da sole ogni poche ore, senza bisogno di reinstallare.

## Come aggiungere un locale

1. Apri [`locali.json`](locali.json) qui su GitHub e premi la matita ✏️ (Modifica).
2. Copia uno dei blocchi `{ ... }` e cambia i valori:
   - `id`: un nome breve senza spazi, unico (es. `bar-roma-centro`)
   - `nome`, `indirizzo`: come vuoi che appaiano sulla mappa
   - `lat`, `lon`: la posizione. Su Google Maps fai clic destro sul locale: il primo numero è `lat`, il secondo `lon`
   - `raggio`: quanti metri intorno al locale vale il blocco (consigliato 40–80)
   - togli la riga `"esempio": true`
3. Attenzione alle virgole: tra un blocco e l'altro serve `,`, dopo l'ultimo no.
4. Premi **Commit changes**. Mappa e app si aggiornano in qualche minuto.

I locali con `"esempio": true` sono inventati e servono solo per provare.
