import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { createRoom } from "../../firebaseFunctions";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function RoomCreate() {
  const { crewId } = useParams();
  const [roomName, setRoomName] = useState("");
  const auth = getAuth();
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    const user = auth.currentUser;
    if (!roomName.trim()) {
      toast.warning("방 이름을 입력해주세요.");
      return;
    }
    if (user) {
      try {
        const roomId = await createRoom(crewId, roomName.trim(), user.uid, user.displayName || "익명");
        toast.success("방이 생성되었습니다!");
        navigate(`/crew/${crewId}/room/${roomId}`);
      } catch (err) {
        console.error(err);
        toast.error("방 생성 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: "500px", width: "100%" }}>
        <h4 className="fw-bold mb-3 text-center">🪜 새 방 만들기</h4>
        <p className="text-muted text-center small mb-4">예: 2025 봄 볼더링파티, 염창 1분기 대회 등</p>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="방 이름을 입력하세요"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreateRoom}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
