const crypto = require('crypto');

console.log('🔐 Generazione Chiavi Segrete per Deploy\n');

// Genera chiavi segrete sicure
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('📋 VARIABILI PER VERCEL (Frontend):');
console.log('=====================================');
console.log(`NEXT_PUBLIC_API_URL=https://gymfonty-backend.railway.app`);
console.log(`NEXTAUTH_URL=https://gymfonty-frontend.vercel.app`);
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
console.log('');

console.log('🚂 VARIABILI PER RAILWAY (Backend):');
console.log('====================================');
console.log(`DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`FRONTEND_ORIGIN=https://gymfonty-frontend.vercel.app`);
console.log(`CORS_ORIGINS=https://gymfonty-frontend.vercel.app`);
console.log(`PORT=4000`);
console.log(`NODE_ENV=production`);
console.log('');

console.log('📝 ISTRUZIONI:');
console.log('==============');
console.log('1. Copia le variabili VERCEL e inseriscile in Vercel Dashboard');
console.log('2. Copia le variabili RAILWAY e inseriscile in Railway Dashboard');
console.log('3. Dopo il deploy, aggiorna gli URL con quelli reali');
console.log('4. Testa l\'applicazione online!');
console.log('');

console.log('🎯 ORDINE DI DEPLOY:');
console.log('====================');
console.log('1. Prima: Deploya backend su Railway');
console.log('2. Secondo: Deploya frontend su Vercel');
console.log('3. Terzo: Aggiorna le variabili con URL reali');
console.log('4. Quarto: Testa l\'applicazione');
