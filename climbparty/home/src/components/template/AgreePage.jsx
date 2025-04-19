import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AgreePage() {
  const navigate = useNavigate();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ 현재 로그인된 유저 정보 가져오기
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleConfirm = async () => {
    if (!agreeTerms || !agreePrivacy) {
      alert("모든 항목에 동의해야 계속 진행할 수 있어요.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        agreed: true,
      });
      // ✅ 상태 반영을 위해 새로고침
      window.location.href = "/";
    } catch (error) {
      console.error("약관 동의 저장 실패:", error);
      alert("문제가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleCancel = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        await currentUser.delete();
        alert("약관에 동의하지 않아 회원가입이 취소되었습니다.");
      }
      navigate("/login");
    } catch (error) {
      console.error("사용자 삭제 실패:", error);
      alert("사용자 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "600px" }}>
      <h3 className="text-center mb-4">약관 및 개인정보 처리방침 동의</h3>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="terms"
          checked={agreeTerms}
          onChange={() => setAgreeTerms(!agreeTerms)}
        />
        <label className="form-check-label" htmlFor="terms">
          <a href="/terms" target="_blank" rel="noopener noreferrer">이용약관</a>에 동의합니다.
        </label>
      </div>

      <div className="form-check mb-4">
        <input
          type="checkbox"
          className="form-check-input"
          id="privacy"
          checked={agreePrivacy}
          onChange={() => setAgreePrivacy(!agreePrivacy)}
        />
        <label className="form-check-label" htmlFor="privacy">
          <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>에 동의합니다.
        </label>
      </div>

      <button className="btn btn-primary w-100 rounded-pill mb-3" onClick={handleConfirm}>
        동의하고 계속하기
      </button>
      <button className="btn btn-outline-secondary w-100 rounded-pill" onClick={handleCancel}>
        동의하지 않고 나가기
      </button>
    </div>
  );
}