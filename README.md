# AO Cook Chatbot

A modern web-based chat interface for the AO Cook AI assistant, built with React, TypeScript, Tailwind CSS, and Vite.

## Features

- 🎨 **Modern UI**: Beautiful, responsive chat interface
- ⚡ **Real-time Chat**: Instant messaging with AI assistant
- 🔄 **Auto-scroll**: Messages automatically scroll to bottom
- ⌨️ **Keyboard Shortcuts**: Press Enter to send messages
- 📱 **Mobile Responsive**: Works great on all devices
- 🎯 **TypeScript**: Full type safety throughout the application

## Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ChatInput.tsx    # Message input component
│   │   └── ChatMessage.tsx  # Individual message display
│   ├── openai/             # OpenAI integration (existing)
│   ├── App.tsx             # Main React application
│   ├── main.tsx            # React entry point
│   ├── server.ts           # Express API server
│   ├── index.ts            # CLI version (existing)
│   └── types.ts            # TypeScript type definitions
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Bun (recommended) or Node.js 18+ 
- OpenAI API key

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd aoCook
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp .envSAMPLE .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the Application

#### Option 1: Web Interface (Recommended)

1. **Start the backend server** (in one terminal):
   ```bash
   bun run server:dev
   ```
   This will start the Express server on port 3001.

2. **Start the frontend development server** (in another terminal):
   ```bash
   bun run frontend:dev
   ```
   This will start the Vite dev server on port 3000.

3. **Open your browser** and navigate to `http://localhost:3000`

#### Option 2: CLI Interface (Original)

```bash
bun run dev
```

### Building for Production

1. **Build the frontend**:
   ```bash
   bun run frontend:build
   ```

2. **Build the backend**:
   ```bash
   bun run build
   ```

3. **Start the production server**:
   ```bash
   bun run start
   ```

## API Endpoints

- `POST /chat` - Send a message to the AI assistant
- `GET /health` - Health check endpoint

## Development

### Available Scripts

- `bun run frontend:dev` - Start Vite development server
- `bun run frontend:build` - Build frontend for production
- `bun run frontend:preview` - Preview production build
- `bun run server:dev` - Start Express development server
- `bun run dev` - Start CLI version
- `bun run build` - Build CLI version

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, TypeScript, OpenAI API
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and optimized builds
- **Package Manager**: Bun for fast dependency management

## Customization

### Styling

The application uses Tailwind CSS with a custom color scheme. You can modify the colors in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Customize your primary colors here
        500: '#3b82f6',
        600: '#2563eb',
        // ...
      }
    }
  }
}
```

### Components

The main components are located in `src/components/`:
- `ChatInput.tsx` - Message input with send button
- `ChatMessage.tsx` - Individual message display
- `App.tsx` - Main application layout and logic

## Troubleshooting

### Common Issues

1. **Port already in use**: 
   - Change the port in `vite.config.ts` or `server.ts`
   - Kill processes using the ports: `lsof -ti:3000 | xargs kill -9`

2. **OpenAI API errors**:
   - Verify your API key is correct in `.env`
   - Check your OpenAI account has sufficient credits

3. **TypeScript errors**:
   - Run `bun install` to ensure all dependencies are installed
   - Check that all type definitions are properly imported

### Getting Help

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed with `bun install`

## License

ISC License 