// 📁 src/components/EmailStep.jsx
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

export default function EmailStep({ email, setEmail, next }) {
  const handleSendCode = async () => {
    const auth = getAuth();

    try {
      // 임시 비밀번호로 계정 생성 (나중에 비번 변경 가능)
      const userCredential = await createUserWithEmailAndPassword(auth, email, "temporaryPassword123!");
      const user = userCredential.user;

      // 인증 메일 발송
      await sendEmailVerification(user);
      alert("✅ 인증 메일이 전송되었습니다. 메일함을 확인해주세요.");

      next(); // 다음 단계로 이동
    } catch (error) {
      console.error("회원가입 또는 인증 메일 전송 실패:", error.code, error.message);
      alert("❌ 에러: " + error.message);
    }
  };

  return (
    <div className="w-100" style={{ maxWidth: "400px" }}>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-4 text-center">이메일 회원가입</h2>
        <input
          type="email"
          className="form-control rounded-pill mb-3"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="이메일 입력"
        />
        <button className="btn btn-primary w-100 rounded-pill" onClick={handleSendCode}>
          인증메일 보내기
        </button>
      </div>
    </div>
  );
}
