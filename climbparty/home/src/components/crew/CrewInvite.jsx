import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getCrewDetail, joinCrew } from "../../firebaseFunctions";
import { toast } from "react-toastify";

export default function CrewInvite() {
  const { crewId } = useParams();
  const [crewName, setCrewName] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const join = async () => {
      const user = auth.currentUser;
      if (!user) {
        toast.warn("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const crew = await getCrewDetail(crewId);
      if (!crew) {
        toast.error("초대받은 모임을 찾을 수 없습니다.");
        navigate("/");
        return;
      }

      setCrewName(crew.crewName);

      if (crew.members.includes(user.uid)) {
        toast.info("이미 이 모임에 가입되어 있습니다.");
        navigate(`/crew/${crewId}`);
        return;
      }

      await joinCrew(crewId, user.uid);
      toast.success(`'${crew.crewName}' 모임에 참여되었습니다.`);
      navigate(`/crew/${crewId}`);
    };

    join();
  }, [crewId, navigate]);

  return (
    <div className="container py-5 text-center">
      <h4>초대 링크 확인 중...</h4>
      {crewName && <p>모임: <strong>{crewName}</strong></p>}
    </div>
  );
}
