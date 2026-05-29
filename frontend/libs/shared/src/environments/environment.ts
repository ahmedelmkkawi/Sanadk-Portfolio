const RAILWAY_API = 'https://sanadk-portfolio-production.up.railway.app/api';
const LOCAL_API = 'http://localhost:3000/api';

function isLocalHost(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/** Picks Railway on Vercel/preview hosts; localhost when developing locally. */
export const environment = {
  get production(): boolean {
    return !isLocalHost();
  },
  get apiUrl(): string {
    return isLocalHost() ? LOCAL_API : RAILWAY_API;
  },
};
