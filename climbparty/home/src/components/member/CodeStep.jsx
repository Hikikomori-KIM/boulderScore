// 📁 src/components/CodeStep.jsx
import { getAuth } from "firebase/auth";

export default function CodeStep({ email, verified, setVerified, next }) {
  const handleCheckVerification = async () => {
    const auth = getAuth();

    try {
      await auth.currentUser.reload(); // 사용자 정보 새로고침
      if (auth.currentUser.emailVerified) {
        setVerified(true);
        alert("✅ 인증이 완료되었습니다!");
        next(); // 다음 단계 (InfoStep)으로 이동
      } else {
        alert("❌ 아직 인증이 완료되지 않았습니다.\n메일의 인증 링크를 클릭해주세요.");
      }
    } catch (error) {
      console.error("인증 확인 중 오류:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="w-100" style={{ maxWidth: "400px" }}>
      <div className="bg-white p-4 rounded shadow text-center">
        <h2 className="mb-4">📨 이메일 인증 확인</h2>
        <p className="mb-3">가입하신 이메일로 인증 메일이 전송되었습니다.</p>
        <p className="mb-3"><strong>{email}</strong></p>
        <p className="text-muted">메일의 인증 링크를 클릭하신 후,<br />아래 버튼을 눌러 인증 여부를 확인해주세요.</p>
        <button className="btn btn-success w-100 rounded-pill mt-3" onClick={handleCheckVerification}>
          인증 완료 확인
        </button>
      </div>
    </div>
  );
}
