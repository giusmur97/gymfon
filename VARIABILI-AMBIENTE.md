# 🔐 Variabili d'Ambiente per Deploy

## 🎯 **Vercel (Frontend) - Variabili da Inserire**

### **1. Vai su Vercel Dashboard**
1. Seleziona il tuo progetto
2. Vai su **Settings** → **Environment Variables**
3. Aggiungi queste variabili:

### **2. Variabili Frontend (Vercel)**

| Nome | Valore | Descrizione |
|------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://gymfonty-backend.railway.app` | URL del backend (cambierà dopo il deploy) |
| `NEXTAUTH_URL` | `https://gymfonty-frontend.vercel.app` | URL del frontend (cambierà dopo il deploy) |
| `NEXTAUTH_SECRET` | `gymfonty-secret-key-2024-very-secure-12345` | Chiave segreta per NextAuth |

### **3. Come Inserire in Vercel**
1. **NEXT_PUBLIC_API_URL**: 
   - Nome: `NEXT_PUBLIC_API_URL`
   - Valore: `https://gymfonty-backend.railway.app`
   - Environment: `Production`, `Preview`, `Development`

2. **NEXTAUTH_URL**:
   - Nome: `NEXTAUTH_URL`
   - Valore: `https://gymfonty-frontend.vercel.app`
   - Environment: `Production`, `Preview`, `Development`

3. **NEXTAUTH_SECRET**:
   - Nome: `NEXTAUTH_SECRET`
   - Valore: `gymfonty-secret-key-2024-very-secure-12345`
   - Environment: `Production`, `Preview`, `Development`

---

## 🚂 **Railway (Backend) - Variabili da Inserire**

### **1. Vai su Railway Dashboard**
1. Seleziona il tuo progetto
2. Vai su **Variables**
3. Aggiungi queste variabili:

### **2. Variabili Backend (Railway)**

| Nome | Valore | Descrizione |
|------|--------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway` | URL del database (Railway lo genera automaticamente) |
| `JWT_SECRET` | `gymfonty-jwt-secret-2024-super-secure-67890` | Chiave segreta per JWT |
| `FRONTEND_ORIGIN` | `https://gymfonty-frontend.vercel.app` | URL del frontend per CORS |
| `CORS_ORIGINS` | `https://gymfonty-frontend.vercel.app` | Origini consentite per CORS |
| `PORT` | `4000` | Porta del server |
| `NODE_ENV` | `production` | Ambiente di produzione |

### **3. Come Inserire in Railway**
1. **DATABASE_URL**: Railway lo genera automaticamente quando aggiungi PostgreSQL
2. **JWT_SECRET**: 
   - Nome: `JWT_SECRET`
   - Valore: `gymfonty-jwt-secret-2024-super-secure-67890`

3. **FRONTEND_ORIGIN**:
   - Nome: `FRONTEND_ORIGIN`
   - Valore: `https://gymfonty-frontend.vercel.app`

4. **CORS_ORIGINS**:
   - Nome: `CORS_ORIGINS`
   - Valore: `https://gymfonty-frontend.vercel.app`

5. **PORT**:
   - Nome: `PORT`
   - Valore: `4000`

6. **NODE_ENV**:
   - Nome: `NODE_ENV`
   - Valore: `production`

---

## 📋 **Checklist Deploy**

### **Prima del Deploy**
- [ ] Codice pushato su GitHub
- [ ] Repository pubblico o privato con accesso

### **Deploy Frontend (Vercel)**
- [ ] Progetto creato su Vercel
- [ ] Repository connesso
- [ ] Root Directory: `web`
- [ ] Variabili d'ambiente inserite
- [ ] Deploy completato

### **Deploy Backend (Railway)**
- [ ] Progetto creato su Railway
- [ ] Repository connesso
- [ ] Root Directory: `server`
- [ ] Database PostgreSQL aggiunto
- [ ] Variabili d'ambiente inserite
- [ ] Deploy completato

### **Post-Deploy**
- [ ] Aggiornare `NEXT_PUBLIC_API_URL` con URL reale di Railway
- [ ] Aggiornare `FRONTEND_ORIGIN` e `CORS_ORIGINS` con URL reale di Vercel
- [ ] Testare l'applicazione

---

## 🔄 **Aggiornamento URL dopo Deploy**

### **1. Dopo il Deploy di Railway**
Railway ti darà un URL tipo: `https://gymfonty-backend-production-xxxx.up.railway.app`

**Aggiorna in Vercel**:
- `NEXT_PUBLIC_API_URL` → `https://gymfonty-backend-production-xxxx.up.railway.app`

### **2. Dopo il Deploy di Vercel**
Vercel ti darà un URL tipo: `https://gymfonty-frontend-xxxx.vercel.app`

**Aggiorna in Railway**:
- `FRONTEND_ORIGIN` → `https://gymfonty-frontend-xxxx.vercel.app`
- `CORS_ORIGINS` → `https://gymfonty-frontend-xxxx.vercel.app`

---

## 🎯 **Ordine di Deploy**

1. **Prima**: Deploya il backend su Railway
2. **Secondo**: Deploya il frontend su Vercel
3. **Terzo**: Aggiorna le variabili con gli URL reali
4. **Quarto**: Testa l'applicazione

---

## 🆘 **Se Hai Problemi**

### **Frontend non si connette al backend**
- Verifica che `NEXT_PUBLIC_API_URL` sia corretto
- Controlla che il backend sia online
- Verifica CORS in Railway

### **Errori di build**
- Controlla i log di build
- Verifica le variabili d'ambiente
- Controlla le dipendenze

### **Database non funziona**
- Verifica che `DATABASE_URL` sia corretto
- Controlla che il database sia accessibile
- Verifica le credenziali

---

## 🎉 **Risultato Finale**

Dopo il deploy avrai:
- ✅ Frontend: `https://gymfonty-frontend-xxxx.vercel.app`
- ✅ Backend: `https://gymfonty-backend-production-xxxx.up.railway.app`
- ✅ Database: PostgreSQL su Railway
- ✅ Applicazione completamente funzionante online!

**Costo totale: €0/mese** 🎉
