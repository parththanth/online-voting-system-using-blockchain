# VoteGuard Deployment Update Workflow

## 🔄 How to Update Your Public Deployment

Your VoteGuard app uses LocalTunnel to create a public URL that tunnels to your local development server. This means **any changes you make locally will automatically appear on the public URL** - no separate deployment needed!

## 📋 Workflow Steps

### 1. **Fix Bugs Locally**
```bash
# Work on your code normally
npm run dev
# Test at http://localhost:5173
```

### 2. **Test Changes**
- Make your bug fixes
- Test thoroughly on localhost
- Ensure everything works as expected

### 3. **Update Public Deployment**
```bash
# Stop current public deployment
./stop-public.sh

# Start fresh public deployment with your fixes
./start-public.sh
```

### 4. **Verify Public URL**
- Visit https://voteguard.loca.lt
- Test all functionality
- Confirm bugs are fixed

## 🚀 Quick Commands

```bash
# Start public deployment
./start-public.sh

# Stop public deployment  
./stop-public.sh

# Local development only
npm run dev
```

## 💡 Pro Tips

- **Real-time Updates**: Once public deployment is running, any code changes will hot-reload automatically
- **Same Codebase**: The public URL shows exactly what's running locally
- **No Build Step**: Changes appear instantly without rebuilding
- **Environment**: Make sure your `.env` file has all required API keys

## 🐛 Debugging Workflow

1. **Develop Locally**: Fix bugs on `localhost:5173`
2. **Test Locally**: Ensure everything works
3. **Update Public**: Restart public deployment
4. **Test Public**: Verify fixes work on public URL
5. **Share**: Send public URL to users for testing

## 📱 Mobile Testing

The public URL works great for testing on mobile devices:
- Share https://voteguard.loca.lt with testers
- Test SMS OTP on real phones
- Verify face recognition on mobile cameras
