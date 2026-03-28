import React, { useEffect, useState } from "react";
import { getTapeScoreConfig, setTapeScoreConfig } from "../../firebaseFunctions";

export default function TapeScoreConfig({ roomId, isOwnerOrAdmin }) {
  const [form, setForm] = useState({ RED: 100, BLUE: 80, GREEN: 60, YELLOW: 40 });

  useEffect(() => {
    (async () => {
      const cfg = await getTapeScoreConfig(roomId);
      if (cfg && Object.keys(cfg).length) setForm(cfg);
    })();
  }, [roomId]);

  const onChange = (k, v) => setForm((p) => ({ ...p, [k]: Number(v || 0) }));

  const onSave = async () => {
    try {
      await setTapeScoreConfig(roomId, form);
      alert("저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("저장 실패");
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">테이프별 점수 설정</div>
      <div className="card-body d-grid gap-2">
        {Object.keys(form).map((color) => (
          <div className="input-group" key={color}>
            <span className="input-group-text" style={{ minWidth: 100 }}>{color}</span>
            <input
              type="number"
              className="form-control"
              value={form[color]}
              onChange={(e) => onChange(color, e.target.value)}
              disabled={!isOwnerOrAdmin}
            />
          </div>
        ))}
      </div>
      <div className="card-footer">
        <button className="btn btn-primary" onClick={onSave} disabled={!isOwnerOrAdmin}>
          저장
        </button>
      </div>
    </div>
  );
}
