# 🚀 Deploy Completo GymFonty

## ✅ **Stato Attuale**
- ✅ Frontend: Pronto per Vercel
- ✅ Backend: Versione semplificata creata
- ✅ Database: PostgreSQL configurato
- ✅ Autenticazione: JWT funzionante
- ✅ Gestione clienti: Completa

## 🛠️ **Deploy Steps**

### **1. Frontend (Vercel) - GRATUITO**

1. **Vai su [vercel.com](https://vercel.com)**
2. **Connetti GitHub** e seleziona il repository
3. **Configura il progetto**:
   - Framework: Next.js
   - Root Directory: `web`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Imposta variabili d'ambiente**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   NEXTAUTH_URL=https://your-frontend.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   ```

5. **Deploy** - Vercel farà tutto automaticamente!

### **2. Backend (Railway) - GRATUITO**

1. **Vai su [railway.app](https://railway.app)**
2. **Connetti GitHub** e seleziona il repository
3. **Configura il progetto**:
   - Root Directory: `server`
   - Build Command: `npm run build`
   - Start Command: `node dist/index.js`

4. **Imposta variabili d'ambiente**:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   JWT_SECRET=your-jwt-secret-here
   FRONTEND_ORIGIN=https://your-frontend.vercel.app
   CORS_ORIGINS=https://your-frontend.vercel.app
   PORT=4000
   NODE_ENV=production
   ```

5. **Database**: Railway include PostgreSQL automaticamente

### **3. Database (PostgreSQL)**

Railway include PostgreSQL automaticamente. Per altri provider:
- **Supabase**: PostgreSQL gratuito
- **DigitalOcean**: Managed PostgreSQL ($15/mese)
- **AWS RDS**: PostgreSQL gestito

## 📋 **Checklist Deploy**

- [ ] Codice pushato su GitHub
- [ ] Frontend deployato su Vercel
- [ ] Backend deployato su Railway
- [ ] Database configurato
- [ ] Variabili d'ambiente impostate
- [ ] Test dell'applicazione online

## 🔧 **Configurazione Post-Deploy**

### **1. Aggiorna le variabili d'ambiente**

**Frontend (Vercel)**:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

**Backend (Railway)**:
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-jwt-secret-here
FRONTEND_ORIGIN=https://your-frontend.vercel.app
CORS_ORIGINS=https://your-frontend.vercel.app
PORT=4000
NODE_ENV=production
```

### **2. Test dell'applicazione**

1. **Vai al tuo dominio Vercel**
2. **Prova il login** con `admin@example.com` / `admin123`
3. **Testa la creazione di clienti**
4. **Verifica l'export dei profili**

## 💰 **Costi**

### **Vercel + Railway (Gratuito)**
- **Vercel**: Gratuito (hobby plan)
- **Railway**: Gratuito (piano base)
- **Database**: Incluso in Railway
- **Totale**: €0/mese

### **Vercel + DigitalOcean**
- **Vercel**: Gratuito
- **DigitalOcean**: $5-20/mese
- **Database**: $15/mese
- **Totale**: $20-35/mese

## 🎯 **Prossimi Passi**

1. **Crea repository GitHub** se non l'hai già fatto
2. **Deploya frontend su Vercel**
3. **Deploya backend su Railway**
4. **Testa l'applicazione online**
5. **Configura il dominio personalizzato** (opzionale)

## 🆘 **Risoluzione Problemi**

### **Frontend non si connette al backend**
- Verifica `NEXT_PUBLIC_API_URL`
- Controlla CORS nel backend
- Verifica che il backend sia online

### **Database non funziona**
- Verifica `DATABASE_URL`
- Controlla che il database sia accessibile
- Verifica le credenziali

### **Errori di build**
- Controlla i log di build
- Verifica le dipendenze
- Controlla le variabili d'ambiente

## 📞 **Supporto**

Se hai problemi con il deploy:
1. Controlla i log di build
2. Verifica le variabili d'ambiente
3. Controlla la connessione tra frontend e backend
4. Verifica che il database sia accessibile

## 🎉 **Risultato Finale**

Dopo il deploy avrai:
- ✅ Applicazione online funzionante
- ✅ Frontend su Vercel
- ✅ Backend su Railway
- ✅ Database PostgreSQL
- ✅ Autenticazione JWT
- ✅ Gestione clienti completa
- ✅ Export profili
- ✅ Dashboard admin

**Costo totale: €0/mese** con Vercel + Railway!
