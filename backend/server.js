const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
    credentials: true // optional, usually false when using *
  }
});

app.use(cors({
  origin: "*", // Allow all origins
  credentials: false // must be false when origin is "*"
}));

app.use(express.json())
app.use(express.static(path.join(__dirname, "../frontend/build")))

// Cricket players pool
const cricketPlayers = [
  { id: 1, name: "Virat Kohli", role: "Batsman", country: "India", rating: 95 },
  { id: 2, name: "Rohit Sharma", role: "Batsman", country: "India", rating: 92 },
  { id: 3, name: "Babar Azam", role: "Batsman", country: "Pakistan", rating: 90 },
  { id: 4, name: "Kane Williamson", role: "Batsman", country: "New Zealand", rating: 89 },
  { id: 5, name: "Steve Smith", role: "Batsman", country: "Australia", rating: 88 },
  { id: 6, name: "Jasprit Bumrah", role: "Bowler", country: "India", rating: 94 },
  { id: 7, name: "Pat Cummins", role: "Bowler", country: "Australia", rating: 91 },
  { id: 8, name: "Trent Boult", role: "Bowler", country: "New Zealand", rating: 87 },
  { id: 9, name: "Kagiso Rabada", role: "Bowler", country: "South Africa", rating: 86 },
  { id: 10, name: "Shaheen Afridi", role: "Bowler", country: "Pakistan", rating: 85 },
  { id: 11, name: "MS Dhoni", role: "Wicket-keeper", country: "India", rating: 93 },
  { id: 12, name: "Jos Buttler", role: "Wicket-keeper", country: "England", rating: 87 },
  { id: 13, name: "Quinton de Kock", role: "Wicket-keeper", country: "South Africa", rating: 84 },
  { id: 14, name: "Ben Stokes", role: "All-rounder", country: "England", rating: 91 },
  { id: 15, name: "Ravindra Jadeja", role: "All-rounder", country: "India", rating: 89 },
  { id: 16, name: "Shakib Al Hasan", role: "All-rounder", country: "Bangladesh", rating: 86 },
  { id: 17, name: "Glenn Maxwell", role: "All-rounder", country: "Australia", rating: 83 },
  { id: 18, name: "Hardik Pandya", role: "All-rounder", country: "India", rating: 82 },
  { id: 19, name: "Joe Root", role: "Batsman", country: "England", rating: 88 },
  { id: 20, name: "David Warner", role: "Batsman", country: "Australia", rating: 85 },
  { id: 21, name: "Rashid Khan", role: "Bowler", country: "Afghanistan", rating: 88 },
  { id: 22, name: "Mitchell Starc", role: "Bowler", country: "Australia", rating: 86 },
  { id: 23, name: "Yuzvendra Chahal", role: "Bowler", country: "India", rating: 81 },
  { id: 24, name: "Jonny Bairstow", role: "Wicket-keeper", country: "England", rating: 82 },
  { id: 25, name: "Andre Russell", role: "All-rounder", country: "West Indies", rating: 84 },
]

// In-memory storage
const inMemoryRooms = new Map()
const userTimers = new Map()

// Helper functions
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const autoSelectPlayer = async (roomCode, userId) => {
  try {
    const room = inMemoryRooms.get(roomCode)
    if (!room) return

    const userIndex = room.users.findIndex((u) => u.id === userId)
    if (userIndex === -1) return

    // ✅ Move this early
    if (room.users[userIndex].selectionCount >= 5) return

    const availablePlayers = room.availablePlayers
    if (availablePlayers.length === 0) return

    const randomIndex = Math.floor(Math.random() * availablePlayers.length)
    const selectedPlayer = availablePlayers[randomIndex]

    // Remove player from available pool
    room.availablePlayers = availablePlayers.filter((p) => p.id !== selectedPlayer.id)

    // Add to user's team
    room.users[userIndex].selectedPlayers.push(selectedPlayer)
    room.users[userIndex].selectionCount++

    // Move to next turn
do {
  room.currentTurnIndex = (room.currentTurnIndex + 1) % room.turnOrder.length
  const nextUserId = room.turnOrder[room.currentTurnIndex]
  const nextUser = room.users.find(u => u.id === nextUserId)
  if (nextUser && nextUser.selectionCount < 5) break
} while (true)
    room.currentRound++

    inMemoryRooms.set(roomCode, room)

    // Broadcast auto-selection
    io.to(roomCode).emit("auto-selected", {
      player: selectedPlayer,
      userId: userId,
      userName: room.users[userIndex]?.name,
      nextTurn: room.users[room.currentTurnIndex],
      availablePlayers: room.availablePlayers,
      users: room.users,
      currentRound: room.currentRound,
    })

    // Check if selection is complete
    if (room.users.every((user) => user.selectionCount >= 5)) {
      io.to(roomCode).emit("selection-ended", {
        finalTeams: room.users,
        message: "Team selection completed!",
      })
    }
  } catch (error) {
    console.error("Auto-select error:", error)
  }
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Create room
  socket.on("create-room", async (userData) => {
    try {
      const roomCode = generateRoomCode()
      const user = {
        id: socket.id,
        name: userData.name,
        isHost: true,
        selectedPlayers: [],
        selectionCount: 0,
        isConnected: true,
      }

      const roomData = {
        code: roomCode,
        host: socket.id,
        users: [user],
        availablePlayers: [...cricketPlayers],
        isSelectionStarted: false,
        currentTurnIndex: 0,
        currentRound: 1,
        turnOrder: [],
        createdAt: new Date().toISOString(),
      }

      inMemoryRooms.set(roomCode, roomData)
      socket.join(roomCode)

      socket.emit("room-created", {
        roomCode,
        user,
        users: roomData.users,
      })
    } catch (error) {
      console.error("Create room error:", error)
      socket.emit("error", { message: "Failed to create room" })
    }
  })

  // Join room
  socket.on("join-room", async (data) => {
    try {
      const { roomCode, userName } = data
      const room = inMemoryRooms.get(roomCode)

      if (!room) {
        socket.emit("error", { message: "Room not found" })
        return
      }

      if (room.users.length >= 6) {
        socket.emit("error", { message: "Room is full" })
        return
      }

      if (room.isSelectionStarted) {
        socket.emit("error", { message: "Selection already started" })
        return
      }

      const user = {
        id: socket.id,
        name: userName,
        isHost: false,
        selectedPlayers: [],
        selectionCount: 0,
        isConnected: true,
      }

      room.users.push(user)
      inMemoryRooms.set(roomCode, room)

      socket.join(roomCode)

      // Notify all users in room
      io.to(roomCode).emit("user-joined", {
        user,
        users: room.users,
        roomCode,
      })

      socket.emit("room-joined", {
        roomCode,
        user,
        users: room.users,
        isHost: room.host === socket.id,
      })
    } catch (error) {
      console.error("Join room error:", error)
      socket.emit("error", { message: "Failed to join room" })
    }
  })

  // Start selection
  socket.on("start-selection", async (data) => {
    try {
      const { roomCode } = data
      const room = inMemoryRooms.get(roomCode)

      if (!room) {
        socket.emit("error", { message: "Room not found" })
        return
      }

      if (room.host !== socket.id) {
        socket.emit("error", { message: "Only host can start selection" })
        return
      }

      if (room.users.length < 2) {
        socket.emit("error", { message: "Need at least 2 players to start" })
        return
      }

      // Randomize turn order
      const shuffledUsers = shuffleArray(room.users)
      room.turnOrder = shuffledUsers.map((user) => user.id)
      room.isSelectionStarted = true
      room.currentTurnIndex = 0

      inMemoryRooms.set(roomCode, room)

      io.to(roomCode).emit("selection-started", {
        turnOrder: shuffledUsers,
        currentTurn: shuffledUsers[0],
        availablePlayers: room.availablePlayers,
        message: "Team selection has started!",
      })
    } catch (error) {
      console.error("Start selection error:", error)
      socket.emit("error", { message: "Failed to start selection" })
    }
  })

  // Select player
  socket.on("select-player", async (data) => {
    try {
      const { roomCode, playerId } = data
      const room = inMemoryRooms.get(roomCode)

      if (!room) {
        socket.emit("error", { message: "Room not found" })
        return
      }

const currentTurnUserId = room.turnOrder[room.currentTurnIndex]
if (currentTurnUserId !== socket.id) {
  socket.emit("error", { message: "Not your turn" })
  return
}

const userIndex = room.users.findIndex((u) => u.id === socket.id)
const currentUser = room.users[userIndex]


      if (currentUser.selectionCount >= 5) {
        socket.emit("error", { message: "You have already selected 5 players" })
        return
      }

      const selectedPlayer = room.availablePlayers.find((p) => p.id === playerId)
      if (!selectedPlayer) {
        socket.emit("error", { message: "Player not available" })
        return
      }

      // Clear any existing timer for this user
      if (userTimers.has(socket.id)) {
        clearTimeout(userTimers.get(socket.id))
        userTimers.delete(socket.id)
      }

      // Remove player from available pool
      room.availablePlayers = room.availablePlayers.filter((p) => p.id !== playerId)

      // Add to user's team
      room.users[userIndex].selectedPlayers.push(selectedPlayer)
      room.users[userIndex].selectionCount++

      // Move to next turn
do {
  room.currentTurnIndex = (room.currentTurnIndex + 1) % room.turnOrder.length
  const nextUserId = room.turnOrder[room.currentTurnIndex]
  const nextUser = room.users.find(u => u.id === nextUserId)
  if (nextUser && nextUser.selectionCount < 5) break
} while (true)
      room.currentRound++

      inMemoryRooms.set(roomCode, room)

      // Broadcast selection
      io.to(roomCode).emit("player-selected", {
        player: selectedPlayer,
        userId: socket.id,
        userName: currentUser.name,
        nextTurn: room.users[room.currentTurnIndex],
        availablePlayers: room.availablePlayers,
        users: room.users,
        currentRound: room.currentRound,
      })

      // Check if selection is complete
      if (room.users.every((user) => user.selectionCount >= 5)) {
        io.to(roomCode).emit("selection-ended", {
          finalTeams: room.users,
          message: "Team selection completed!",
        })
      }
    } catch (error) {
      console.error("Select player error:", error)
      socket.emit("error", { message: "Failed to select player" })
    }
  })

  // Start turn timer
  socket.on("start-turn-timer", async (data) => {
  try {
    const { roomCode, userId } = data
    const room = inMemoryRooms.get(roomCode)
    if (!room) return

    const user = room.users.find((u) => u.id === userId)
    if (!user || user.selectionCount >= 5) return // ❌ Don't start timer if already full

    // Clear existing timer
    if (userTimers.has(userId)) {
      clearTimeout(userTimers.get(userId))
    }

    // Set 10-second timer
    const timer = setTimeout(() => {
      autoSelectPlayer(roomCode, userId)
      userTimers.delete(userId)
    }, 10000)

    userTimers.set(userId, timer)
  } catch (error) {
    console.error("Timer error:", error)
  }
})


  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id)

    // Clear any timers
    if (userTimers.has(socket.id)) {
      clearTimeout(userTimers.get(socket.id))
      userTimers.delete(socket.id)
    }

    // Find and update user status in all rooms
    try {
      for (const [roomCode, room] of inMemoryRooms.entries()) {
        const userIndex = room.users.findIndex((u) => u.id === socket.id)

        if (userIndex !== -1) {
          room.users[userIndex].isConnected = false
          inMemoryRooms.set(roomCode, room)

          socket.to(roomCode).emit("user-disconnected", {
            userId: socket.id,
            userName: room.users[userIndex].name,
            users: room.users,
          })
        }
      }
    } catch (error) {
      console.error("Disconnect handling error:", error)
    }
  })

  // Handle reconnection
  socket.on("reconnect-to-room", async (data) => {
    try {
      const { roomCode, userId } = data
      const room = inMemoryRooms.get(roomCode)

      if (!room) {
        socket.emit("error", { message: "Room not found" })
        return
      }

      const userIndex = room.users.findIndex((u) => u.id === userId)

      if (userIndex !== -1) {
        room.users[userIndex].id = socket.id
        room.users[userIndex].isConnected = true

        // Update turn order if needed
        const turnIndex = room.turnOrder.findIndex((id) => id === userId)
        if (turnIndex !== -1) {
          room.turnOrder[turnIndex] = socket.id
        }

        inMemoryRooms.set(roomCode, room)

        socket.join(roomCode)

        socket.emit("reconnected", {
          roomCode,
          user: room.users[userIndex],
          users: room.users,
          availablePlayers: room.availablePlayers,
          isSelectionStarted: room.isSelectionStarted,
          currentTurn: room.users[room.currentTurnIndex],
        })

        socket.to(roomCode).emit("user-reconnected", {
          userId: socket.id,
          userName: room.users[userIndex].name,
          users: room.users,
        })
      }
    } catch (error) {
      console.error("Reconnect error:", error)
      socket.emit("error", { message: "Failed to reconnect" })
    }
  })
})

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Cricket Team Selection Server is running!",
    activeRooms: inMemoryRooms.size,
    connectedUsers: io.engine.clientsCount,
  })
})

app.get("/api/rooms/:roomCode", async (req, res) => {
  try {
    const room = inMemoryRooms.get(req.params.roomCode)
    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }
    res.json(room)
  } catch (error) {
    console.error("API error:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Serve React app (only if build exists)
app.get("*", (req, res) => {
  const buildPath = path.join(__dirname, "../frontend/build", "index.html")
  try {
    res.sendFile(buildPath)
  } catch (error) {
    res.json({ message: "Cricket Team Selection Server", status: "Running" })
  }
})

const PORT = process.env.PORT || 5000

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")

  // Clear all timers
  userTimers.forEach((timer) => clearTimeout(timer))
  userTimers.clear()

  // Close server
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})

server.listen(PORT, () => {
  console.log(`🏏 Cricket Team Selection Server running on port ${PORT}`)
  console.log(`🌐 Server URL: http://localhost:${PORT}`)
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`)
})
