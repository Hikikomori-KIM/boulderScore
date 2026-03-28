import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { setRoomStatus } from "../../firebaseFunctions";

export default function RoomSettings({ roomId, ownerUid, status }) {
  const auth = getAuth();
  const myUid = auth.currentUser?.uid;
  const isOwner = ownerUid === myUid;
  const [value, setValue] = useState(status || "open");

  const onSave = async () => {
    try {
      await setRoomStatus(roomId, value);
      alert("상태가 변경되었습니다.");
    } catch (e) {
      console.error(e);
      alert("변경 실패");
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">설정</div>
      <div className="card-body">
        {!isOwner ? (
          <div className="text-muted">방장만 변경할 수 있습니다.</div>
        ) : (
          <>
            <label className="form-label">방 상태</label>
            <select
              className="form-select mb-3"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
            <button className="btn btn-primary" onClick={onSave}>저장</button>
          </>
        )}
      </div>
    </div>
  );
}
