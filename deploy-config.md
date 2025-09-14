# 🔧 Configurazione Deploy

## Variabili d'ambiente Backend (.env)
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

## Variabili d'ambiente Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.railway.app"
NEXTAUTH_URL="https://your-frontend-domain.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

## Deploy Steps

### 1. Frontend (Vercel)
1. Vai su [vercel.com](https://vercel.com)
2. Connetti repository GitHub
3. Imposta variabili d'ambiente:
   - `NEXT_PUBLIC_API_URL`: URL del backend
   - `NEXTAUTH_URL`: URL del frontend
   - `NEXTAUTH_SECRET`: Chiave segreta

### 2. Backend (Railway)
1. Vai su [railway.app](https://railway.app)
2. Connetti repository GitHub
3. Imposta variabili d'ambiente:
   - `DATABASE_URL`: URL del database PostgreSQL
   - `JWT_SECRET`: Chiave segreta JWT
   - `FRONTEND_ORIGIN`: URL del frontend
   - `CORS_ORIGINS`: URL del frontend

### 3. Database
Railway include PostgreSQL automaticamente. Per altri provider:
- **Supabase**: PostgreSQL gratuito
- **DigitalOcean**: Managed PostgreSQL
- **AWS RDS**: PostgreSQL gestito

## Test Deploy
1. Verifica che il frontend si connetta al backend
2. Testa il login
3. Verifica la creazione di clienti
4. Controlla l'export dei profili
