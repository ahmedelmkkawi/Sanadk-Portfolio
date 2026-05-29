# Vercel — مشروعان منفصلان (User + Admin)

نفس الريبو، لكن **مشروعين على Vercel** بإعدادات مختلفة.

## مشروع User (`sanadk-portfolio-oeoz`)

| الإعداد | القيمة |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | من `vercel.json`: `node scripts/vercel-build.mjs` |
| **Output Directory** | **`dist/frontend/browser`** ← Override في لوحة Vercel |
| Environment (اختياري) | `DEPLOY_TARGET=user` أو اترك المتغير غير معرّف |

في Build logs لازم تشوف: `DEPLOY_TARGET=user` و `Building USER app`.

## مشروع Admin (`sanadk-portfolio-ktd9`) — مهم جداً

`vercel.json` يستخدم `node scripts/vercel-build.mjs` لكل المشاريع.

| الإعداد | القيمة |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | *(من vercel.json)* `node scripts/vercel-build.mjs` — لا تغيّره لـ `build:user` |
| **Output Directory** | **`dist/admin/browser`** ← Override في لوحة Vercel |
| **Environment Variable** | **`DEPLOY_TARGET`** = **`admin`** ← بدونها يبني موقع اليوزر |

### خطوات ktd9 (بالترتيب)

1. **Settings** → **Environment Variables** → Add:
   - Name: `DEPLOY_TARGET`
   - Value: `admin`
   - Environments: Production + Preview
2. **Settings** → **General** → **Output Directory** → **Override** → `dist/admin/browser`
3. **Deployments** → **Redeploy** (مع Clear cache)
4. في **Build logs** لازم تشوف:
   - `DEPLOY_TARGET=admin`
   - `Building ADMIN app`
   - مش `build:user` ولا `home-component`

مرجع: انسخ من `vercel.admin.json` إن احتجت.

## بديل: build واحد بمتغير

لو Build Command = `node scripts/vercel-build.mjs`:

- على مشروع User: `DEPLOY_TARGET=user` (أو بدون المتغير)
- على مشروع Admin: `DEPLOY_TARGET=admin`

**Output Directory** لازم يتظبط يدوياً لكل مشروع (لا يمكن أتمتته في سكربت واحد).
