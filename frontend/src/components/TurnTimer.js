"use client"

import { useState, useEffect } from "react"

const TurnTimer = ({ duration, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft, onTimeUp])

  const getTimerColor = () => {
    if (timeLeft <= 3) return "#f44336"
    if (timeLeft <= 5) return "#ff9800"
    return "#4caf50"
  }

  const getTimerClass = () => {
    if (timeLeft <= 3) return "timer-critical"
    if (timeLeft <= 5) return "timer-warning"
    return "timer-normal"
  }

  return (
    <div className={`turn-timer ${getTimerClass()}`}>
      <div className="timer-circle">
        <svg className="timer-svg" viewBox="0 0 100 100">
          <circle className="timer-bg" cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
          <circle
            className="timer-progress"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / duration)}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="timer-text">
          <span className="timer-number">{timeLeft}</span>
          <span className="timer-label">sec</span>
        </div>
      </div>
      <div className="timer-message">{timeLeft <= 3 ? "Hurry up!" : "Choose wisely!"}</div>
    </div>
  )
}

export default TurnTimer
