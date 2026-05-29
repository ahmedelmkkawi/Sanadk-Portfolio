# نشر الباكند على Railway

## 1) إنشاء المشروع

1. ادخل [railway.app](https://railway.app) وسجّل بحساب GitHub.
2. **New Project** → **Deploy from GitHub repo**.
3. اختر `Sanadk-Portfolio`.
4. **Settings** → **Root Directory** → `backend` (مهم جداً في monorepo).
5. Railway يقرأ `railway.toml` تلقائياً:
   - Build: `npm run build`
   - Start: `npm run start:prod`

## 2) متغيرات البيئة (Variables)

في **Variables** أضف:

| Variable | Value |
|----------|--------|
| `MONGODB_URI` | رابط Atlas (يبدأ بـ `mongodb+srv://` — من غير `MONGODB_URI=` في القيمة) |
| `JWT_SECRET` | سلسلة عشوائية طويلة |
| `FRONTEND_URLS` | `https://sanadk-portfolio-ktd9.vercel.app,https://sanadk-portfolio-oeoz.vercel.app,http://localhost:4200,http://localhost:4201` |
| `CLOUDINARY_CLOUD_NAME` | من Cloudinary |
| `CLOUDINARY_API_KEY` | من Cloudinary |
| `CLOUDINARY_API_SECRET` | من Cloudinary |

`PORT` يضيفه Railway تلقائياً — لا تحذفه إن ظهر.

## 3) دومين عام

1. **Settings** → **Networking** → **Generate Domain**.
2. انسخ الرابط، مثال: `https://sanadak-api-production.up.railway.app`
3. اختبر: `https://YOUR-URL.up.railway.app/api` → رسالة ترحيب API.

## 4) ربط الفرونت (Vercel)

عدّل `frontend/libs/shared/src/environments/environment.production.ts`:

```typescript
apiUrl: 'https://YOUR-URL.up.railway.app/api',
```

اعمل commit + push → Redeploy مشروعي الفرونت على Vercel.

## 5) MongoDB Atlas

- **Network Access** → Allow `0.0.0.0/0` (لأن Railway IPs متغيرة).

## 6) إيقاف Vercel للباكند (اختياري)

بعد ما Railway يشتغل، احذف أو عطّل مشروع `sanadk-portfolio-backend` على Vercel لتجنب الالتباس.

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| Build failed | تأكد Root Directory = `backend` |
| `bad auth` | صحّح `MONGODB_URI` من Atlas Connect |
| CORS من الفرونت | أضف روابط Vercel في `FRONTEND_URLS` |
| 502 على Railway | شوف **Deployments** → **View Logs** |
