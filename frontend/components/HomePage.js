"use client"

import { useState } from "react"

const HomePage = ({ onCreateRoom, onJoinRoom, error }) => {
  const [userName, setUserName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [showJoinForm, setShowJoinForm] = useState(false)

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (userName.trim()) {
      onCreateRoom(userName.trim())
    }
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (userName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), userName.trim())
    }
  }

  return (
    <div className="home-container">
      <div className="cricket-stadium-bg">
        <div className="stadium-lights"></div>
        <div className="stadium-crowd"></div>
      </div>

      <div className="home-content">
        <div className="logo-section">
          <div className="cricket-logo">
            <div className="cricket-ball"></div>
            <div className="cricket-bat"></div>
          </div>
          <h1 className="game-title">
            <span className="title-main">CRICKET</span>
            <span className="title-sub">Team Selection Arena</span>
          </h1>
          <p className="game-subtitle">Build your dream cricket team in real-time!</p>
        </div>

        <div className="action-cards">
          {!showJoinForm ? (
            <>
              <div className="action-card create-card">
                <div className="card-icon">🏆</div>
                <h3>Create Room</h3>
                <p>Start a new team selection session</p>
                <form onSubmit={handleCreateRoom}>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="name-input"
                    maxLength={20}
                    required
                  />
                  <button type="submit" className="action-btn create-btn">
                    <span>Create Room</span>
                    <div className="btn-glow"></div>
                  </button>
                </form>
              </div>

              <div className="action-card join-card">
                <div className="card-icon">🎯</div>
                <h3>Join Room</h3>
                <p>Join an existing team selection</p>
                <button onClick={() => setShowJoinForm(true)} className="action-btn join-btn">
                  <span>Join Room</span>
                  <div className="btn-glow"></div>
                </button>
              </div>
            </>
          ) : (
            <div className="action-card join-form-card">
              <div className="card-icon">🎯</div>
              <h3>Join Room</h3>
              <form onSubmit={handleJoinRoom}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="name-input"
                  maxLength={20}
                  required
                />
                <input
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="room-input"
                  maxLength={6}
                  required
                />
                <div className="form-buttons">
                  <button type="submit" className="action-btn join-btn">
                    <span>Join Room</span>
                    <div className="btn-glow"></div>
                  </button>
                  <button type="button" onClick={() => setShowJoinForm(false)} className="action-btn back-btn">
                    Back
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <span>{error}</span>
          </div>
        )}

        <div className="game-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span>Real-time Selection</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⏱️</span>
            <span>10 Second Turns</span>
          </div>
          <div className="feature">
            <span className="feature-icon">👥</span>
            <span>Multiplayer Rooms</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏏</span>
            <span>25+ Cricket Stars</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
