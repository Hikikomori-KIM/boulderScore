import { useEffect, useState } from "react";
import { loadMyCrews, deleteCrew } from "../../firebaseFunctions";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "./CrewList.css";

export default function CrewList() {
  const [crews, setCrews] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchCrews = async () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const data = await loadMyCrews(userId);
        setCrews(data);
      }
    };
    fetchCrews();
  }, []);

  const handleDelete = async (crewId) => {
    const confirm = window.confirm("정말 이 모임을 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      const currentUserId = auth.currentUser.uid;
      await deleteCrew(crewId, currentUserId);
      setCrews((prev) => prev.filter((c) => c.id !== crewId));
      toast.success("모임이 삭제되었습니다.");
    } catch (err) {
      toast.error("삭제 권한이 없거나 오류가 발생했습니다.");
      console.error(err);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">내 모임</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/crew/create")}
        >
          + 모임 만들기
        </button>
      </div>

      {crews.length === 0 ? (
        <div className="alert alert-light text-center">
          아직 만든 모임이 없어요. 첫 모임을 만들어보세요!
        </div>
      ) : (
        <div className="row g-4">
          {crews.map((crew) => (
            <div key={crew.id} className="col-12 col-md-6 col-lg-4">
              <div
                className="card position-relative border-0 shadow-sm rounded-3 h-100 card hover-effect"
                style={{ cursor: "pointer", transition: "all 0.2s ease-in-out" }}
                onClick={() => navigate(`/crew/${crew.id}`)}
              >
                {/* ❌ 삭제 버튼 (심플 아이콘으로 변경) */}
                <button
                  className="crew-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(crew.id);
                  }}
                  aria-label="모임 삭제"
                >
                  &times;
                </button>


                <div className="card-body">
                  <h5 className="card-title fw-bold mb-2">{crew.crewName}</h5>
                  <p className="card-text text-muted small mb-1">
                    생성자: {crew.ownerName || "익명"}
                  </p>
                  <p className="card-text text-muted small">
                    참여 인원: {crew.members?.length || 1}명
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
