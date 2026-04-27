# Campus Placement Portal - Production Deployment Guide

## Overview
This guide covers deploying the MERN stack application:
- **Backend:** Render (Node.js + Express)
- **Frontend:** Vercel (Vite + React)
- **Database:** MongoDB Atlas

---

## Backend Deployment (Render)

### Pre-Deployment Checklist
- [ ] MongoDB Atlas cluster created and connection string ready
- [ ] All environment variables configured
- [ ] CORS configured for Vercel frontend domain
- [ ] Render account created

### Environment Variables (Render)
Set these in Render > Environment Variables:

```
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/placementDB
JWT_SECRET=your-secure-jwt-secret-min-32-chars
```

### Render Deployment Steps
1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "Create New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** campus-placement-portal
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`
   - **Root Directory:** `server`
6. Add Environment Variables (as listed above)
7. Click "Deploy Web Service"

### Verify Deployment
```bash
curl https://campus-placement-portal-fwbo.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Placement Portal API is running"
}
```

---

## Frontend Deployment (Vercel)

### Pre-Deployment Checklist
- [ ] `.env.production` configured with backend URL
- [ ] Build tested locally: `npm run build`
- [ ] All API calls use `import.meta.env.VITE_API_URL`
- [ ] Vercel account created

### Environment Variables (Vercel)
Set these in Vercel > Settings > Environment Variables:

```
VITE_API_URL=https://campus-placement-portal-fwbo.onrender.com
```

### Vercel Deployment Steps
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - **Project Name:** campus-placement-portal
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables (as listed above)
7. Click "Deploy"

### Verify Deployment
- Visit: https://campus-placement-portal-iota.vercel.app
- Check browser console for API errors
- Try logging in to test API connectivity

---

## CORS Configuration

### Backend CORS (server/server.js)
Currently allows:
- `https://campus-placement-portal-iota.vercel.app` (Production)
- `http://localhost:5173` (Local development)
- `http://localhost:3000` (Alternative local)

### Adding Additional Frontend URLs
If deploying to another service, update `allowedOrigins` in `server/server.js`:

```javascript
const allowedOrigins = [
  'https://campus-placement-portal-iota.vercel.app', // Vercel
  'https://your-other-domain.com', // Add here
  'http://localhost:5173',
  'http://localhost:3000',
];
```

---

## API Configuration

### Frontend API Base URL
Frontend automatically uses:
- **Production:** `https://campus-placement-portal-fwbo.onrender.com/api`
- **Development:** `http://localhost:5000/api` (via Vite proxy)

### Making API Calls
All API calls are managed in `client/src/api/index.js`:

```javascript
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  return '/api';
};
```

---

## Production Best Practices Implemented

### Backend Security
- ✅ CORS restricted to specific origins
- ✅ Security headers added (CSP, X-Frame-Options, etc.)
- ✅ Enhanced error handling (no stack traces in production)
- ✅ Request logging with Morgan
- ✅ Input validation middleware

### Frontend Security
- ✅ Environment variables for sensitive URLs
- ✅ JWT token management with auto-logout on 401
- ✅ No hardcoded API URLs
- ✅ Vercel security headers configured

### Database Security
- ✅ MongoDB Atlas IP whitelist configured
- ✅ Connection string in environment variables
- ✅ Automatic reconnection on failure

---

## Monitoring & Debugging

### Backend Logs (Render)
1. Go to Render dashboard
2. Select your service
3. Click "Logs" to view real-time logs

### Frontend Errors (Vercel)
1. Go to Vercel dashboard
2. Select your project
3. Click "Analytics" or "Deployments" to check status

### Common Issues

#### 1. CORS Error in Frontend
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`
- **Solution:** Verify your Vercel domain is in `allowedOrigins` on Render
- Redeploy backend after updating CORS

#### 2. 401 Unauthorized
**Problem:** API returns 401 even with valid token
- **Solution:** Check JWT_SECRET matches between frontend & backend
- Clear browser localStorage and login again

#### 3. MongoDB Connection Error
**Problem:** `MongoNetworkError: connect ECONNREFUSED`
- **Solution:** Verify MONGO_URI is correct in Render environment
- Check MongoDB Atlas IP whitelist includes Render IP

#### 4. Build Fails on Vercel
**Problem:** `npm run build` fails during deployment
- **Solution:** Run locally to identify errors
- Check all imports are correct
- Verify environment variables are set

---

## Local Development

### Running Locally
1. Install dependencies:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Create `.env` in `server/`:
   ```
   MONGO_URI=mongodb://localhost:27017/placementDB
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=dev-secret
   ```

3. Start MongoDB locally or use Atlas

4. Run backend:
   ```bash
   cd server && npm start
   ```

5. Run frontend (in new terminal):
   ```bash
   cd client && npm run dev
   ```

6. Access: `http://localhost:5173`

---

## Deployment Checklist

### Before Each Deployment
- [ ] All tests pass locally
- [ ] Build succeeds: `npm run build`
- [ ] No console errors
- [ ] Environment variables verified
- [ ] CORS configuration updated if needed
- [ ] API endpoints tested
- [ ] Git commits clean and descriptive

### After Each Deployment
- [ ] Health check passes
- [ ] Can login successfully
- [ ] API calls work in browser
- [ ] No CORS errors in console
- [ ] Performance acceptable
- [ ] Logs show no errors

---

## Troubleshooting Commands

### Test API Connection
```bash
curl -X GET https://campus-placement-portal-fwbo.onrender.com/api/health
```

### Check Frontend Build
```bash
cd client
npm run build
npm run preview
```

### Verify Environment Variables (Backend)
```javascript
console.log({
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI ? '***' : 'NOT SET',
  nodeEnv: process.env.NODE_ENV,
});
```

---

## Support URLs

- **Frontend:** https://campus-placement-portal-iota.vercel.app
- **Backend API:** https://campus-placement-portal-fwbo.onrender.com/api
- **Health Check:** https://campus-placement-portal-fwbo.onrender.com/api/health
- **GitHub Repo:** https://github.com/Bhavanareddymedikonda/campus_placement_portal

---

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Vite Guide](https://vitejs.dev/)
