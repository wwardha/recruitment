# Environment Configuration Guide

This guide explains how to set up environment variables for different deployment scenarios.

## 🚀 Quick Start

### Development Setup
```bash
# Copy the development environment template
cp .env.example .env

# Edit the .env file with your development settings
nano .env

# Start development environment
docker-compose up -d
```

### Production Setup
```bash
# Copy the production environment template
cp .env.production.example .env.production

# Edit the .env.production file with your production settings
nano .env.production

# Start production environment
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Environment Files

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `.env.example` | Development template | ✅ Yes |
| `.env.production.example` | Production template | ✅ Yes |
| `.env` | Development secrets | ❌ No |
| `.env.production` | Production secrets | ❌ No |

## 🔐 Security Guidelines

### Development Environment
- Use default passwords for convenience
- Keep secrets simple but functional
- Enable debug logging and hot reload

### Production Environment
- **CHANGE ALL DEFAULT PASSWORDS**
- Use strong, unique secrets (minimum 32 characters)
- Enable production logging (JSON format)
- Use cloud storage providers
- Configure proper CORS origins
- Set up monitoring and analytics

## 📋 Required Environment Variables

### Database Configuration
```bash
# PostgreSQL connection
DATABASE_URL=postgresql://user:password@host:port/database
DB_HOST=postgres
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_secure_password
DB_NAME=your_database

# PostgreSQL Docker configuration
POSTGRES_DB=your_database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_secure_password
```

### Authentication
```bash
# JWT Configuration (CRITICAL: Change in production)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
REFRESH_TOKEN_SECRET=your-super-secure-refresh-token-secret
SESSION_SECRET=your-super-secure-session-secret
```

### Email Service
```bash
# Email Provider Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Your Company Name
```

### File Storage
```bash
# Development (Local)
STORAGE_PROVIDER=local
UPLOAD_PATH=./uploads

# Production (Cloud)
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

## 🐳 Docker Compose Files

### Development (`docker-compose.yml`)
- Uses `.env` file
- Includes PostgreSQL, Redis, PgAdmin
- Optimized for development with hot reload
- Exposes database management UI

### Production (`docker-compose.prod.yml`)
- Uses `.env.production` file
- Includes PostgreSQL, Redis, Nginx
- Optimized for production performance
- Includes resource limits and health checks

## 🔧 Environment-Specific Settings

### Development
```bash
NODE_ENV=development
LOG_LEVEL=debug
LOG_FORMAT=pretty
HOT_RELOAD=true
DEBUG=true
```

### Production
```bash
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json
HOT_RELOAD=false
DEBUG=false
```

## 🛠️ Advanced Configuration

### Redis Configuration
```bash
# Development
REDIS_URL=redis://redis:6379

# Production with authentication
REDIS_URL=redis://username:password@redis:6379
```

### CORS Configuration
```bash
# Development
CORS_ORIGIN=http://localhost:3001,http://localhost:3000

# Production
CORS_ORIGIN=https://your-domain.com,https://app.your-domain.com
```

### Rate Limiting
```bash
# Stricter limits for production
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=60  # Requests per window
```

## 🚨 Security Checklist

### Before Production Deployment:

- [ ] **Changed all default passwords**
- [ ] **Generated strong JWT secrets (32+ characters)**
- [ ] **Configured proper CORS origins**
- [ ] **Set up cloud file storage**
- [ ] **Configured production email service**
- [ ] **Enabled proper logging**
- [ ] **Set up monitoring and error tracking**
- [ ] **Configured SSL certificates**
- [ ] **Set appropriate rate limits**
- [ ] **Disabled debug modes**

### Secret Generation
```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT secrets
openssl rand -hex 32     # For session secrets
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify PostgreSQL service is running
   - Confirm credentials match

2. **Authentication Errors**
   - Verify JWT secrets are set
   - Check secret lengths (minimum 32 characters)
   - Ensure secrets match between services

3. **File Upload Issues**
   - Check `STORAGE_PROVIDER` setting
   - Verify AWS credentials for cloud storage
   - Confirm upload directory permissions

4. **Email Not Sending**
   - Verify `SENDGRID_API_KEY`
   - Check `EMAIL_FROM` domain
   - Confirm email provider configuration

### Validation Commands
```bash
# Check environment variables are loaded
docker-compose config

# Verify database connection
docker-compose exec hr-recruitment bun run db:migrate

# Test email configuration
docker-compose exec hr-recruitment bun test:email

# Check file storage
docker-compose exec hr-recruitment bun test:storage
```

## 📞 Support

For environment setup issues:
1. Check this documentation
2. Verify your `.env` file against the examples
3. Check Docker logs: `docker-compose logs`
4. Review the troubleshooting section

---

**⚠️ Remember: Never commit `.env` or `.env.production` files to version control!**