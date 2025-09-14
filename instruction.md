# PRD — Sito web e App stile *Fusco.fit* (implementazione con React Native / React Native Web)

## 1. Executive Summary

Obiettivo: realizzare un sito web e un'app mobile con le stesse funzionalità e la stessa user experience percepita su [https://www.fusco.fit](https://www.fusco.fit) — presentazione dei servizi (online e in sede), e‑commerce per prodotti alimentari e integratori, sezioni per ricette, prenotazione eventi/coach, area account e integrazione con un'app (Fusco Fit Connect). Il progetto target è un prodotto omnicanale (web + iOS + Android) sviluppato principalmente con **React Native** e **React Native Web** per massimizzare il riuso del codice.

### Cosa troverai in questo documento

* Visione e obiettivi di prodotto
* Personas e user journeys
* Requisiti funzionali (MVP + Post‑MVP)
* Architettura informativa e modello dati
* API endpoints principali e flusso di integrazione con pagamenti e app
* Linee guida UI/UX e componenti riusabili
* Requisiti non funzionali (sicurezza, performance, SEO, accessibilità)
* Piano di rollout per milestone e deliverable (ordine di attività — senza stime temporali)
* Criteri di accettazione e rischi

---

## 2. Obiettivi del Prodotto (Why)

* Offrire una piattaforma coerente dove un utente può scoprire servizi, comprare piani o prodotti, prenotare eventi e interagire col coach.
* Garantire esperienza uniforme e performante su web e mobile (iOS/Android).
* Abilitare gestione commerciale: campagne, coupon, gift card, report vendite.
* Integrare funzionalità avanzate: generazione ricette (AI), ticket per consulenze nutrizionali, sincronizzazione con app (Fusco Fit Connect).

**Success metrics (KPI)**

* Conversion rate (visita → acquisto servizio/prodotto)
* Tasso di completamento checkout
* Nuovi account registrati
* Retention (30/90 giorni) per utenti app
* Valore medio ordine (AOV)

---

## 3. Analisi del sito di riferimento (riferimento funzionale)

* Contenuti principali: Servizi (Online e PT), Food e integrazione (ricette, prodotti), Chi siamo, Contatti, Account, Carrello.
* E‑commerce con catalogo di prodotti (barrette, cookie, integratori, preparati).
* Promozione di un’app proprietaria **Fusco Fit Connect** e funzionalità di ticketing per il team nutrizionale.
* Possibilità di prenotare date di un tour / coaching day e una sezione per trovare studi in varie città.
  (Queste informazioni sono state rilevate dalla homepage e dal menu del sito di riferimento).

---

## 4. Personas

### Persona A — *Valentina, 28 anni, impiegata*

* Cerca programmi online facili da seguire, vuole ricette pratiche e prodotti pronti.
* Obiettivi: perdere peso, routine semplice, supporto remoto.

### Persona B — *Marco, 36 anni, manager*

* Vuole sessioni PT in sede, prenotazioni mirate e servizi premium.
* Obiettivi: performance, programmazione personalizzata.

### Persona C — *Luca, 22 anni, studente sportivo*

* Cerca integrazione alimentare, barrette/prodotti e contenuti rapidi.
* Obiettivi: aumentare massa, avere programma su mobile.

---

## 5. Scope: MVP vs Post‑MVP

### MVP (obbligatorio)

* Homepage responsive con sezioni principali (hero, servizi, ricette highlight, booking, CTA).
* Catalogo servizi: pagine per "Allenamento e Alimentazione", "Solo Allenamento", "Solo Alimentazione".
* E‑commerce base: catalogo prodotti, dettaglio prodotto, carrello, checkout con pagamento (Stripe o sistema preferito).
* Account utente: registrazione/login (email + password, social login opzionale), dashboard ordini e piani attivi.
* Prenotazioni eventi (tour/coaching day): lista date, selezione posto, checkout/booking.
* Integrazione minima con l'app (placeholder SDK / API per sincronizzazione piani e stato account).
* CMS per contenuti statici (pagine "Chi siamo", FAQ, ricette) — headless CMS o WordPress Headless.
* Cookie & GDPR consent management.

### Post‑MVP (avanzato)

* Generazione ricette via AI e ticketing nutrizionale avanzato.
* Gift card digitali e sistema di resi/rimborsi complesso.
* Funzionalità premium (abbonamenti ricorrenti, pausing subscription, insurance add‑on).
* App mobile nativa completa (notifiche push, sincronizzazione offline, workout tracking).
* Analytics avanzate, A/B testing e personalizzazione contenuti.

---

## 6. Requisiti funzionali (dettagliati)

### 6.1 Homepage

* Hero con CTA principale (es. "Inizia adesso").
* Sezioni: punti di forza, percorsi, app, prodotti in evidenza, studi in città, recensioni, footer con link a privacy/term.
* CMS driven per testi e immagini.

