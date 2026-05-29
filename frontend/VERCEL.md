# Vercel — مشروعان منفصلان (User + Admin)

نفس الريبو، لكن **مشروعين على Vercel** بإعدادات مختلفة.

## مشروع User (`sanadk-portfolio-oeoz`)

| الإعداد | القيمة |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | `npm run build:user` |
| Output Directory | `dist/frontend/browser` |
| Environment (اختياري) | `DEPLOY_TARGET=user` |

يستخدم `vercel.json` في مجلد `frontend`.

## مشروع Admin (`sanadk-portfolio-ktd9`)

| الإعداد | القيمة |
|---------|--------|
| Root Directory | `frontend` |
| Build Command | `npm run build:admin` |
| Output Directory | `dist/admin/browser` |
| Environment | `DEPLOY_TARGET=admin` |

**مهم:** لا تستخدم إعدادات الـ User على مشروع الأدمن.

في Vercel → مشروع **ktd9** → **Settings** → **General**:

1. **Build Command** → Override → `npm run build:admin`
2. **Output Directory** → Override → `dist/admin/browser`
3. **Environment Variables** → أضف `DEPLOY_TARGET` = `admin`
4. **Redeploy**

مرجع: انسخ من `vercel.admin.json` إن احتجت.

## بديل: build واحد بمتغير

لو Build Command = `node scripts/vercel-build.mjs`:

- على مشروع User: `DEPLOY_TARGET=user` (أو بدون المتغير)
- على مشروع Admin: `DEPLOY_TARGET=admin`

**Output Directory** لازم يتظبط يدوياً لكل مشروع (لا يمكن أتمتته في سكربت واحد).
