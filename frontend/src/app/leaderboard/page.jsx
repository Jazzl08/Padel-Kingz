'use client'
import './leaderboard.css'
import Link from 'next/link'

export default function Leaderboard() {
  const leaderboardData = [
    {playerName: '1', wins: 1, losses: 1, points: 1 },
    {playerName: '2', wins: 2, losses: 2, points: 2 },
    {playerName: '3', wins: 3, losses: 3, points: 3 },
    {playerName: '4', wins: 4, losses: 4, points: 4 },
    {playerName: '5', wins: 5, losses: 5, points: 5 },
    {playerName: '6', wins: 6, losses: 6, points: 6 },
    {playerName: '7', wins: 7, losses: 7, points: 7 },
    {playerName: '8', wins: 8, losses: 8, points: 8 },
    {playerName: '9', wins: 9, losses: 9, points: 9 },
    {playerName: '10', wins: 10, losses: 10, points: 10 },
  ];

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-desc">Padel tournament ranking</p>

        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {[...leaderboardData]
                .sort((a, b) => b.points - a.points)
                .map((player, index) => (
                  <tr key={player.rank} className="table-row">
                    <td className="player-cell">{player.playerName}</td>
                    <td className="stat-cell wins">{player.wins}</td>
                    <td className="stat-cell losses">{player.losses}</td>
                    <td className="stat-cell points">{player.points}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="leaderboard-footer">
          <Link href="/">
            <button className="btn-back">Back to Home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}