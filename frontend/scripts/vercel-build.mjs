import { execSync } from 'node:child_process';

const target = (process.env.DEPLOY_TARGET || 'user').toLowerCase();

if (target === 'admin') {
  console.log('Vercel build: admin app');
  execSync('npm run build:admin', { stdio: 'inherit' });
} else {
  console.log('Vercel build: user app');
  execSync('npm run build:user', { stdio: 'inherit' });
}
