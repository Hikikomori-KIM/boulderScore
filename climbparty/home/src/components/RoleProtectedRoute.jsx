// 📁 src/components/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RoleProtectedRoute({ allowRoles, children }) {
  const { user, userRole, firstCheckDone } = useAuth();

  // ✅ 아직 인증 확인이 안 끝났으면 children 자체 렌더하지 않음
  if (!firstCheckDone) {
    return null; // 또는 로딩 화면 대신 이전 상태 유지
  }

  // 🔐 로그인 안 된 경우
  if (!user || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // 🔐 권한 없음
  if (!allowRoles.includes(userRole)) {
    alert("🚫 접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  // ✅ 권한 통과 → 진짜 children 렌더링
  return children;
}
