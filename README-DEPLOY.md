# 🚀 Deploy GymFonty Online

## Opzioni di Deploy

### **Opzione 1: Vercel + Railway (Raccomandato - Gratuito)**
- **Frontend**: Vercel (gratuito)
- **Backend**: Railway (gratuito)
- **Database**: PostgreSQL su Railway

### **Opzione 2: Vercel + DigitalOcean**
- **Frontend**: Vercel (gratuito)
- **Backend**: DigitalOcean App Platform ($5/mese)
- **Database**: Managed PostgreSQL ($15/mese)

## 🛠️ Deploy Rapido

### 1. Preparazione
```bash
# Esegui lo script di preparazione
./prepare-deploy.sh
```

### 2. Deploy Frontend (Vercel)
1. Vai su [vercel.com](https://vercel.com)
2. Connetti il tuo repository GitHub
3. Imposta le variabili d'ambiente:
   - `NEXT_PUBLIC_API_URL`: URL del tuo backend
   - `NEXTAUTH_URL`: URL del tuo frontend
   - `NEXTAUTH_SECRET`: Chiave segreta generata

### 3. Deploy Backend (Railway)
1. Vai su [railway.app](https://railway.app)
2. Connetti il tuo repository GitHub
3. Imposta le variabili d'ambiente:
   - `DATABASE_URL`: URL del database PostgreSQL
   - `JWT_SECRET`: Chiave segreta JWT
   - `FRONTEND_ORIGIN`: URL del tuo frontend
   - `CORS_ORIGINS`: URL del tuo frontend

### 4. Database
Railway include PostgreSQL automaticamente. Per altri provider:
- **Supabase**: PostgreSQL gratuito
- **DigitalOcean**: Managed PostgreSQL
- **AWS RDS**: PostgreSQL gestito

## 📋 Checklist Deploy

- [ ] Codice pushato su GitHub
- [ ] Frontend deployato su Vercel
- [ ] Backend deployato su Railway
- [ ] Database configurato
- [ ] Variabili d'ambiente impostate
- [ ] Test dell'applicazione online

## 🔧 Configurazione Post-Deploy

### 1. Aggiorna le variabili d'ambiente
Dopo il deploy, aggiorna le variabili con i domini reali:

**Frontend (Vercel)**:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://your-frontend.vercel.app
```

**Backend (Railway)**:
```
FRONTEND_ORIGIN=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
```

### 2. Test dell'applicazione
1. Vai al tuo dominio Vercel
2. Prova il login
3. Testa la creazione di clienti
4. Verifica l'export dei profili

## 🆘 Risoluzione Problemi

### Frontend non si connette al backend
- Verifica `NEXT_PUBLIC_API_URL`
- Controlla CORS nel backend
- Verifica che il backend sia online

### Database non funziona
- Verifica `DATABASE_URL`
- Controlla che il database sia accessibile
- Verifica le credenziali

### Errori di build
- Controlla i log di build
- Verifica le dipendenze
- Controlla le variabili d'ambiente

## 💰 Costi

### Vercel + Railway (Gratuito)
- **Vercel**: Gratuito (hobby plan)
- **Railway**: Gratuito (piano base)
- **Database**: Incluso in Railway

### Vercel + DigitalOcean
- **Vercel**: Gratuito
- **DigitalOcean**: $5-20/mese
- **Database**: $15/mese

## 🎯 Prossimi Passi

1. **Esegui** `./prepare-deploy.sh`
2. **Crea** repository GitHub
3. **Deploya** frontend su Vercel
4. **Deploya** backend su Railway
5. **Testa** l'applicazione online

## 📞 Supporto

Se hai problemi con il deploy:
1. Controlla i log di build
2. Verifica le variabili d'ambiente
3. Controlla la connessione tra frontend e backend
4. Verifica che il database sia accessibile
