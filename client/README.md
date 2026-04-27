# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Tailwind CSS

This project is configured to use Tailwind CSS v3 (as specified in `package.json`) with PostCSS integration. To customize styles, edit `tailwind.config.js` and `src/index.css`.

## Backend (.env) configuration

Server-side configuration is managed through environment variables. Create a `.env` file in the `server/` folder (or in your deployment system) with values like:

```env
MONGO_URI=mongodb://localhost:27017/placementDB
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
SEND_EMAILS=false
FROM_EMAIL=no-reply@yourdomain.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
```

For production, set `MONGO_URI` to your MongoDB Atlas connection string, and optionally set `SEND_EMAILS=true` with working SMTP settings.