### 6.2 Catalogo Servizi

* Lista servizi filtrabile (Online, PT, Coaching Day).
* Scheda servizio con: descrizione, vantaggi, contenuti inclusi, prezzo, CTA acquista/prenota.
* Upsell: opzioni aggiuntive (es. "Senza Pensieri +69€").

### 6.3 E‑commerce

* Catalogo prodotti, ricerca, categorie (barrette, cookie, integratori,..).
* Scheda prodotto: immagini, ingredienti, nutrizione, varianti, quantità.
* Carrello persistente, pagina checkout: indirizzo, spedizione, pagamento.
* Pagamenti: supporto per carta (Stripe), SCA (PSD2), possibilità di coupon e note d'ordine.
* Pannello amministrativo per gestione ordini e catalogo.

### 6.4 Account utente

* Registrazione, login, recupero password.
* Dashboard: ordini, abbonamenti/piani attivi, preferenze alimentari, storico prenotazioni.
* Area per aprire ticket nutrizionali (MVP: form; Post‑MVP: gestione ticket e chat).

### 6.5 Prenotazioni / Eventi

* Elenco date per Coaching Day / Tour, località multiple.
* Prenota posto: scelta data, pagamento/checkout, email di conferma e calendario (.ics).

### 6.6 Content & Recipes

* Pagine ricette con immagini e istruzioni.
* Funzionalità Post‑MVP: generazione ricette via AI e salvataggio preferite.

### 6.7 App Integration

* Endpoints per sincronizzare account/piani e fornitura token per app mobile.
* Webhooks per eventi importanti (ordine completato, abbonamento rinnovato).

---

## 7. Requisiti non funzionali

* **Performance**: pagine critiche renderizzate lato server (SSR) per SEO; payload initial < 300KB per view quando possibile.
* **SEO**: meta tags dinamici, sitemap.xml, robots.txt, semantica HTML valida per contenuti pubblici.
* **Accessibilità**: WCAG AA minimo (tag alt, contrasti, navigazione da tastiera).
* **Scalabilità**: backend stateless, separazione servizi (auth, prodotti, ordini).
* **Sicurezza**: HTTPS ovunque, protezione XSS/CSRF, cifratura dati sensibili, compliance GDPR, PCI‑DSS per pagamenti.

---

## 8. Architettura informativa & Sitemap (semplificata)

* Home
* Servizi

  * Online
  * Solo Allenamento
  * Solo Alimentazione
  * Fitness Coaching Premium
* Food e Integrazione

  * Ricette
  * Prodotti (catalogo)
* Coaching Day (tour)
* Chi siamo (team, storia)
* Contatti (sede, studi, lavora con noi)
* Account (login, dashboard)
* Carrello / Checkout
* FAQ, Privacy, Termini, Resi e rimborsi

---

## 9. Modello dati (entità principali)

* **User**: id, nome, email, passwordHash, ruolo, preferenzeNutrizionali, indirizzi\[], createdAt, updatedAt
* **Product**: id, title, description, price, sku, inventory, images\[], category, nutritionInfo, variants\[]
* **Service**: id, title, shortDesc, longDesc, priceOptions\[], inclusions\[]
* **Order**: id, userId, items\[], total, status, paymentId, shippingAddress, createdAt
* **Booking**: id, eventId, userId, seat, status, paymentId
* **Event**: id, title, city, venue, date, capacity, bookedCount
* **Recipe**: id, title, ingredients\[], steps\[], calories
* **Ticket**: id, userId, subject, message, status, assignee

Relazioni: User 1‑N Orders, User 1‑N Bookings, Product N‑M Orders (line items), Service N‑M User (piani attivi)

---

## 10. API (esempi principali)

* `POST /api/auth/register` — registra utente
* `POST /api/auth/login` — login -> token JWT
* `GET /api/services` — lista servizi
* `GET /api/services/:id` — dettaglio servizio
* `GET /api/products` — catalogo (filtri & query)
* `GET /api/products/:id` — dettaglio prodotto
* `POST /api/cart` — aggiungi carrello (persistente lato server)
* `POST /api/checkout` — crea ordine -> integra Stripe
* `GET /api/bookings/events` — lista eventi
* `POST /api/bookings` — prenota evento (crea booking + payment)
* `POST /api/tickets` — apri ticket nutrizionale
* `GET /api/user/dashboard` — dati utente per app/dashboard

Sicurezza: JWT + refresh tokens; rate limiting per endpoint sensibili; permettere CORS per web/app origin.

---

## 11. UX / Component Library

* **Design tokens**: colori primari/secondari, tipografia, spaziature, radius.
* **Componenti base**: Button, Card, Modal, FormInput, ImageCarousel, ProductCard, ServiceCard, Header, Footer, ProgressiveImage.
* **Pattern**: Skeleton loaders, Toaster notifications, Accessible forms (aria attributes), Forms validation (client + server).
* **Responsive**: usare breakpoints (mobile-first), per il web usare RN‑Web + CSS in JS (es. styled‑components / Tailwind compatibile).

