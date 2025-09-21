# TRIBOT Deployment Guide

## 🚀 Quick Deploy Options

### 1. Netlify (Recommended for Static Hosting)
1. Fork/clone this repository
2. Connect your GitHub account to [Netlify](https://netlify.com)
3. Create new site from Git
4. Select your repository
5. Set build command: `npm run build`
6. Set publish directory: `dist`
7. Add environment variables in Netlify dashboard

### 2. Vercel
1. Connect your GitHub account to [Vercel](https://vercel.com)
2. Import your repository
3. Framework preset: Vite
4. Add environment variables in project settings

### 3. GitHub Pages (with GitHub Actions)
1. Enable GitHub Pages in repository settings
2. Use GitHub Actions workflow for automatic deployment

## 🔐 Environment Variables Required

Create these environment variables in your hosting platform:

```env
VITE_OPENAI_API_KEY=your_azure_openai_api_key
VITE_OPENAI_BASE_URL=https://your-resource.openai.azure.com
VITE_OPENAI_API_VERSION=2025-01-01-preview
VITE_DEPLOYMENT_NAME=gpt-4o
VITE_WHISPER_API_KEY=your_whisper_api_key
VITE_WHISPER_API_ENDPOINT=your_whisper_endpoint
```

## 🛠️ Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Add your Azure OpenAI credentials
5. Start development server: `npm run dev`

## 📝 Build Commands

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## 🔒 Security Notes

- Never commit your `.env` file
- Use different API keys for development and production
- Monitor API usage in Azure portal
- Implement rate limiting for production use

## 📊 Monitoring

- Azure OpenAI metrics in Azure portal
- Application insights for performance monitoring
- Error tracking with Sentry (recommended)
