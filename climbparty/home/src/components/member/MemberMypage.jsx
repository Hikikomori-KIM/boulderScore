import { useState, useEffect } from "react";
import { getAuth, updatePassword, updateProfile, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

// 🔐 .env에 설정된 관리자 코드 가져오기
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE;

export default function MyPage() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [birth, setBirth] = useState("");
  const [originalBirth, setOriginalBirth] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");

  useEffect(() => {
    const loadBirth = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.birth) {
            setBirth(data.birth);
            setOriginalBirth(data.birth);
          }
        }
      }
    };
    loadBirth();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const updates = [];

      if (newPassword && newPassword !== confirmPassword) {
        alert("❌ 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (name && name !== user.displayName) {
        updates.push(updateProfile(user, { displayName: name }));
      }

      if (newPassword) {
        updates.push(updatePassword(user, newPassword));
      }

      const updateData = {};
      if (birth && birth !== originalBirth) updateData.birth = birth;
      if (adminCode === ADMIN_CODE) updateData.role = "admin";

      if (Object.keys(updateData).length > 0) {
        await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
      }

      await Promise.all(updates);
      alert("✅ 마이페이지 정보가 수정되었습니다.");

      if (adminCode === ADMIN_CODE) {
        window.location.reload();
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("업데이트 오류:", err);
      alert("❌ 수정 중 오류 발생: " + err.message);
    }
  };
  const handleDeleteAccount = async () => {
    if (!window.confirm("정말 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      // 사용자에게 비밀번호 재입력 받기
      const password = prompt("계정 삭제를 위해 비밀번호를 다시 입력해주세요:");
      if (!password) return;

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential); // ✅ 재인증

      await deleteDoc(doc(db, "users", user.uid)); // Firestore 사용자 정보 삭제
      await deleteUser(user); // Firebase 계정 삭제

      alert("👋 회원탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("회원탈퇴 오류:", err);
      if (err.code === "auth/wrong-password") {
        alert("❌ 비밀번호가 일치하지 않습니다.");
      } else {
        alert("❌ 회원탈퇴 중 오류 발생: " + err.message);
      }
    }
  };


  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">마이페이지</h2>

      <div className="mb-3">
        <label className="form-label">이메일 (변경불가)</label>
        <input type="email" className="form-control text-muted" value={email} disabled />
      </div>

      <div className="mb-3">
        <label className="form-label">이름</label>
        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">생년월일</label>
        <input type="date" className="form-control" value={birth} onChange={(e) => setBirth(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">새 비밀번호</label>
        <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">비밀번호 확인</label>
        <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      <div className="mb-4">
        <label className="form-label">관리자 코드</label>
        <input type="text" className="form-control" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} />
        <small className="text-muted">※ 입력 시 관리자 권한이 부여됩니다.</small>
      </div>

      <button className="btn btn-primary w-100 mb-3" onClick={handleSave}>저장하기</button>

      <button className="btn btn-danger w-100 mb-5" onClick={handleDeleteAccount}>회원탈퇴</button>
    </div>
  );
}
