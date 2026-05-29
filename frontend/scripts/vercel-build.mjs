import { execSync } from 'node:child_process';

const target = (process.env.DEPLOY_TARGET || 'user').toLowerCase().trim();

console.log(`DEPLOY_TARGET=${target}`);

if (target === 'admin') {
  console.log('Building ADMIN app (ng build admin)...');
  execSync('npm run build:admin', { stdio: 'inherit' });
  console.log('Admin output: dist/admin/browser');
} else {
  console.log('Building USER app (ng build frontend)...');
  execSync('npm run build:user', { stdio: 'inherit' });
  console.log('User output: dist/frontend/browser');
}
