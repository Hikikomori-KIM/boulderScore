import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRoomDetail } from "../../firebaseFunctions";

export default function RoomDetail() {
  const { crewId, roomId } = useParams();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      const data = await getRoomDetail(crewId, roomId);
      setRoom(data);
    };
    fetchRoom();
  }, [crewId, roomId]);

  return (
    <div className="container py-4">
      {room ? (
        <>
          <div className="bg-light p-4 rounded mb-4 border shadow-sm w-100">
            <h2 className="fw-bold mb-2">📍 {room.roomName}</h2>
            <p className="text-muted mb-1">생성자: {room.creatorName || "알 수 없음"}</p>
            <p className="text-muted mb-0">참가자 수: {room.participants?.length || 0}명</p>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">참가자 목록</h5>
            <button className="btn btn-sm btn-outline-primary">
              + 참가자 추가
            </button>
          </div>

          {room.participants?.length > 0 ? (
            <ul className="list-group mb-4">
              {room.participants.map((uid, index) => (
                <li key={uid} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>🧍 사용자 UID: {uid}</span>
                  <button className="btn btn-sm btn-outline-danger">제외</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="alert alert-light text-center">참가자가 없습니다.</div>
          )}
        </>
      ) : (
        <p>방 정보를 불러오는 중입니다...</p>
      )}
    </div>
  );
}
