import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { sendRoomMessage } from "../../firebaseFunctions";

export default function RoomChat({ roomId, isMember = false, isOpen = true }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  // 날짜/시간 표기: 오늘이면 HH:MM, 그 외는 MM/DD
  const fmt = (ts) => {
    if (!ts?.toDate) return "";
    const d = ts.toDate();
    const now = new Date();
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    if (isSameDay) {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    } else {
      return `${d.getMonth() + 1}/${d.getDate()}`; // MM/DD
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100) // 최근 100개만 구독
    );
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(rows);
      // 스크롤 맨 아래로
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    });
    return () => unsub();
  }, [roomId]);

  const onSend = async (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    try {
      await sendRoomMessage(roomId, v);
      setText("");
    } catch (e) {
      console.error(e);
      alert("메시지 전송 실패");
    }
  };

  const disabled = !isMember || !isOpen;

  return (
    <div className="card shadow-sm">
      <div className="card-header fw-semibold">채팅</div>
      <div className="card-body" ref={listRef} style={{ height: 280, overflowY: "auto" }}>
        {messages.length === 0 ? (
          <div className="text-muted">아직 메시지가 없습니다.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="mb-2">
              <div className="small text-muted d-flex justify-content-between">
                <span>{m.authorName || m.authorId}</span>
                <span>{fmt(m.createdAt)}</span>
              </div>
              <div>{m.text}</div>
            </div>
          ))
        )}
      </div>
      <div className="card-footer">
        <form onSubmit={onSend} className="d-flex gap-2">
          <input
            className="form-control"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={disabled ? "멤버 & 열린 방에서만 채팅 가능" : "메시지를 입력하세요"}
            disabled={disabled}
          />
          <button className="btn btn-primary" type="submit" disabled={disabled}>
            {!isOpen ? "닫힌 방" : (isMember ? "보내기" : "멤버만 전송")}
          </button>
        </form>
      </div>
    </div>
  );
}
