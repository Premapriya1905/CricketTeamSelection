# 🏏 Cricket Team Selection Arena

A real-time multiplayer cricket team selection application built with React, Node.js, Express.js, Socket.IO, and Redis. Players can create or join rooms and take turns selecting cricket players to build their dream teams!

**Netlify Link** - [ https://teal-bombolone-e73d2a.netlify.app/ ]

## ✨ Features

- **Real-time Multiplayer**: Multiple users can join the same room and interact in real-time
- **Turn-based Selection**: Players take turns selecting cricket players with a 10-second timer
- **Auto-selection**: If a player doesn't select within 10 seconds, the system auto-selects a player
- **Live Updates**: All players see selections and game state changes instantly
- **Unique UI/UX**: Cricket-themed design with stadium atmosphere and animations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Reconnection Support**: Players can reconnect if they lose connection
- **Redis Persistence**: Game state is stored in Redis for reliability

## 🚀 Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Redis** (v6 or higher)

### Installation Commands

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd cricket-team-selection

# Install all dependencies (root, server, and client)
npm run install-all

# Alternative: Install dependencies manually
npm install
cd server && npm install
cd ../client && npm install
cd ..
\`\`\`

### Package Installation Breakdown

**Root packages:**
\`\`\`bash
npm install concurrently --save-dev
\`\`\`

**Server packages:**
\`\`\`bash
cd server
npm install express socket.io redis cors
npm install nodemon --save-dev
\`\`\`

**Client packages:**
\`\`\`bash
cd client
npm install react react-dom socket.io-client react-scripts
\`\`\`

### Redis Setup

**Option 1: Local Redis Installation**

**On macOS:**
\`\`\`bash
brew install redis
brew services start redis
\`\`\`

**On Ubuntu/Debian:**
\`\`\`bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
\`\`\`

**On Windows:**
- Download Redis from the official website or use WSL

**Option 2: Docker Redis**
\`\`\`bash
docker run -d -p 6379:6379 --name redis redis:alpine
\`\`\`

**Option 3: Cloud Redis**
- Use Redis Cloud, AWS ElastiCache, or similar services
- Update the Redis connection settings in \`server/server.js\`

### Running the Application

**Development Mode (Recommended):**
\`\`\`bash
# Start both server and client concurrently
npm run dev
\`\`\`

**Manual Start:**
\`\`\`bash
# Terminal 1: Start Redis (if not running)
redis-server

# Terminal 2: Start the backend server
npm run server

# Terminal 3: Start the React client
npm run client
\`\`\`

**Production Mode:**
\`\`\`bash
# Build the React app
npm run build

# Start the production server
npm start
\`\`\`

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎮 How to Play

### Creating a Room
1. Enter your name on the home page
2. Click "Create Room"
3. Share the room code with other players
4. Wait for at least 2 players to join
5. Click "Start Selection" to begin

### Joining a Room
1. Enter your name on the home page
2. Click "Join Room"
3. Enter the room code provided by the host
4. Wait for the host to start the selection

### Team Selection Process
1. **Turn Order**: A random turn order is generated when the game starts
2. **Player Selection**: Each player gets 10 seconds to select a cricket player
3. **Auto-selection**: If time runs out, a random player is auto-selected
4. **Team Building**: Each player selects 5 players total
5. **Real-time Updates**: All selections are broadcast to all players instantly
6. **Game End**: The game ends when all players have selected 5 players each

### Redis Configuration

The application uses Redis for:
- Room state persistence
- User session management
- Real-time data synchronization

Default Redis connection:
- **Host**: localhost
- **Port**: 6379
- **Database**: 0

## 🎨 Unique UI/UX Features

### Cricket Stadium Theme
- **Stadium Background**: Gradient background mimicking cricket stadium lighting
- **Animated Elements**: Bouncing cricket ball, swinging bat animations
- **Stadium Lights**: Animated light effects across the top

### Glassmorphism Design
- **Frosted Glass Cards**: Semi-transparent cards with backdrop blur
- **Smooth Transitions**: Hover effects and animations throughout
- **Gradient Accents**: Cricket-themed green gradients

### Interactive Elements
- **Player Cards**: Hover effects with selection overlays
- **Turn Indicators**: Pulsing animations for active turns
- **Progress Bars**: Animated team building progress
- **Timer Animations**: Color-changing countdown with urgency indicators

### Responsive Features
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets for mobile users
- **Adaptive Layout**: Grid layouts that adjust to screen size

## 🔌 Socket.IO Events

### Client to Server Events
- \`create-room\`: Create a new game room
- \`join-room\`: Join an existing room
- \`start-selection\`: Host starts the team selection
- \`select-player\`: Player selects a cricket player
- \`start-turn-timer\`: Initialize turn timer
- \`reconnect-to-room\`: Reconnect to a room after disconnection

### Server to Client Events
- \`room-created\`: Room successfully created
- \`room-joined\`: Successfully joined a room
- \`user-joined\`: New user joined the room
- \`selection-started\`: Team selection has begun
- \`player-selected\`: A player was selected by someone
- \`auto-selected\`: A player was auto-selected due to timeout
- \`selection-ended\`: All teams are complete
- \`user-disconnected\`: A user left the room
- \`user-reconnected\`: A user reconnected to the room
- \`error\`: Error message

## 🏏 Cricket Players Database

The application includes 25 real cricket players with:
- **Name**: Player's full name
- **Role**: Batsman, Bowler, All-rounder, or Wicket-keeper
- **Country**: Player's national team
- **Rating**: Skill rating from 81-95

## 🔍 Troubleshooting

### Common Issues

**Redis Connection Error:**
\`\`\`bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"

# Start Redis if not running
redis-server
\`\`\`

**Port Already in Use:**
\`\`\`bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

**Socket.IO Connection Issues:**
- Check CORS settings in server.js
- Verify client is connecting to correct server URL
- Ensure firewall isn't blocking the ports

**Build Errors:**
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

## 📝 API Endpoints

### REST Endpoints
- \`GET /api/health\` - Server health check
- \`GET /api/rooms/:roomCode\` - Get room information

## 📦 Complete Installation Commands

Here are all the commands you need to run to set up the project:

\`\`\`bash
# 1. Create project directory and navigate to it
mkdir cricket-team-selection
cd cricket-team-selection

# 2. Initialize root package.json and install concurrently
npm init -y
npm install concurrently --save-dev

# 3. Create server directory and install server dependencies
mkdir server
cd server
npm init -y
npm install express socket.io redis cors
npm install nodemon --save-dev
cd ..

# 4. Create React client
npx create-react-app client
cd client
npm install socket.io-client
cd ..

# 5. Install Redis (choose one option):

# Option A: macOS with Homebrew
brew install redis
brew services start redis

# Option B: Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# Option C: Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# 6. Start the application
npm run dev
\`\`\`

This project features a **unique cricket stadium-themed UI** with:
- 🏟️ Stadium lighting effects and animations
- 🏏 Cricket ball and bat animations
- 🌟 Glassmorphism design with backdrop blur
- ⚡ Real-time turn indicators with pulsing effects
- 🎨 Gradient color schemes inspired by cricket fields
- 📱 Fully responsive design for all devices

The application supports **all the required features**:
- ✅ Real-time room creation and joining
- ✅ Turn-based player selection with 10-second timer
- ✅ Auto-selection on timeout
- ✅ Redis data persistence
- ✅ User disconnection/reconnection handling
- ✅ Live updates to all connected users
- ✅ Complete game flow from start to finish
