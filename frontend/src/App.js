"use client"

import { useState, useEffect } from "react"
import io from "socket.io-client"
import "./App.css"
import HomePage from "./components/HomePage"
import GameRoom from "./components/GameRoom"

const socket = io("https://cricketteamselection-production.up.railway.app")

function App() {
  const [currentView, setCurrentView] = useState("home")
  const [roomData, setRoomData] = useState(null)
  const [user, setUser] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    // Socket event listeners
    socket.on("room-created", (data) => {
      setRoomData(data)
      setUser(data.user)
      setCurrentView("room")
      setError("")
    })

    socket.on("room-joined", (data) => {
      setRoomData(data)
      setUser(data.user)
      setCurrentView("room")
      setError("")
    })

    socket.on("error", (data) => {
      setError(data.message)
    })

    socket.on("reconnected", (data) => {
      setRoomData(data)
      setUser(data.user)
      setCurrentView("room")
      setError("")
    })

    return () => {
      socket.off("room-created")
      socket.off("room-joined")
      socket.off("error")
      socket.off("reconnected")
    }
  }, [])

  const createRoom = (userName) => {
    socket.emit("create-room", { name: userName })
  }

  const joinRoom = (roomCode, userName) => {
    socket.emit("join-room", { roomCode, userName })
  }

  const goHome = () => {
    setCurrentView("home")
    setRoomData(null)
    setUser(null)
    setError("")
  }

  return (
    <div className="App">
      {currentView === "home" && <HomePage onCreateRoom={createRoom} onJoinRoom={joinRoom} error={error} />}
      {currentView === "room" && roomData && (
        <GameRoom socket={socket} roomData={roomData} user={user} onGoHome={goHome} />
      )}
    </div>
  )
}

export default App
