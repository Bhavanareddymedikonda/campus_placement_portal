# Production Deployment Troubleshooting Guide - Login Fix

## 🔍 Frontend-Backend Connectivity Check

### Current Configuration Status ✅

**Frontend API Configuration:**
- File: `client/src/api/index.js`
- Uses: `import.meta.env.VITE_API_URL`
- Environment Variable: `VITE_API_URL`
- Production Value: `https://campus-placement-portal-fwbo.onrender.com`
- API Routes: All prefixed with `/api`

**Backend CORS Configuration:**
- File: `server/server.js`
- Allowed Origins:
  - ✅ `https://campus-placement-portal-iota.vercel.app` (Production)
  - ✅ `http://localhost:5173` (Local Dev)
  - ✅ `http://localhost:3000` (Alternative Dev)
- Credentials: ✅ Enabled
- Methods: ✅ GET, POST, PUT, DELETE, PATCH, OPTIONS

**Port Configuration:**
- Backend: `process.env.PORT || 5000`
- Database: `process.env.MONGO_URI || mongodb://localhost:27017/placementDB`

---

## 🛠️ Debugging Steps for Login Failure

### Step 1: Check Vercel Environment Variables
**What to check:** Ensure `VITE_API_URL` is set in Vercel

```
1. Go to vercel.com
2. Select your project > Settings
3. Go to Environment Variables
4. Verify VITE_API_URL = https://campus-placement-portal-fwbo.onrender.com
5. Trigger a redeployment if changed
```

### Step 2: Check Browser Console for CORS Errors
**Expected error if CORS fails:**
```
Access to XMLHttpRequest at 'https://campus-placement-portal-fwbo.onrender.com/api/auth/login' 
from origin 'https://campus-placement-portal-iota.vercel.app' has been blocked by CORS policy
```

**Solution:** Verify backend CORS configuration includes your Vercel domain

### Step 3: Test API Directly from Browser Console
```javascript
// Paste this in browser console on production site:
const apiUrl = import.meta.env.VITE_API_URL;
console.log('API Base URL:', apiUrl);
console.log('Login Endpoint:', apiUrl ? `${apiUrl}/api/auth/login` : '/api/auth/login');

// Test CORS preflight:
fetch(apiUrl + '/api/auth/login', {
  method: 'OPTIONS',
  headers: {
    'Origin': window.location.origin,
    'Access-Control-Request-Method': 'POST',
  }
}).then(r => {
  console.log('CORS Preflight Status:', r.status);
  console.log('CORS Headers:', r.headers);
}).catch(err => console.error('CORS Preflight Error:', err));
```

### Step 4: Test Login API Call
```javascript
// Paste in browser console to test login:
const apiUrl = import.meta.env.VITE_API_URL;
const loginUrl = apiUrl ? `${apiUrl}/api/auth/login` : '/api/auth/login';

fetch(loginUrl, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@college.edu',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(data => console.log('Login Response:', data))
.catch(err => console.error('Login Error:', err));
```

### Step 5: Check Backend Logs (Render Dashboard)
```
1. Go to render.com
2. Select your service
3. Check Logs for:
   - ✅ "Server running on port X"
   - ✅ "MongoDB Connected"
   - ❌ "CORS blocked request from origin"
   - ❌ Connection errors
```

### Step 6: Verify Environment Variables on Render
```
1. Go to render.com > Your Service > Settings
2. Verify these are set:
   - PORT = (should auto-set by Render)
   - MONGO_URI = your MongoDB Atlas connection
   - JWT_SECRET = your secret key
   - NODE_ENV = production (optional)
```

---

## 🔧 Potential Issues & Solutions

### Issue 1: CORS Error in Browser Console
**Error Message:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Check List:**
- [ ] Vercel domain exists in backend `allowedOrigins`
- [ ] Backend was redeployed after CORS change
- [ ] `credentials: true` is set in CORS options
- [ ] Frontend is sending requests to correct API URL

**Fix:** Update `server/server.js` CORS if needed
```javascript
const allowedOrigins = [
  'https://campus-placement-portal-iota.vercel.app', // Must match exact Vercel URL
  'http://localhost:5173',
  'http://localhost:3000',
];
```

### Issue 2: Network Error (Connection Refused)
**Error Message:**
```
Failed to fetch: POST https://campus-placement-portal-fwbo.onrender.com/api/auth/login
ERR_FAILED
```

**Possible Causes:**
- [ ] Backend service is not running on Render
- [ ] Backend URL is incorrect in `.env.production`
- [ ] Network connectivity issue
- [ ] Firewall blocking connection

**Fix:**
1. Test backend health check:
   ```bash
   curl https://campus-placement-portal-fwbo.onrender.com/api/health
   ```
2. Check Render service status in dashboard
3. Check backend logs for startup errors

### Issue 3: 401 Unauthorized (Invalid Credentials)
**Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Causes:**
- User doesn't exist in database
- Password incorrect
- Account deactivated

**Check:**
```javascript
// Test if user exists:
// Try default credentials: admin@college.edu / admin123
// Or register a new user first
```

### Issue 4: 500 Internal Server Error
**Response:**
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

**Causes:**
- MongoDB connection failed
- JWT_SECRET not set
- Unhandled error in controller

**Fix:**
1. Check Render backend logs
2. Verify `JWT_SECRET` is set in environment variables
3. Verify `MONGO_URI` is set and accessible

### Issue 5: Blank Screen / No API Response
**Symptom:** Page loads but no login form or API calls happening

