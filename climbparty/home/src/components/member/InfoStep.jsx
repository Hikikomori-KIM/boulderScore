import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  updatePassword,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InfoStep({ email }) {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleComplete = async () => {
    const auth = getAuth();
    await auth.currentUser.reload(); // 인증 상태 최신화
    const user = auth.currentUser;

    if (!user.emailVerified) {
      alert("❗ 이메일 인증을 먼저 완료해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("❗ 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // ✅ reauthenticate 필요 (이메일 인증 후 바로 들어온 사용자는 민감 작업 막힘)
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      await updateProfile(user, { displayName: name });
      await updatePassword(user, password);

      alert("🎉 회원가입이 완료되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("회원정보 업데이트 오류:", error);
      alert("❌ 오류 발생: " + error.code + "\\n" + error.message);
    }
  };

  return (
    <div className="w-100" style={{ maxWidth: "400px" }}>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="mb-4 text-center">회원정보 입력</h2>
        <input
          className="form-control mb-2"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          className="form-control mb-2"
          placeholder="생년월일"
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-2"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button className="btn btn-primary w-100" onClick={handleComplete}>
          회원가입 완료
        </button>
      </div>
    </div>
  );
}
