// 📁 App.jsx
import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Menu from './components/template/Menu';
import Footer from './components/template/Footer';
import { AuthProvider, useAuth } from './components/AuthContext';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// 페이지들
import TeamCount from './components/TeamCount';
import MemberLogin from './components/member/MemberLogin';
import MemberJoin from './components/member/MemberJoin';
import ClimbCountMain from './components/ClimbCountMain';
import MyPage from './components/member/MemberMypage';
import AdminGymPage from './components/admin/AdminGymPage';
import AdminUserList from './components/admin/AdminUserList';
import AdminPartyTeamPage from './components/admin/AdminPartyTeamPage';
import AdminRankingPage from './components/admin/AdminRankingPage';
import AdminPartyTape from './components/admin/AdminPartyTape';
import ScorerSheet from './components/scorerSheet';
import TapeRank from './components/rank/tapeRank';
import Terms from './components/template/Terms';
import Privacy from './components/template/Privacy';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { firstCheckDone } = useAuth();

  const [frozenLocation, setFrozenLocation] = useState(location);

  useEffect(() => {
    // ✅ 인증이 완료되었을 때만 location 업데이트
    if (firstCheckDone) {
      setFrozenLocation(location);
    }
  }, [firstCheckDone, location]);

  return (
    <div className="pt-5 d-flex flex-column min-vh-100">
      <Menu />

      <Routes location={firstCheckDone ? location : frozenLocation}>
        {/* ✅ 공개 라우트 */}
        <Route path="/" element={<ClimbCountMain />} />
        <Route path="/login" element={<MemberLogin />} />
        <Route path="/join" element={<MemberJoin />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* ✅ 보호 라우트 */}
        <Route path="/teamCount" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <TeamCount />
          </RoleProtectedRoute>
        } />
        <Route path="/rank/tape" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <TapeRank />
          </RoleProtectedRoute>
        } />
        <Route path="/mypage" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <MyPage />
          </RoleProtectedRoute>
        } />
        <Route path="/ScorerSheet" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <ScorerSheet />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/userlist" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <AdminUserList />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/gym" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <AdminGymPage />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/party-team" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <AdminPartyTeamPage />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/rankPage" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <AdminRankingPage />
          </RoleProtectedRoute>
        } />
        <Route path="/admin/partyTape" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <AdminPartyTape />
          </RoleProtectedRoute>
        } />
      </Routes>

      <Footer />
    </div>
  );
}
