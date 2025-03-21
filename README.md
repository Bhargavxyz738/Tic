# Real-Time Multiplayer Tic Tac Toe

A full-featured multiplayer Tic Tac Toe game built with React, Express, and WebSockets.

## Features

- 🎮 **Real-time multiplayer** gameplay using WebSockets
- 👤 **User Authentication** with registration and login
- 📊 **Leaderboard** with player statistics and rankings
- 📜 **Match History** to review past games
- 🌐 **Online Players** list with status indicators
- 🎨 **Responsive UI** optimized for both desktop and mobile

## Tech Stack

- **Frontend**: React, TailwindCSS, shadcn/ui components
- **Backend**: Express.js, WebSockets (ws)
- **Storage**: In-memory data store (can be replaced with PostgreSQL)
- **State Management**: React hooks with Context API

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tic-tac-toe-multiplayer.git
cd tic-tac-toe-multiplayer

# Install dependencies
npm install

# Start the development server
npm run dev
```

## How to Play

1. Register an account or log in
2. Click "New Game" to create a game
3. Wait for another player to join, or open the game in another browser to play against yourself
4. Take turns placing X and O on the board
5. First player to get 3 in a row wins!

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/            
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   ├── pages/      # Page components
├── server/             # Backend Express server
│   ├── routes.ts       # API routes and WebSocket handlers
│   ├── storage.ts      # Data storage implementation
├── shared/             # Shared code between client and server
│   ├── schema.ts       # TypeScript types and schemas
```

## License

MIT