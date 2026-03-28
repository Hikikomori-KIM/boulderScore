import React, { useEffect, useState } from "react";
import { fetchColorRanking } from "../../firebaseFunctions";

export default function ColorRanking({ roomId, color }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async () => {
      const list = await fetchColorRanking(roomId, color);
      setRows(list.slice(0, 50));
    })();
  }, [roomId, color]);

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">{color} 랭킹</div>
      <ul className="list-group list-group-flush">
        {rows.map((r, i) => (
          <li key={r.uid} className="list-group-item d-flex justify-content-between">
            <span>{i+1}. {r.uid}</span>
            <span className="fw-bold">{r.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
