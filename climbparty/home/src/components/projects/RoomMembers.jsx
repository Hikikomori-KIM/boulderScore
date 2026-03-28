import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { removeRoomMember } from "../../firebaseFunctions";

export default function RoomMembers({ roomId, members = [], ownerUid }) {
  const [details, setDetails] = useState([]);
  const auth = getAuth();
  const myUid = auth.currentUser?.uid;

  useEffect(() => {
    const load = async () => {
      const list = await Promise.all(
        (members || []).map(async (uid) => {
          try {
            const usnap = await getDoc(doc(db, "users", uid));
            const u = usnap.exists() ? usnap.data() : {};
            return {
              uid,
              name: u.name || u.displayName || "(이름 없음)",
              email: u.email || "",
            };
          } catch {
            return { uid, name: "(알 수 없음)", email: "" };
          }
        })
      );
      setDetails(list);
    };
    load();
  }, [members]);

  const isOwner = ownerUid === myUid;

  const onKick = async (uid) => {
    if (!isOwner) return;
    if (!confirm("정말 내보낼까요?")) return;
    try {
      await removeRoomMember(roomId, uid);
    } catch (e) {
      console.error(e);
      alert("내보내기 실패");
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">멤버 ({details.length}명)</div>
      <ul className="list-group list-group-flush">
        {details.map((m) => (
          <li key={m.uid} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">
                {m.name}{m.email ? ` (${m.email})` : ""}{" "}
                {m.uid === ownerUid && <span className="badge bg-secondary ms-2">방장</span>}
              </div>
            </div>
            {isOwner && m.uid !== myUid && (
              <button className="btn btn-sm btn-outline-danger" onClick={() => onKick(m.uid)}>
                내보내기
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
