import React, { useEffect, useState } from "react";
import { fetchRooms, createRoom } from "../../firebaseFunctions";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { Button, Card, Spinner } from "react-bootstrap";

export default function ProjectsList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  // 방 목록 불러오기
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return; // 로그인 안 되어 있으면 실행 안 함
        setLoading(true);
        const data = await fetchRooms(user.uid);
        setRooms(data);
      } catch (error) {
        console.error("방 목록 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [auth]);

  // 방 만들기
  const handleCreateRoom = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const roomName = prompt("방 이름을 입력하세요:")?.trim();
    if (!roomName) return;

    try {
      await createRoom(roomName); // uid는 createRoom에서 자동 처리
      alert("방이 생성되었습니다!");
      const data = await fetchRooms(user.uid);
      setRooms(data);
    } catch (error) {
      console.error("방 생성 실패:", error);
      alert(error.message || "방 생성에 실패했습니다.");
    }
  };

  return (
    <div className="container py-4">
      {/* 상단 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">내가 만든 방</h3>
        <Button
          onClick={handleCreateRoom}
          className="px-4"
          style={{
            backgroundColor: "#007bff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          <Plus size={18} className="me-1" />
          방 만들기
        </Button>
      </div>

      {/* 로딩 상태 */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-muted">아직 만든 방이 없습니다.</p>
      ) : (
        <div className="row g-3">
          {rooms.map((room) => (
            <div key={room.id} className="col-12 col-md-6 col-lg-4">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body>
                  <h5 className="fw-bold">{room.name}</h5>
                  <div className="text-muted small mb-2">
                    <Users size={14} className="me-1" />
                    {room.members?.length || 0}명 참여
                  </div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                  >
                    입장하기
                  </Button>
                </Card.Body>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
