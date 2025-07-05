const UserTeam = ({ user, isCurrentUser }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case "Batsman":
        return "#4CAF50"
      case "Bowler":
        return "#2196F3"
      case "All-rounder":
        return "#FF9800"
      case "Wicket-keeper":
        return "#9C27B0"
      default:
        return "#757575"
    }
  }

  const getTeamStrength = (players) => {
    if (players.length === 0) return 0
    const avgRating = players.reduce((sum, p) => sum + p.rating, 0) / players.length
    return Math.round(avgRating)
  }

  return (
    <div className={`user-team ${isCurrentUser ? "current-user-team" : ""}`}>
      <div className="team-header">
        <h3 className="team-title">
          <span className="team-icon">🏏</span>
          {isCurrentUser ? "Your Team" : `${user.name}'s Team`}
        </h3>
        <div className="team-stats">
          <div className="stat">
            <span className="stat-label">Players:</span>
            <span className="stat-value">{user.selectionCount}/5</span>
          </div>
          {user.selectedPlayers.length > 0 && (
            <div className="stat">
              <span className="stat-label">Strength:</span>
              <span className="stat-value">{getTeamStrength(user.selectedPlayers)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="team-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(user.selectionCount / 5) * 100}%` }}></div>
        </div>
        <span className="progress-text">{user.selectionCount}/5 Complete</span>
      </div>

      <div className="selected-players">
        {user.selectedPlayers.length > 0 ? (
          user.selectedPlayers.map((player, index) => (
            <div key={player.id} className="selected-player">
              <div className="player-number">{index + 1}</div>
              <div className="player-details">
                <div className="player-name">{player.name}</div>
                <div className="player-role-small" style={{ backgroundColor: getRoleColor(player.role) }}>
                  {player.role}
                </div>
                <div className="player-rating-small">⭐ {player.rating}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-team">
            <div className="empty-icon">🏏</div>
            <p>No players selected yet</p>
          </div>
        )}

        {/* Show empty slots */}
        {[...Array(Math.max(0, 5 - user.selectionCount))].map((_, index) => (

          <div key={`empty-${index}`} className="empty-slot">
            <div className="slot-number">{user.selectionCount + index + 1}</div>
            <div className="slot-placeholder">
              <div className="slot-icon">?</div>
              <span>Waiting...</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserTeam
