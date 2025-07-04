"use client"

const PlayerCard = ({ player, onSelect, isSelectable, isSelected }) => {
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

  const getCountryFlag = (country) => {
    const flags = {
      India: "🇮🇳",
      Australia: "🇦🇺",
      England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      Pakistan: "🇵🇰",
      "New Zealand": "🇳🇿",
      "South Africa": "🇿🇦",
      "West Indies": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      Bangladesh: "🇧🇩",
      Afghanistan: "🇦🇫",
    }
    return flags[country] || "🏏"
  }

  return (
    <div
      className={`player-card ${isSelectable ? "selectable" : ""} ${isSelected ? "selected" : ""}`}
      onClick={isSelectable ? onSelect : undefined}
    >
      <div className="player-card-inner">
        <div className="player-header">
          <div className="player-rating">
            <span className="rating-number">{player.rating}</span>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`star ${i < Math.floor(player.rating / 20) ? "filled" : ""}`}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
          <div className="country-flag">{getCountryFlag(player.country)}</div>
        </div>

        <div className="player-avatar">
          <div className="avatar-circle">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="avatar-glow"></div>
        </div>

        <div className="player-info">
          <h4 className="player-name">{player.name}</h4>
          <div className="player-role" style={{ backgroundColor: getRoleColor(player.role) }}>
            {player.role}
          </div>
          <div className="player-country">{player.country}</div>
        </div>

        {isSelectable && (
          <div className="select-overlay">
            <div className="select-btn">
              <span>SELECT</span>
              <div className="btn-shine"></div>
            </div>
          </div>
        )}

        {isSelected && (
          <div className="selected-overlay">
            <div className="selected-icon">✓</div>
            <div className="selected-text">SELECTED</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerCard
