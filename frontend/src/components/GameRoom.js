"use client"

import { useState, useEffect, useRef } from "react"
import PlayerCard from "./PlayerCard"
import UserTeam from "./UserTeam"
import TurnTimer from "./TurnTimer"

const GameRoom = ({ socket, roomData, user, onGoHome }) => {
  const [users, setUsers] = useState(roomData.users || [])
  const [availablePlayers, setAvailablePlayers] = useState([])
  const [isSelectionStarted, setIsSelectionStarted] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(null)
  const [turnOrder, setTurnOrder] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [gameMessage, setGameMessage] = useState("")
  const [isGameEnded, setIsGameEnded] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Socket event listeners
    socket.on("user-joined", (data) => {
      setUsers(data.users)
      setGameMessage(`${data.user.name} joined the room!`)
    })

    socket.on("selection-started", (data) => {
      setIsSelectionStarted(true)
      setTurnOrder(data.turnOrder)
      setCurrentTurn(data.currentTurn)
      setAvailablePlayers(data.availablePlayers)
      setGameMessage("Team selection has started! 🏏")

      // Start timer for first player
      if (data.currentTurn.id === user.id) {
        socket.emit("start-turn-timer", {
          roomCode: roomData.roomCode,
          userId: user.id,
        })
      }
    })

    socket.on("player-selected", (data) => {
      setAvailablePlayers(data.availablePlayers)
      setUsers(data.users)
      setCurrentTurn(data.nextTurn)
      setCurrentRound(data.currentRound)
      setSelectedPlayer(data.player)
      setGameMessage(`${data.userName} selected ${data.player.name}!`)

      // Start timer for next player
      if (data.nextTurn.id === user.id) {
        socket.emit("start-turn-timer", {
          roomCode: roomData.roomCode,
          userId: user.id,
        })
      }

      setTimeout(() => setSelectedPlayer(null), 3000)
    })

    socket.on("auto-selected", (data) => {
      setAvailablePlayers(data.availablePlayers)
      setUsers(data.users)
      setCurrentTurn(data.nextTurn)
      setCurrentRound(data.currentRound)
      setSelectedPlayer(data.player)
      setGameMessage(`Time's up! ${data.player.name} was auto-selected for ${data.userName}`)

      // Start timer for next player
      if (data.nextTurn.id === user.id) {
        socket.emit("start-turn-timer", {
          roomCode: roomData.roomCode,
          userId: user.id,
        })
      }

      setTimeout(() => setSelectedPlayer(null), 3000)
    })

    socket.on("selection-ended", (data) => {
      setIsGameEnded(true)
      setUsers(data.finalTeams)
      setGameMessage("🎉 Team selection completed! Check out everyone's teams!")
    })

    socket.on("user-disconnected", (data) => {
      setUsers(data.users)
      setGameMessage(`${data.userName} disconnected`)
    })

    socket.on("user-reconnected", (data) => {
      setUsers(data.users)
      setGameMessage(`${data.userName} reconnected`)
    })

    return () => {
      socket.off("user-joined")
      socket.off("selection-started")
      socket.off("player-selected")
      socket.off("auto-selected")
      socket.off("selection-ended")
      socket.off("user-disconnected")
      socket.off("user-reconnected")
    }
  }, [socket, user.id, roomData.roomCode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [gameMessage])

  const startSelection = () => {
    socket.emit("start-selection", { roomCode: roomData.roomCode })
  }

  const selectPlayer = (playerId) => {
    if (currentTurn && currentTurn.id === user.id) {
      socket.emit("select-player", { roomCode: roomData.roomCode, playerId })
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomData.roomCode)
    setShowCopySuccess(true)
    setTimeout(() => setShowCopySuccess(false), 2000)
  }

  const isMyTurn = currentTurn && currentTurn.id === user.id
  const myTeam = users.find((u) => u.id === user.id)

  return (
    <div className="game-room">
      <div className="room-header">
        <div className="room-info">
          <h2 className="room-title">
            <span className="room-icon">🏏</span>
            Cricket Arena
          </h2>
          <div className="room-code-section">
            <span className="room-code-label">Room Code:</span>
            <div className="room-code-container">
              <span className="room-code">{roomData.roomCode}</span>
              <button onClick={copyRoomCode} className="copy-btn">
                {showCopySuccess ? "✓" : "📋"}
              </button>
            </div>
          </div>
        </div>

        <div className="room-controls">
          {user.isHost && !isSelectionStarted && users.length >= 2 && (
            <button onClick={startSelection} className="start-btn">
              <span>Start Selection</span>
              <div className="btn-pulse"></div>
            </button>
          )}
          <button onClick={onGoHome} className="home-btn">
            🏠 Home
          </button>
        </div>
      </div>

      {showCopySuccess && <div className="copy-success">Room code copied to clipboard! ✓</div>}

      <div className="game-content">
        <div className="left-panel">
          <div className="users-section">
            <h3 className="section-title">
              <span className="title-icon">👥</span>
              Players ({users.length})
            </h3>
            <div className="users-list">
              {users.map((u, index) => (
                <div
                  key={u.id}
                  className={`user-card ${u.id === user.id ? "current-user" : ""} ${!u.isConnected ? "disconnected" : ""}`}
                >
                  <div className="user-avatar">{u.name.charAt(0).toUpperCase()}</div>
                  <div className="user-info">
                    <span className="user-name">
                      {u.name}
                      {u.isHost && <span className="host-badge">👑</span>}
                      {u.id === user.id && <span className="you-badge">You</span>}
                    </span>
                    <span className="user-stats">{u.selectionCount}/5 players</span>
                  </div>
                  {isSelectionStarted && (
                    <div className="turn-indicator">
                      {currentTurn && currentTurn.id === u.id && (
                        <div className="turn-active">
                          <span className="turn-text">Turn</span>
                          <div className="turn-pulse"></div>
                        </div>
                      )}
                    </div>
                  )}
                  {!u.isConnected && <div className="disconnected-badge">Offline</div>}
                </div>
              ))}
            </div>
          </div>

          {isSelectionStarted && (
            <div className="turn-info-section">
              <h3 className="section-title">
                <span className="title-icon">⚡</span>
                Turn Information
              </h3>
              <div className="turn-info-card">
                {currentTurn && (
                  <>
                    <div className="current-turn">
                      <span className="turn-label">Current Turn:</span>
                      <span className="turn-player">{currentTurn.name}</span>
                    </div>
                    <div className="round-info">
                      <span className="round-label">Round:</span>
                      <span className="round-number">{currentRound}</span>
                    </div>
                    {isMyTurn && <TurnTimer key={currentRound} duration={10} onTimeUp={() => {}} />}
                  </>
                )}
              </div>
            </div>
          )}

          {gameMessage && (
            <div className="game-message">
              <div className="message-content">{gameMessage}</div>
            </div>
          )}
        </div>

        <div className="center-panel">
          {!isSelectionStarted ? (
            <div className="waiting-area">
              <div className="waiting-content">
                <div className="cricket-animation">
                  <div className="cricket-ball-bounce"></div>
                </div>
                <h3>Waiting for game to start...</h3>
                <p>
                  {user.isHost
                    ? users.length >= 2
                      ? "Click 'Start Selection' to begin!"
                      : `Need at least 2 players to start (${users.length}/2)`
                    : "Waiting for host to start the selection"}
                </p>
                <div className="game-rules">
                  <h4>🏏 Game Rules:</h4>
                  <ul>
                    <li>Each player gets 10 seconds per turn</li>
                    <li>Select 5 players for your team</li>
                    <li>Auto-selection if time runs out</li>
                    <li>Build the best cricket team!</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="players-grid-section">
              <div className="section-header">
                <h3 className="section-title">
                  <span className="title-icon">🌟</span>
                  Available Players ({availablePlayers.length})
                </h3>
                {isMyTurn && (
                  <div className="turn-indicator-header">
                    <span className="your-turn-text">Your Turn!</span>
                    <div className="turn-glow"></div>
                  </div>
                )}
              </div>

              <div className="players-grid">
                {availablePlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onSelect={() => selectPlayer(player.id)}
                    isSelectable={isMyTurn}
                    isSelected={selectedPlayer && selectedPlayer.id === player.id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          {myTeam && <UserTeam user={myTeam} isCurrentUser={true} />}

          {isGameEnded && (
            <div className="final-results">
              <h3 className="section-title">
                <span className="title-icon">🏆</span>
                Final Teams
              </h3>
              <div className="teams-summary">
                {users.map((u) => (
                  <div key={u.id} className="team-summary">
                    <h4>{u.name}'s Team</h4>
                    <div className="team-players">
                      {u.selectedPlayers.map((player) => (
                        <div key={player.id} className="summary-player">
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameRoom
