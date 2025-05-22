import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCrewDetail, loadRoomsByCrew } from "../../firebaseFunctions";
import { toast } from "react-toastify";

export default function CrewDetail() {
  const { crewId } = useParams();
  const [crew, setCrew] = useState(null);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const crewData = await getCrewDetail(crewId);
      const roomList = await loadRoomsByCrew(crewId);
      setCrew(crewData);
      setRooms(roomList);
    };
    fetchData();
  }, [crewId]);

  return (
    <div className="container py-4">
      {/* ✅ 모임 제목 전체 블록 */}
      {crew && (
        <div className="bg-light p-4 rounded mb-4 border shadow-sm w-100">
          <h2 className="fw-bold mb-2"> {crew.crewName}</h2>
          <p className="text-muted mb-0">이 모임의 방 목록을 관리하거나 참여할 수 있습니다.</p>
        </div>
      )}

      {/* ✅ 초대 링크 요약 + 복사 버튼 */}
      {crew && (
        <div className="alert alert-secondary d-flex justify-content-between align-items-center flex-column flex-md-row">
          <div className="mb-2 mb-md-0">
            <strong>이 모임에 다른 사람을 초대하고 싶다면?</strong>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              const link = `${window.location.origin}/crew/invite/${crewId}`;
              navigator.clipboard.writeText(link);
              toast.success("초대 링크가 복사되었습니다!");
            }}
          >
            📋 초대 링크 복사
          </button>
        </div>
      )}

      {/* ✅ 상단에 방 만들기 버튼 우측 정렬 */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
        <h5 className="mb-0">방 목록</h5>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/crew/${crewId}/room/create`)}
        >
          + 방 만들기
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="alert alert-light text-center">아직 등록된 방이 없습니다.</div>
      ) : (
        <div className="row g-3">
          {rooms.map((room) => (
            <div key={room.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="card h-100 shadow-sm"
                role="button"
                onClick={() => navigate(`/crew/${crewId}/room/${room.id}`)}
              >
                <div className="card-body">
                  <h5 className="card-title">{room.roomName}</h5>
                  <p className="card-text text-muted small">
                    생성자: {room.creatorName || "알 수 없음"}
                  </p>
                  <p className="card-text text-muted small">
                    참가자 수: {room.participants?.length || 1}명
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
