import { useState } from "react";
import { createCrew } from "../../firebaseFunctions";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

export default function CrewCreate() {
  const [crewName, setCrewName] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleCreate = async () => {
    const user = auth.currentUser;
    if (!crewName.trim()) {
      toast.warning("모임 이름을 입력해주세요.");
      return;
    }
    if (user) {
      try {
        const crewId = await createCrew(crewName.trim(), user.uid, user.displayName || "익명");
        toast.success("모임이 생성되었습니다!");
        navigate(`/crew/${crewId}`);
      } catch (err) {
        console.error(err);
        toast.error("모임 생성 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: "500px", width: "100%" }}>
        <h4 className="mb-3 fw-bold text-center">새로운 모임 만들기</h4>
        <p className="text-muted text-center mb-4 small">
          예: 서울숲클라이밍, 벽헤는밤(크루명), 김성범의 모임
        </p>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="모임 이름 입력"
            value={crewName}
            onChange={(e) => setCrewName(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleCreate}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