---

## 12. Scelte tecnologiche consigliate

### Frontend

* **React Native** + **Expo** per sviluppo mobile rapido.
* **React Native Web** + **Next.js** per pubblicazione web con SSR (SEO).
* TypeScript, React Query / SWR per fetching, Formik/Yup per form validation.
* Component library personalizzata (design tokens + Storybook).

### Backend

* Node.js con Express o NestJS (TypeScript).
* DB relazionale: PostgreSQL (gestione ordini, utenti). Redis per cache/session.
* Stripe per pagamenti; provider di mail (SendGrid/Mailgun).
* Headless CMS: Strapi o WordPress Headless (se si vuole riutilizzare contenuti esistenti).

### Integrazione e hosting

* Web: Vercel / Netlify (Next.js) oppure hosting su AWS Amplify.
* Mobile: Expo/EAS per build e distribuzione su App Store / Play Store.
* Backend: AWS (ECS/Fargate) o DigitalOcean App Platform, DB su RDS / Managed PG.
* Storage media: S3 + CDN (CloudFront).

---

## 13. Test, QA e Monitoring

* Unit tests (Jest), component tests (React Testing Library).
* E2E: Cypress per web, Detox/Appium per mobile.
* Accessibility tests: axe-core integrato in CI.
* Monitoring: Sentry (error tracking), Datadog/Prometheus per metriche.

---

## 14. Sicurezza e Privacy

* GDPR: cookie banner e gestione consensi, dati utenti trattati solo per scopi dichiarati.
* PCI compliance: usare Stripe per non gestire direttamente i dati delle carte.
* Backup regolari DB e procedure di restore testate.

---

## 15. Criteri di accettazione (sample per feature)

* **Homepage**: tutte le sezioni sopra elencate sono editabili via CMS e link funzionanti.
* **Checkout**: pagamento completato e ordine salvato correttamente; email conferma inviata.
* **Booking**: prenotazione decremente giacenza; ricezione email e .ics scaricabile.
* **Account**: login + dashboard con ordini/attività visibili per l'utente.

---

## 16. Roadmap / Milestones (ordine consigliato dei deliverable)

1. Kickoff & discovery: audit contenuti del sito esistente, definizione final copy e immagini.
2. Architettura e setup repo (mono repo con workspace per mobile/web/backend).
3. Implementazione backend minimo (auth, products, services, orders, events).
4. Frontend MVP (RN Web + Next SSR pages + mobile shell): homepage, catalogo, prodotto, carrello, checkout.
5. Account & dashboard, integrazione app (endpoints auth + sync).
6. CMS e strumenti operativi (admin per ordini, prodotti, eventi).
7. Test, hardening sicurezza, passaggi legali (privacy/cookie).
8. Go‑live web + submission mobile (app stores) — rollout controllato con feature flags.

*(Nota: non sono fornite stime temporali in questo documento; indica solo l'ordine e i deliverable.)*

---

## 17. Ruoli raccomandati

* Product Owner / Project Manager
* Lead Developer (Fullstack) + 1 Backend engineer
* 1‑2 Frontend developer (React Native / RN Web)
* UI/UX Designer
* QA Engineer
* DevOps / Sysadmin
* Content Manager (copy + immagini)

---

## 18. Rischi e mitigazioni

* **Rischio**: Migrazione contenuti da WordPress → perdita SEO.
  **Mitigazione**: mappa URL, redirect 301, generazione sitemap e test crawlers.
* **Rischio**: Integrazione pagamenti e SCA.
  **Mitigazione**: usare Stripe + ambiente di test, verificare flussi PSD2.
* **Rischio**: Carico su backend durante campagne promozionali.
  **Mitigazione**: scalare servizi, mettere queue per ordini massivi, rate limiting.

---

## 19. Next steps operativi (kickoff immediate)

1. Fornire accesso al sito esistente (admin WordPress o dettaglio CMS) e inventario contenuti.
2. Lista prioritaria di pagine + contenuti effettivi da migrare (testi + immagini in alta risoluzione).
3. Decisione su payment provider (es. Stripe) e account provisioning.
4. Setup repo e scegliere pattern di lavoro (mono‑repo / multi‑repo).

---

## 20. Appendice tecnica (strumenti suggeriti)

* Storybook, Figma, Expo, Next.js, TypeScript, Jest, Cypress, Sentry, Stripe, Postgres, Redis, AWS S3/CloudFront.

---

*Documento redatto come PRD di livello completo: contiene dettagli tecnici e funzionali necessari per passare alla fase di progettazione dettagliata (wireframes, API contract, stima risorse). Per procedere, si raccomanda il kickoff con i referenti di contenuti per estrarre asset e definire priorità aziendali.*
