# 小雅老師英文學習機器人 🤖📚

一個由小雅老師帶領的互動式英文單字學習應用程式，使用 Gemini API 提升學習樂趣。

## 🌐 Demo Link

https://your-vercel-url.vercel.app (替換成您的 Vercel 部署連結)

## ✨ Features

*   ✅ **互動式學習介面**：透過聊天與小雅老師學習新單字。
*   ✅ **AI 驅動教學**：Gemini API 動態產生詞性、例句、翻譯與挑戰。
*   ✅ **單字發音**：點擊即可聆聽英文單字和例句的發音。
*   ✅ **鼓勵性回饋**：針對學生回答提供正面肯定與修正建議。
*   ✅ **彈性學習**：支援國中小核心字彙及使用者自訂單字。

## 🛠️ Tech Stack

| Category      | Technology                                         |
|---------------|----------------------------------------------------|
| Framework     | React                                              |
| Language      | TypeScript                                         |
| Styling       | Tailwind CSS                                       |
| AI API        | Google Gemini API (`@google/genai`)                |
| Build Tool    | Vite (建議，配合以下指南)                            |
| Deployment    | Vercel                                             |

## 📋 Prerequisites

*   **Node.js**: `^18.0.0` 或 `^20.0.0` (或更新版本)
*   **npm**: `^9.0.0` 或 `^10.0.0` (或更新版本，通常隨 Node.js 一起安裝)
*   **Git**

## ⚙️ Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://your-github-repository-url/xiao-ya-teacher-bot.git
    cd xiao-ya-teacher-bot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file by copying the example file. If `.env.example` doesn't exist, create `.env.local` directly.
    ```bash
    cp .env.example .env.local 
    ```
    (If `.env.example` is not present, create `.env.local` manually with the content described in the next section.)

4.  **Add your API Key** to `.env.local` (see "Environment Variables" section below).

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if specified by Vite).

    *Note: The above commands assume the project is set up with Vite or a similar build tool that defines an `npm run dev` script. If you are adapting the existing CDN-based structure, you might need to adjust these steps or set up Vite.*

## 🔑 Environment Variables (.env)

You need to create a `.env.local` file in the root of your project and add your Google Gemini API key:

```env
# Rename this file or copy its content to .env.local
# Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```
*   `VITE_GEMINI_API_KEY`: Your Google Gemini API Key. This is required for the application to communicate with the Gemini model.

**Important**:
*   The service file `services/geminiService.ts` currently uses `process.env.API_KEY`. If you are using Vite, you should update it to use `import.meta.env.VITE_GEMINI_API_KEY`.
*   Ensure `.env.local` is listed in your `.gitignore` file to prevent committing your API key.

## 📦 Build & Preview

1.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` folder with the optimized static assets.

2.  **Preview the production build locally:**
    ```bash
    npm run preview # 本機確認 dist 是否正常
    ```
    This command will serve the `dist` folder, allowing you to test the production build before deployment.

## 🚀 Deploy to Vercel

Deploying this project to Vercel is straightforward.

1.  **Push your project to GitHub:**
    Ensure your local Git repository is connected to a remote repository on GitHub and all changes are pushed.

2.  **Import Project on Vercel:**
    *   Log in to your [Vercel](https://vercel.com/) account.
    *   Click "Add New..." -> "Project".
    *   Import your Git repository from GitHub.

3.  **Configure Project:**
    *   **Framework Preset**: Vercel should automatically detect Vite. If not, select "Vite".
    *   **Build and Output Settings**:
        *   Build Command: `npm run build` (or `vite build`)
        *   Output Directory: `dist`
        *   Install Command: `npm install` (or `yarn install`)
    *   **Environment Variables**:
        *   In your Vercel project settings, navigate to "Environment Variables".
        *   Add `VITE_GEMINI_API_KEY` and set its value to your Google Gemini API key. *Note: If your application code (e.g., `geminiService.ts`) is still using `process.env.API_KEY`, then you should set `API_KEY` as the environment variable name on Vercel instead of `VITE_GEMINI_API_KEY`, or update the code to use `import.meta.env.VITE_GEMINI_API_KEY`.*

4.  **Deploy:**
    Click the "Deploy" button. Vercel will build and deploy your application. You'll receive a public URL for your live site.

## 📂 Project Structure (Recommended with Vite)

```
xiao-ya-teacher-bot/
├── public/                  # Static assets
├── src/                     # Source code
│   ├── components/          # React UI components
│   │   └── ChatMessage.tsx
│   ├── services/            # API interaction services
│   │   └── geminiService.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point (replaces index.tsx)
│   ├── types.ts             # TypeScript type definitions
│   └── constants.ts         # Application constants
├── .env.local               # Local environment variables (Git ignored)
├── .env.example             # Example environment variables
├── index.html               # Main HTML entry point (for Vite)
├── package.json             # Project dependencies and scripts
├── vite.config.ts           # Vite configuration file
└── README.md                # This file
```
*Note: The current project structure might differ. This README provides guidance for a standard Vite setup.*

## 🧠 How It Works (Brief Overview)

1.  **Initialization**: The app greets the user.
2.  **User Input**: User can type a word or request the next word.
3.  **Word Teaching**:
    *   `geminiService.ts` calls the Gemini API to get word details (part of speech, example sentence, translation, challenge).
    *   These details are displayed in a teaching card.
4.  **Student Challenge & Feedback**:
    *   User responds to the challenge.
    *   `geminiService.ts` calls Gemini API to evaluate the response and provide encouraging feedback.

## 💡 Future Enhancements

*   User progress tracking.
*   More advanced conversational interactions.
*   Integration of image generation/understanding for visual aids.

---

希望這份 README 對您有所幫助！祝您使用愉快，學習順利！😊
