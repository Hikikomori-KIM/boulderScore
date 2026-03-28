import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Menu from './components/template/Menu';
import Footer from './components/template/Footer';
import { AuthProvider, useAuth } from './components/AuthContext';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { ToastContainer } from "react-toastify";
import RoomDetail from "./components/projects/RoomDetail";

// ✅ 새 페이지 import
import RoomScorerPage from "./pages/rooms/RoomScorerPage";
import RoomTeamScoresPage from "./components/projects/pages/RoomTeamScoresPage";
import RoomRankingsPage from "./components/projects/pages/RoomRankingsPage";

// 페이지들
import TeamCount from './components/TeamCount';
import MemberLogin from './components/member/MemberLogin';
import MemberJoin from './components/member/MemberJoin';
import ClimbCountMain from './components/ClimbCountMain';
import MyPage from './components/member/MemberMypage';
import AdminGymPage from './pages/admin/AdminGymPage';
import AdminUserList from './pages/admin/AdminUserList';
import AdminPartyTeamPage from './pages/admin/AdminPartyTeamPage';
import AdminRankingPage from './pages/admin/AdminRankingPage';
import AdminPartyTape from './pages/admin/AdminPartyTape';
import ScorerSheet from './components/ScorerSheet';
import TapeRank from './components/rank/TapeRank';
import Terms from './components/template/Terms';
import Privacy from './components/template/Privacy';
import BoardList from './components/board/boardList';
import BoardNew from './components/board/boardNew';
import OpenInBrowser from './components/template/OpenInBrowser';
import BoardDetail from './components/board/boardDetail';
import BoardEdit from './components/board/boardEdit';
import "react-toastify/dist/ReactToastify.css";
import OneToFiftyGame from './pages/challenge/OneToFiftyGame';
import OneToFiftyRanking from './pages/challenge/OneToFiftyRanking';
import ChallengeHome from './pages/challenge/ChallengeHome';
import AppleTenRank from './pages/challenge/apple-ten/AppleTenRank';
import VersionChecker from './VersionChecker';
import AppleTenGamePC from './pages/challenge/apple-ten/AppleTenGamePC';
import AppleTenGameMobile from './pages/challenge/apple-ten/AppleTenGameMobile';
import AdminAnnouncementPage from './pages/admin/announcement';
import { PartyProvider } from "./components/contexts/PartyContext";
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDashboard from './components/pages/ProjectDashboard';

export default function App() {
  return (
    <AuthProvider>
      <PartyProvider>
        <AppContent />
      </PartyProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { firstCheckDone } = useAuth();
  const [frozenLocation, setFrozenLocation] = useState(location);
  const navigate = useNavigate();

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isInApp = /kakaotalk|instagram|fbav|line/.test(ua);
    const currentPath = window.location.pathname;
    if (isInApp && currentPath !== "/open-in-browser") {
      navigate("/open-in-browser");
    }
  }, []);

  useEffect(() => {
    if (firstCheckDone) {
      setFrozenLocation(location);
    }
  }, [firstCheckDone, location]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <VersionChecker />
      <Menu />

      <Routes location={firstCheckDone ? location : frozenLocation}>
        {/* ✅ 공개 라우트 */}
        <Route path="/" element={<ClimbCountMain />} />
        <Route path="/login" element={<MemberLogin />} />
        <Route path="/join" element={<MemberJoin />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/open-in-browser" element={<OpenInBrowser />} />

        {/* ✅ 방 라우트 */}
        <Route path="/rooms/:roomId" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <RoomDetail />
          </RoleProtectedRoute>
        } />
        <Route path="/rooms/:roomId/scorer" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <RoomScorerPage />
          </RoleProtectedRoute>
        } />
        <Route path="/rooms/:roomId/team-scores" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <RoomTeamScoresPage />
          </RoleProtectedRoute>
        } />
        <Route path="/rooms/:roomId/rankings" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <RoomRankingsPage />
          </RoleProtectedRoute>
        } />

        {/* ✅ 프로젝트 기반 라우트 */}
        <Route path="/projects/:id" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <ProjectDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/projects/list" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <ProjectsList />
          </RoleProtectedRoute>
        } />
        <Route path="/projects/:id/scorer" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <ScorerSheet />
          </RoleProtectedRoute>
        } />

        {/* ✅ 일반 기능 */}
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

        {/* 게시판 */}
        <Route path="/board/list" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <BoardList />
          </RoleProtectedRoute>
        } />
        <Route path="/board/new" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <BoardNew />
          </RoleProtectedRoute>
        } />
        <Route path="/board/:id" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <BoardDetail />
          </RoleProtectedRoute>
        } />
        <Route path="/board/:id/edit" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <BoardEdit />
          </RoleProtectedRoute>
        } />

        {/* 게임 */}
        <Route path="/challenge" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <ChallengeHome />
          </RoleProtectedRoute>
        } />
        <Route path="/challenge/one-to-fifty" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <OneToFiftyGame />
          </RoleProtectedRoute>
        } />
        <Route path="/challenge/one-to-fifty/rank" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <OneToFiftyRanking />
          </RoleProtectedRoute>
        } />
        <Route path="/challenge/apple-ten/AppleTenGameMobile" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <AppleTenGameMobile />
          </RoleProtectedRoute>
        } />
        <Route path="/challenge/apple-ten/AppleTenGamePC" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <AppleTenGamePC />
          </RoleProtectedRoute>
        } />
        <Route path="/challenge/apple-ten/rank" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <AppleTenRank />
          </RoleProtectedRoute>
        } />

        {/* ✅ 어드민 */}
        <Route path="/admin/announcement" element={
          <RoleProtectedRoute allowRoles={["admin", "superadmin"]}>
            <AdminAnnouncementPage />
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
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