**Likely Cause:** `VITE_API_URL` not set in Vercel environment

**Fix:**
1. Go to Vercel project settings
2. Add environment variable: `VITE_API_URL=https://campus-placement-portal-fwbo.onrender.com`
3. Redeploy the project
4. Clear browser cache (Ctrl+F5)

---

## ✅ Production Connectivity Verification Checklist

### Frontend (Vercel)
- [ ] Vercel project deployed
- [ ] VITE_API_URL environment variable set
- [ ] Latest code pushed to GitHub
- [ ] Build logs show no errors
- [ ] Network tab shows requests to correct backend URL

### Backend (Render)
- [ ] Render service deployed
- [ ] MongoDB URI set in environment
- [ ] JWT_SECRET set in environment
- [ ] Health check passes: `curl https://backend-url/api/health`
- [ ] CORS allows Vercel frontend domain

### Authentication Flow
- [ ] Frontend can reach backend API
- [ ] CORS preflight succeeds
- [ ] Login endpoint responds (even with invalid credentials)
- [ ] JWT token returned on successful login
- [ ] Token stored in localStorage
- [ ] Subsequent requests include Authorization header

---

## 📊 API Endpoints Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|----------------|
| `/api/auth/register` | POST | Create new account | No |
| `/api/auth/login` | POST | Login user | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/users` | GET | List all users | Yes |
| `/api/jobs` | GET | List all jobs | Yes |
| `/api/applications` | GET | List applications | Yes |
| `/api/health` | GET | Health check | No |

---

## 🔐 Security Checklist

- [x] CORS restricted to Vercel domain
- [x] JWT tokens used for authentication
- [x] Passwords hashed (bcrypt)
- [x] Security headers configured
- [x] Environment variables not hardcoded
- [x] HTTPS enforced in production

---

## 📱 Local Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend URL** | `http://localhost:5173` | `https://campus-placement-portal-iota.vercel.app` |
| **Backend URL** | `http://localhost:5000` | `https://campus-placement-portal-fwbo.onrender.com` |
| **API Proxy** | Vite proxy to localhost | Direct API calls |
| **Env Variable** | Empty (uses proxy) | Set in `.env.production` |
| **CORS** | localhost:5173 | Vercel domain |
| **Database** | Local MongoDB | MongoDB Atlas |
| **Error Stack** | Full stack traces | Generic messages |

---

## 🚀 Quick Deployment Fix Checklist

1. **Frontend (Vercel):**
   - [ ] Check if VITE_API_URL environment variable is set
   - [ ] If not set, add it: `https://campus-placement-portal-fwbo.onrender.com`
   - [ ] Trigger redeployment
   - [ ] Clear browser cache (Ctrl+F5)

2. **Backend (Render):**
   - [ ] Verify service is running (check dashboard)
   - [ ] Test health endpoint: `curl https://campus-placement-portal-fwbo.onrender.com/api/health`
   - [ ] Check logs for errors
   - [ ] Verify environment variables set

3. **Test Login:**
   - [ ] Try demo credentials: admin@college.edu / admin123
   - [ ] Check browser console for errors
   - [ ] Check Network tab for failed requests
   - [ ] Check backend logs for CORS blocks

---

## 📝 Common Login Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| CORS error | Backend doesn't allow frontend domain | Add domain to CORS allowedOrigins |
| Connection refused | Backend not running | Check Render service status |
| 401 Unauthorized | Wrong credentials | Try demo account or register new |
| 500 Error | Backend error | Check server logs, verify JWT_SECRET |
| Network error | Wrong API URL | Verify VITE_API_URL in Vercel |
| Blank screen | Frontend not loading API URL | Clear cache, hard refresh (Ctrl+F5) |

---

## 🔗 Related Configuration Files

- Frontend API: `client/src/api/index.js`
- Frontend Context: `client/src/context/AuthContext.jsx`
- Frontend Login: `client/src/pages/auth/Login.jsx`
- Backend CORS: `server/server.js`
- Backend Auth: `server/middleware/auth.js`
- Auth Controller: `server/controllers/authController.js`
- DB Connection: `server/config/db.js`

---

## 💡 Debug Console Script

Copy and paste this into browser console to get full diagnostic info:

```javascript
(async () => {
  console.log('=== Production Deployment Diagnostics ===\n');
  
  // 1. Check environment
  console.log('Frontend URL:', window.location.origin);
  console.log('API Base URL:', import.meta.env.VITE_API_URL);
  console.log('Environment:', import.meta.env.MODE);
  
  // 2. Test backend connection
  try {
    const healthCheck = await fetch(
      (import.meta.env.VITE_API_URL || '') + '/api/health'
    );
    console.log('\n✅ Backend Connection:', healthCheck.ok ? 'OK' : 'FAILED');
    console.log('Status:', healthCheck.status);
    const data = await healthCheck.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('\n❌ Backend Connection Failed:', err.message);
  }
  
  // 3. Test CORS
  console.log('\n--- CORS Test ---');
  try {
    const corsTest = await fetch(
      (import.meta.env.VITE_API_URL || '') + '/api/auth/login',
      {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type',
        }
      }
    );
    console.log('CORS Preflight:', corsTest.ok ? 'OK' : 'FAILED');
    console.log('Access-Control-Allow-Origin:', corsTest.headers.get('Access-Control-Allow-Origin'));
  } catch (err) {
    console.error('CORS Test Error:', err.message);
  }
  
  console.log('\n=== End Diagnostics ===');
})();
```

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Express.js:** https://expressjs.com/
- **CORS Issues:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
