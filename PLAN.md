# LimeGuide Implementation Plan

## Project Overview
LimeGuide is an AI-powered study companion designed for pre-med students preparing for the MCAT. The application combines PDF topic extraction, adaptive MCAT-style question generation, detailed explanations, and tablet-friendly study tools such as a stylus-enabled scratch pad. The backend proxies requests to Anthropic's Claude API so the client never handles the API key directly.

## Tech Stack Summary
- **Frontend:** React 18 + TypeScript via Next.js App Router, bundled by Vite-like tooling built into Next.js. Tailwind CSS for styling with optional shadcn/ui components. lucide-react supplies iconography.
- **Backend:** Next.js API routes host server-side logic that proxies Claude API calls. Deploy to Vercel (preferred) or Railway/Cloudflare Workers as alternatives.
- **AI:** Anthropic Claude model `claude-sonnet-4-20250514`, keyed via server environment variable.
- **Storage:** Browser `localStorage` for progress tracking with optional Supabase sync.

## Major Features & Flow
1. **PDF Topic Extraction**
   - User uploads PDF.
   - Frontend sends multipart/form-data to `/api/process-pdf`.
   - Backend converts PDF to base64 and requests Claude topic extraction.
   - Returns ~5-8 topics saved locally.
2. **Question Generation**
   - `/api/generate-question` produces MCAT-style questions based on topic, course, and recent performance.
   - Prompts enforce tricky wording, 4-6 options, clinical scenarios, and adaptive difficulty context.
3. **Answer Explanations**
   - `/api/generate-explanation` evaluates the user's answer, confirms correctness, clarifies key insights, and suggests next steps.
4. **Progress Tracking**
   - `localStorage` persists mastery per topic, streaks, total study time, and achievements.
5. **Tablet Optimization**
   - Stylus-enabled scratch pad, responsive layouts, large touch targets, dark mode, and PWA support.

## Core Files & Responsibilities
- `app/page.tsx`: Main dashboard coordinating authentication-free study flow.
- `components/WelcomeScreen.tsx`: Highlights product value and entry CTA.
- `components/Dashboard.tsx`: Displays courses, progress stats, and achievements.
- `components/CourseDetail.tsx`: Topic management, PDF upload, and study settings.
- `components/StudySession.tsx`: Question display, answer handling, explanation requests, adaptive difficulty.
- `components/ResultsScreen.tsx`: Summaries, achievements, export options.
- `components/ScratchPad.tsx`: Canvas-based stylus drawing with clear/reset.
- `lib/api.ts`: Client helper for API interactions with error handling.
- `lib/storage.ts`: Local persistence utilities and data schema conversions.
- `lib/achievements.ts`: Achievement definitions and trigger evaluation logic.
- `types/index.ts`: Shared TypeScript interfaces for core entities.

## API Route Specifications
### `/api/process-pdf`
- **Method:** POST
- **Input:** multipart/form-data, key `file` (PDF), plus optional course metadata.
- **Steps:** Validate file, convert to base64, craft Claude document prompt, parse topic list.
- **Output:** `{ topics: TopicSummary[] }` or `{ error, details }`.

### `/api/generate-question`
- **Method:** POST (JSON body)
- **Input:** `topicName`, `courseName`, optional `previousAnswers`, `difficulty`.
- **Prompt Requirements:** MCAT difficulty, tricky wording, 4-6 options, focus on understanding, plausible distractors.
- **Output:** Structured question JSON sanitized from Claude response.

### `/api/generate-explanation`
- **Method:** POST (JSON body)
- **Input:** Question payload, `userAnswerIndex`, `correctIndex`, topic/course context.
- **Output:** `{ isCorrect, correctAnswer, yourAnswer, keyInsight, nextSteps }`.

## Data Modeling
- `Topic`: id, name, mastery %, attempted count, correct count, last practiced timestamp.
- `Course`: id, name, topics[], added/last accessed timestamps.
- `Question`: prompt, options, correct index, difficulty, concept, optional topic linkage and embedded explanation.
- `Explanation`: correctness evaluation, answer strings, insight, next steps.
- `UserProgress`: streak metrics, total hours, total questions, last study date.

## Styling Guidelines
- Tailwind color palette: primary `#2d5016`, accent `#84cc16`, sage `#86efac`.
- Frequent gradient backgrounds (`bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50`).
- Rounded cards (`rounded-2xl`), deep shadows (`shadow-2xl`), generous padding for touch devices.
- Ensure dark mode parity and maintain 44x44px touch targets.

## Achievement System
Triggers (e.g., first question answered, streak milestones, total questions, study hours, topics mastered) award themed badges displayed in the results screen. Achievements evaluated after sessions with persistent storage.

## Deployment Checklist
- Configure `ANTHROPIC_API_KEY` in Vercel environment.
- Verify API routes, question diversity, explanation quality, and localStorage persistence.
- Confirm responsive design and stylus functionality on Samsung tablets.
- Enable PWA installation and inspect for console errors.

## Cost & Security Notes
- Anthropic usage estimated at $10–$15/month with Claude Sonnet, with spending limits enforced.
- Never expose API keys to the client; rely on server environment variables and backend validation.
- Consider caching questions and implementing rate limits for cost control.

## Next Steps
1. Initialize Next.js project with TypeScript and Tailwind.
2. Scaffold API routes and shared types.
3. Build frontend components iteratively, starting with course management and study sessions.
4. Layer in localStorage persistence, achievements, and stylus scratch pad.
5. Polish styling, dark mode, and PWA manifest before deployment.
6. Deploy to Vercel and complete end-to-end QA on tablet hardware.
