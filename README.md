# MindLoom AI: Calm Weaver

Build a world-class, production-ready mental well-being platform called "MindLoom AI" designed for high-stress daily environments.

### 1. UI/UX & Visual Aesthetics

- Theme: Deep indigo/dark-mode theme with vibrant glassmorphism effects, ambient neon glows, micro-interactions, and smooth UI state transitions.

- Navigation: Clean top navigation bar featuring the "MindLoom AI" brand, active status badge ("Gemini 1.5 Powered"), and quick action buttons.

- Dashboard Layout: Two-column layout on desktop, responsive stack on mobile.

  - Left Column (Journaling & Context Input):

    - Multi-line journal text area with word counter, voice dictation mock UI, and quick emotion tags/pills (e.g., #AcademicStress, #Overwhelmed, #Burnout, #LateNight).

    - Prominent CTA button: "Process Reflection" with active processing states and micro-animations.

  - Right Column (AI Insight Output Panel):

    - Show an engaging empty state illustration/placeholder before submission.

    - Upon processing, reveal three structured glassmorphism response cards:

      1. Primary Emotion Detected (with an animated mood badge and confidence scale).

      2. Empathetic Insight (2-sentence compassionate analysis).

      3. Actionable Micro-Task (interactive 1-minute mindfulness/breathing routine with an interactive countdown timer).

### 2. Built-in AI Integration & Features

- Use Lovable's built-in AI connector to evaluate journal entries.

- Ensure streaming response output so text renders smoothly token-by-token.

- Fallback/Mock Mode: If API key/connection is missing, gracefully default to local realistic sample analysis without crashing.

### 3. Extra High-Impact Features (Judges' Wow-Factor)

- Analytics Dashboard Tab: Visual mood trends over time using interactive area/line charts (showing Emotional Balance, Stress Levels, and Reflection Streak).

- Responsible AI & Safety Banner: Fixed bottom disclaimer: "MindLoom provides wellness support, not medical diagnosis or clinical treatment."

- Export & Share: Allow exporting insights as a clean downloadable PDF/Image or copyable summary.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5db83378-e815-4c89-8bf0-5d583c63632c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
