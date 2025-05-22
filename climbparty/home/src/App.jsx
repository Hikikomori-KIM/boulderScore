// 📁 App.jsx
import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Menu from './components/template/Menu';
import Footer from './components/template/Footer';
import { AuthProvider, useAuth } from './components/AuthContext';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { ToastContainer } from "react-toastify";

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
import OneToFiftyGame from './components/challenge/OneToFiftyGame';
import OneToFiftyRanking from './components/challenge/OneToFiftyRanking';
import ChallengeHome from './components/challenge/ChallengeHome';
// import AppleTenGame from './components/challenge/apple-ten/AppleTenGame';
import AppleTenRanking from './components/challenge/apple-ten/AppleTenRank';
import AppleTenRank from './components/challenge/apple-ten/AppleTenRank';
import VersionChecker from './VersionChecker';
import AppleTenGamePC from './components/challenge/apple-ten/AppleTenGamePC';
import AppleTenGameMobile from './components/challenge/apple-ten/AppleTenGameMobile';
import CrewList from './components/crew/CrewList';
import CrewCreate from './components/crew/CrewCreate';
import CrewDetail from './components/crew/CrewDetail';
import RoomCreate from './components/crew/RoomCreate';
import CrewInvite from './components/crew/CrewInvite';
import RoomDetail from './components/crew/RoomDetail';

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

  const navigate = useNavigate();

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isInApp = /kakaotalk|instagram|fbav|line/.test(ua);

    const currentPath = window.location.pathname;

    // 현재 경로가 이미 안내 페이지가 아닐 때만 이동
    if (isInApp && currentPath !== "/open-in-browser") {
      navigate("/open-in-browser");
    }
  }, []);


  useEffect(() => {
    // ✅ 인증이 완료되었을 때만 location 업데이트
    if (firstCheckDone) {
      setFrozenLocation(location);
    }
  }, [firstCheckDone, location]);

  return (
    <div className="pt-5 d-flex flex-column min-vh-100">
      <VersionChecker /> {/* ✅ 여기 추가 */}
      <Menu />

      <Routes location={firstCheckDone ? location : frozenLocation}>
        {/* ✅ 공개 라우트 */}
        <Route path="/" element={<ClimbCountMain />} />
        <Route path="/login" element={<MemberLogin />} />
        <Route path="/join" element={<MemberJoin />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/open-in-browser" element={<OpenInBrowser />} />

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
        {/* 게시판 페이지 */}
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
        {/* 게임 페이지 */}
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
        {/* ✅ 크루/방 페이지 (일반 유저 이상 접근 가능) */}
        <Route path="/crew" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <CrewList />
          </RoleProtectedRoute>
        } />
        <Route path="/crew/create" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <CrewCreate />
          </RoleProtectedRoute>
        } />
        <Route path="/crew/:crewId" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <CrewDetail />
          </RoleProtectedRoute>
        } />
        <Route path="/crew/:crewId/room/create" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <RoomCreate />
          </RoleProtectedRoute>
        } />
        <Route path="/crew/invite/:crewId" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <CrewInvite />
          </RoleProtectedRoute>
        } />
        <Route path="/crew/:crewId/room/:roomId" element={
          <RoleProtectedRoute allowRoles={["user", "admin", "superadmin"]}>
            <RoomDetail />
          </RoleProtectedRoute>
        } />
        {/* ✅ 어드민 전용 보호라우트*/}
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
        {/* ✅ 슈퍼 어드민 전용 보호라우트*/}

      </Routes>

      <Footer />
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}
