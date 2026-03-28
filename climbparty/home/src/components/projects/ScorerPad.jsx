import React, { useEffect, useState } from "react";
import { submitScore, getTapeScoreConfig } from "../../firebaseFunctions";
import { getAuth } from "firebase/auth";

export default function ScorerPad({ roomId, teamId = null, canScore = false }) {
  const auth = getAuth();
  const [uid, setUid] = useState(auth.currentUser?.uid || "");
  const [color, setColor] = useState("RED");
  const [tapeId, setTapeId] = useState("");
  const [config, setConfig] = useState({});

  useEffect(() => {
    (async () => {
      const cfg = await getTapeScoreConfig(roomId);
      setConfig(cfg);
    })();
  }, [roomId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canScore) return;
    try {
      await submitScore(roomId, { uid, teamId, color, tapeId });
      setTapeId("");
      alert("기록됨");
    } catch (e) {
      console.error(e);
      alert("실패");
    }
  };

  const colors = Object.keys(config).length ? Object.keys(config) : ["RED","BLUE","GREEN","YELLOW"];

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">채점지</div>
      <div className="card-body">
        <form className="d-grid gap-2" onSubmit={onSubmit}>
          <div className="input-group">
            <span className="input-group-text" style={{ minWidth: 100 }}>선수 UID</span>
            <input className="form-control" value={uid} onChange={(e)=>setUid(e.target.value)} />
          </div>
          <div className="input-group">
            <span className="input-group-text" style={{ minWidth: 100 }}>색상</span>
            <select className="form-select" value={color} onChange={(e)=>setColor(e.target.value)}>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <span className="input-group-text" style={{ minWidth: 100 }}>테이프ID</span>
            <input className="form-control" value={tapeId} onChange={(e)=>setTapeId(e.target.value)} placeholder="선택/선택안함 자유" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={!canScore}>기록</button>
        </form>
      </div>
    </div>
  );
}
