import React, { useEffect, useState } from "react";
import { fetchTeamScores } from "../../firebaseFunctions";

export default function TeamScoreBoard({ roomId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await fetchTeamScores(roomId);
      setRows(list);
    })();
  }, [roomId]);

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">조별 점수</div>
      <ul className="list-group list-group-flush">
        {rows.map((r) => (
          <li key={r.teamId} className="list-group-item d-flex justify-content-between">
            <span>{r.teamId === "_NO_TEAM_" ? "(팀없음)" : r.teamId}</span>
            <span className="fw-bold">{r.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
