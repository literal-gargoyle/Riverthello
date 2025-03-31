# Riverthello 🌊

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9.17.0-orange)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-4.2.0-747bff)](https://vitejs.dev/)

## Overview

Riverthello is a competitive online multiplayer strategy game (based on Reversi/Othello) with a clean, modern design. Challenge players from around the world, improve your skills, and climb the global leaderboard.

## 🌟 Features

- **Real-time Multiplayer Gameplay:** Play against friends or random opponents worldwide
- **Firebase Authentication:** Sign in securely with your Google account
- **Advanced Rating System:** ELO-based competitive ranking system
- **Game History:** Review past games to improve your strategy
- **Global Leaderboard:** Compete to be the top-ranked player
- **Mobile-Responsive Design:** Play on any device with a beautiful, responsive interface

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, TailwindCSS, Shadcn UI
- **Backend:** Node.js, Express
- **Authentication:** Firebase Auth
- **Real-time Communication:** WebSockets (ws)
- **Build Tool:** Vite
- **Data Storage:** In-memory storage (with PostgreSQL schema design)

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- Firebase account for authentication

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/literal-gargoyle/riverthello.git
   cd riverthello
   ```

2. Install dependencies
   ```bash
   npm install
   # or with yarn
   yarn install
   ```

3. Configure Firebase
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Google authentication
   - Add your app domain to the authorized domains list in Firebase Auth settings
   - Create a `.env` file in the project root with your Firebase configuration:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

4. Start the development server
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

5. Visit `http://localhost:5000` to see the application running

## 🎮 How to Play

### Basic Rules

1. **Game Setup:**
   - The game is played on an 8×8 board with 64 squares
   - It starts with 4 discs placed in the center (2 black, 2 white placed diagonally)
   - Black makes the first move

2. **Making Moves:**
   - Players take turns placing one disc of their color on an empty square
   - Each move must "outflank" at least one opponent disc
   - Outflanking means placing a disc so that one or more of your opponent's discs are between your newly placed disc and another one of your existing discs (in a straight line)
   - All outflanked discs are flipped to your color

3. **Game End:**
   - The game ends when neither player can make a legal move
   - The player with the most discs of their color on the board wins
   - If both players have the same number of discs, the game is a draw

### Strategy Tips

- **Corners are King:** Try to secure the corner squares as they can never be flipped
- **Avoid X-Squares:** The squares diagonally adjacent to corners often give your opponent access to corners
- **Mobility Over Quantity:** Having more possible moves is often better than having more discs on the board
- **Edge Control:** Build stable formations along the edges of the board
- **Think Ahead:** Consider not just your next move, but what moves it sets up for both players

## 🏆 Rating System

Riverthello uses an ELO-based rating system:
- All players start with a rating of 1200
- Winning against higher-rated players earns more points
- Losing against lower-rated players costs more points
- Rating determines your rank tier:
  - Master (2000+)
  - Expert (1800-1999)
  - Skilled (1600-1799)
  - Intermediate (1400-1599)
  - Beginner (below 1400)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

- **literal-gargoyle** - [GitHub Profile](https://github.com/literal-gargoyle)

## 🙏 Acknowledgments

- Inspired by classic Reversi/Othello gameplay
- UI design inspired by Chess.com and Lichess.org
- Built with [Shadcn UI](https://ui.shadcn.com/) components
