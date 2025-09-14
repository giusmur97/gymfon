# 🚀 Guida Deploy GymFonty

## Opzioni di Deploy

### 1. Vercel + Railway (Raccomandato)
- **Frontend**: Vercel (gratuito)
- **Backend**: Railway (gratuito)
- **Database**: PostgreSQL su Railway

### 2. Vercel + DigitalOcean
- **Frontend**: Vercel (gratuito)
- **Backend**: DigitalOcean App Platform ($5/mese)
- **Database**: Managed PostgreSQL ($15/mese)

## Preparazione

### 1. Variabili d'ambiente Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gymfonty"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN="https://your-frontend-domain.vercel.app"
CORS_ORIGINS="https://your-frontend-domain.vercel.app"
CLOUD_STORAGE_TYPE="local"
UPLOAD_DIR="./uploads"
```

### 2. Variabili d'ambiente Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.railway.app"
NEXTAUTH_URL="https://your-frontend-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

## Deploy Steps

### Frontend (Vercel)
1. Push code su GitHub
2. Connetti repository a Vercel
3. Imposta variabili d'ambiente
4. Deploy automatico

### Backend (Railway)
1. Connetti repository a Railway
2. Imposta variabili d'ambiente
3. Deploy automatico
4. Database PostgreSQL incluso

### Database
1. Railway: PostgreSQL incluso
2. DigitalOcean: Managed PostgreSQL
3. Supabase: PostgreSQL gratuito

## Costi
- **Vercel**: Gratuito (hobby plan)
- **Railway**: Gratuito (piano base)
- **DigitalOcean**: $5-20/mese
- **Supabase**: Gratuito (piano base)

## Prossimi Passi
1. Creare repository GitHub
2. Configurare variabili d'ambiente
3. Deploy frontend su Vercel
4. Deploy backend su Railway
5. Testare l'applicazione online
