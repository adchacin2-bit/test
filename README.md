# LimeGuide 🍋

**AI-Powered MCAT Study Platform for Pre-Med Students**

LimeGuide is a production-ready web application that generates unlimited AI-powered practice questions for biochemistry, physics, and other pre-med subjects. Designed specifically for Samsung tablet users with S Pen support, it provides an adaptive learning experience powered by Anthropic's Claude AI.

## ✨ Features

- 🧠 **Unlimited AI-Generated Questions**: MCAT-style questions powered by Claude Sonnet 4.5
- 📄 **PDF Upload**: Upload your course notes or textbooks to generate custom questions
- 🎯 **Adaptive Difficulty**: Questions adjust based on your performance
- 📊 **Progress Tracking**: Monitor mastery levels, study streaks, and achievements
- 🖊️ **Stylus Support**: Canvas-based scratch pad optimized for Samsung S Pen
- 🌙 **Dark Mode**: Comfortable studying at any time of day
- 🏆 **Achievement System**: Unlock badges and track milestones
- 💾 **Local Storage**: All progress saved in browser (no account required)
- 📱 **PWA Support**: Install on home screen for app-like experience

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
ANTHROPIC_API_KEY=your-api-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

⚠️ **IMPORTANT**: Never commit your `.env.local` file. The API key should only exist on the server.

3. **Run the development server:**

```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📦 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Next.js 15** (App Router)
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Next.js API Routes** (serverless functions)
- **Anthropic Claude API** (claude-sonnet-4-20250514)

### Storage
- **localStorage** for client-side data persistence
- Optional: Supabase for cross-device sync (not implemented yet)

## 🏗️ Project Structure

```
limeguide/
├── app/
│   ├── api/
│   │   ├── process-pdf/route.ts      # PDF processing endpoint
│   │   ├── generate-question/route.ts # Question generation endpoint
│   │   └── generate-explanation/route.ts # Explanation endpoint
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Main app component
│   └── globals.css                   # Global styles
├── components/
│   ├── ui/
│   │   ├── Button.tsx                # Reusable button component
│   │   ├── Card.tsx                  # Card container component
│   │   ├── Loading.tsx               # Loading spinner
│   │   ├── Modal.tsx                 # Modal dialog
│   │   └── ProgressBar.tsx           # Progress bar component
│   ├── WelcomeScreen.tsx             # Landing page
│   ├── Dashboard.tsx                 # Course dashboard
│   ├── CourseDetail.tsx              # Topic selection
│   ├── StudySession.tsx              # Main study interface
│   ├── ResultsScreen.tsx             # Session results
│   └── ScratchPad.tsx                # Canvas scratch pad
├── lib/
│   ├── api.ts                        # Frontend API client
│   ├── storage.ts                    # localStorage manager
│   └── achievements.ts               # Achievement system
├── types/
│   └── index.ts                      # TypeScript type definitions
└── public/
    ├── manifest.json                 # PWA manifest
    └── ICONS_README.txt              # Icon requirements

```

## 🔒 Security & API Key Protection

**Critical**: The API key is stored server-side and NEVER exposed to the client browser.

### How it works:

1. **Client uploads PDF** → Frontend sends to `/api/process-pdf`
2. **Server calls Claude** → API route uses `process.env.ANTHROPIC_API_KEY`
3. **Server returns data** → Processed topics sent back to frontend
4. **Frontend displays** → User sees topics without ever accessing the API key

### Deployment checklist:

- ✅ API key stored in `.env.local` (development)
- ✅ API key set in Vercel environment variables (production)
- ✅ `.env.local` added to `.gitignore`
- ✅ No API key in client-side code
- ✅ All API calls go through Next.js API routes

## 📱 Progressive Web App (PWA)

LimeGuide can be installed on tablets and phones for an app-like experience:

### Installation Instructions:

**On Samsung Tablet (Chrome/Samsung Internet):**
1. Visit the deployed site
2. Tap the menu (⋮) → "Add to Home screen" or "Install app"
3. Confirm installation
4. App icon will appear on home screen

**On iOS (Safari):**
1. Visit the deployed site
2. Tap Share button → "Add to Home Screen"
3. Confirm
4. App icon will appear on home screen

### PWA Features:
- Works offline (after first visit)
- Full-screen mode
- Native-like navigation
- Custom app icon

**Note**: You need to create icon files (`icon-192.png` and `icon-512.png`) and place them in the `/public` directory. See `/public/ICONS_README.txt` for details.

## 🚀 Deployment to Vercel

### One-Click Deployment:

1. **Push to GitHub** (this repository)

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variable:**
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY` = your-api-key
   - Save

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Your app will be live at `your-project.vercel.app`

### Alternative: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add ANTHROPIC_API_KEY

# Deploy to production
vercel --prod
```

### Cost Estimate:
- **Vercel**: Free tier (sufficient for personal use)
- **Anthropic API**: ~$10-15/month for typical student use
  - Each question generation: ~1000-2000 tokens (~$0.006-0.012)
  - Each explanation: ~500-1000 tokens (~$0.003-0.006)
  - 100 questions/day = ~$0.90-1.80/day = ~$27-54/month
  - Realistic usage (20 questions/day) = ~$5-10/month

**Tip**: Set spending limits in [Anthropic Console](https://console.anthropic.com/) to avoid surprises.

## 🎯 How to Use

### 1. Add a Course

1. Click "Add Course" on the dashboard
2. Enter course name (e.g., "Biochemistry")
3. Upload a PDF of your notes or textbook
4. Wait for AI to extract topics (~10-30 seconds)
5. Course appears on dashboard with extracted topics

### 2. Practice Questions

1. Click on a course to view topics
2. Select a topic to practice
3. Answer MCAT-style questions
4. Read detailed explanations
5. Use scratch pad to work through problems

### 3. Track Progress

- **Mastery Level**: Percentage correct for each topic
- **Study Streak**: Consecutive days studied
- **Achievements**: Unlock badges for milestones
- **Time Tracking**: Total hours spent studying

## 🔧 Development

### Available Scripts:

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | No | App URL (for production) |

### Adding New Features:

1. **New API Route**: Create in `app/api/[feature]/route.ts`
2. **New Component**: Add to `components/`
3. **New Type**: Define in `types/index.ts`
4. **Client-side API**: Add function to `lib/api.ts`

## 🐛 Troubleshooting

### "API authentication failed"
- Check that `ANTHROPIC_API_KEY` is set in `.env.local`
- Verify the key is valid in [Anthropic Console](https://console.anthropic.com/)

### "Failed to process PDF"
- Ensure PDF is valid and not corrupted
- Check that file size is reasonable (<10MB)
- Try a different PDF

### Questions are repetitive
- This shouldn't happen with Claude AI, but if it does:
- Clear browser cache/localStorage
- Try different topics
- Report the issue

### Dark mode not persisting
- Check that browser allows localStorage
- Try in a different browser
- Clear browser data and try again

### Scratch pad not working
- Ensure touch events are supported
- Try in a different browser
- Check that `enableScratchPad` is true in settings

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

1. Open an issue describing the bug/feature
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own studying or as a template for similar projects.

## 🙏 Acknowledgments

- **Anthropic** for the Claude API
- **Next.js** team for the amazing framework
- **Tailwind CSS** for beautiful styling
- All pre-med students grinding toward their dreams 💪

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check Anthropic API status: https://status.anthropic.com/
- Verify Vercel deployment: https://vercel.com/docs

---

**Built with 💚 for pre-med students everywhere**

Good luck on your MCAT! 🎓
