#!/bin/bash

echo "🚀 Preparazione per il deploy di GymFonty..."

# 1. Installare dipendenze
echo "📦 Installando dipendenze..."
cd web && npm install
cd ../server && npm install

# 2. Build del frontend
echo "🔨 Building frontend..."
cd ../web && npm run build

# 3. Build del backend
echo "🔨 Building backend..."
cd ../server && npm run build

# 4. Creare file .env per produzione
echo "⚙️ Creando file di configurazione..."

# Backend .env
cat > server/.env << EOF
DATABASE_URL="postgresql://username:password@localhost:5432/gymfonty"
JWT_SECRET="$(openssl rand -base64 32)"
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN="https://your-frontend-domain.vercel.app"
CORS_ORIGINS="https://your-frontend-domain.vercel.app"
CLOUD_STORAGE_TYPE="local"
UPLOAD_DIR="./uploads"
EOF

# Frontend .env.local
cat > web/.env.local << EOF
NEXT_PUBLIC_API_URL="https://your-backend-domain.railway.app"
NEXTAUTH_URL="https://your-frontend-domain.vercel.app"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
EOF

echo "✅ Preparazione completata!"
echo ""
echo "📋 Prossimi passi:"
echo "1. Push del codice su GitHub"
echo "2. Deploy frontend su Vercel"
echo "3. Deploy backend su Railway"
echo "4. Aggiornare le variabili d'ambiente con i domini reali"
echo ""
echo "🔗 Vedi deploy-guide.md per istruzioni dettagliate"
