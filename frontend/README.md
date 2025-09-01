# AIchat - Interactive AI Chat Assistant

A sophisticated AI chat interface built with React, TypeScript, and modern web technologies. Features include voice input/output, real-time analytics, defensive mode responses, and multiple personality modes.

## 🚀 Features

- **Voice Input/Output**: Speech recognition and text-to-speech capabilities
- **Real-time Analytics**: Track conversation metrics and popular topics
- **Defensive Mode**: AI responses with built-in reasoning and defenses
- **Multiple Personalities**: Switch between friendly, logical, playful, and confident tones
- **Quick Actions**: Pre-defined conversation starters
- **Transcript Download**: Export chat conversations as text files
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Accessibility**: Full keyboard navigation and screen reader support

## 🛠️ Technologies Used

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Recharts** - Data visualization for analytics
- **Lucide React** - Beautiful, customizable icons
- **Vite** - Fast build tool and development server

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd projectAI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
projectAI/
├── src/
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── switch.tsx
│   │   │   └── tooltip.tsx
│   │   └── AIchat.tsx         # Main chat component
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # React entry point
│   └── index.css             # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Usage

### Basic Chat
- Click the floating chat button in the bottom-right corner
- Type your message and press Enter or click the send button
- The AI will respond with contextual information

### Voice Features
- Click the microphone button to enable voice input
- Speak your message clearly
- The AI will respond with both text and voice output

### Quick Actions
- Use the quick action buttons (Hello, Help, Tech, Code) for instant responses
- These provide common conversation starters

### Analytics
- Click the analytics button to view conversation statistics
- See total messages, user/AI message counts, and popular topics
- Toggle defensive mode and view personality settings

### Personality Modes
- Click the personality button to cycle through different AI tones:
  - **Friendly**: Warm and approachable
  - **Logical**: Analytical and structured
  - **Playful**: Fun and engaging
  - **Confident**: Assertive and direct

### Defensive Mode
- Toggle defensive mode to get AI responses with built-in reasoning
- AI will anticipate counterarguments and provide defenses
- Useful for technical discussions and debates

## 🔧 Configuration

### Customizing AI Responses
Edit the `generateAIResponse` function in `src/components/AIchat.tsx` to customize AI behavior:

```typescript
const responses = {
  greeting: [
    "Your custom greeting responses here",
    // Add more responses...
  ],
  // Add more categories...
};
```

### Styling
Modify the Tailwind classes in the components or update `src/index.css` for custom styles.

### Voice Settings
Adjust speech synthesis settings in the `speakText` function:

```typescript
synthesisRef.current.rate = 0.95;    // Speech rate
synthesisRef.current.pitch = 1;      // Pitch
synthesisRef.current.volume = 0.9;   // Volume
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure build settings if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern React patterns and best practices
- Inspired by modern chat interfaces and AI assistants
- Uses open-source libraries and tools from the React ecosystem

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Happy chatting! 🤖💬**
