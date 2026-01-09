# Runbook - KarasuEmlak v4

## 🚀 Quick Start

### Development
```bash
# Start both apps
npm run dev

# Start web only (port 3000)
npm run dev:web

# Start admin only (port 3001)
npm run dev:admin

# Clean and restart web
npm run dev:clean:web

# Clean and restart admin
npm run dev:clean:admin

# Clean everything
npm run dev:clean
```

### Health Checks
```bash
# Web health check (with timeout)
curl --max-time 2 http://localhost:3000/healthz

# Admin health check (with timeout)
curl --max-time 2 http://localhost:3001/healthz
```

## 🔧 Common Operations

### Port Management
```bash
# Check what's running on ports
lsof -ti:3000  # Web
lsof -ti:3001  # Admin

# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Database Operations
```bash
# Generate missing images
npm run scripts:generate-images

# Add placeholder images
npm run scripts:add-placeholders

# Add test listings
npm run scripts:add-test-listings
```

### Build & Deploy
```bash
# Build all apps
npm run build

# Build web only
npm run build:web

# Build admin only
npm run build:admin

# Type check
npm run typecheck

# Lint
npm run lint
```

## 🐛 Troubleshooting

### Dev Server Won't Start
1. Check ports: `lsof -ti:3000,3001`
2. Kill processes: `lsof -ti:3000,3001 | xargs kill -9`
3. Clean: `npm run dev:clean`
4. Restart: `npm run dev`

### Homepage Hangs
1. Check database connection
2. Check Supabase status
3. Verify timeout is working (should render with empty data)
4. Check logs: `apps/web/.next/server.log`

### Build Fails
1. Clean: `npm run clean:all`
2. Reinstall: `rm -rf node_modules && pnpm install`
3. Check TypeScript errors: `npm run typecheck`
4. Check lint errors: `npm run lint`

### Health Check Fails
- Should return instantly (<100ms)
- If slow, check middleware
- If fails, check routing

## 📊 Monitoring

### Health Endpoints
- Web: `http://localhost:3000/healthz`
- Admin: `http://localhost:3001/healthz`

### Performance Targets
- Dev server start: <10s
- Homepage render: <3s (even with empty data)
- Health check: <100ms
- API routes: <10s (configurable)

### Logs
- Web: `apps/web/.next/server.log`
- Admin: `apps/admin/.next/server.log`
- Check for timeout errors
- Check for database connection errors

## 🔐 Security

### Environment Variables
- Never commit `.env.local`
- Use `.env.example` as template
- Rotate keys regularly
- Use different keys for dev/prod

### Database Access
- Public site: `anon` key (read-only)
- Admin: Session-based (RLS)
- Service role: Server-only

### Secrets
- OpenAI API key: Server-only
- Supabase service_role: Server-only
- Cloudinary credentials: Server-only

## 🚨 Emergency Procedures

### Database Down
1. Homepage should still render (empty data)
2. Check Supabase status
3. Verify timeout is working
4. Check error logs

### High Load
1. Check rate limits (AI generation)
2. Check database connections
3. Verify health endpoints
4. Scale if needed

### Security Incident
1. Rotate all API keys
2. Check audit logs
3. Review RLS policies
4. Update dependencies

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEV_RULES.md](./DEV_RULES.md) - Development rules
- [SEO_SYSTEM.md](./SEO_SYSTEM.md) - SEO implementation

