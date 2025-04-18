import { Route, Routes } from 'react-router-dom';
import './App.css';
import TeamCount from './components/TeamCount';
import Menu from './components/template/Menu';
import MemberLogin from './components/member/MemberLogin';
import MemberJoin from './components/member/MemberJoin';
import AdminMemberAdd from './components/admin/AdminMemberAdd';
import AdminUserList from './components/admin/AdminUserList';
import AdminGymPage from './components/admin/AdminGymPage';
import TapeRank from './components/rank/tapeRank';
import { AuthProvider } from './components/AuthContext';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ClimbCountMain from './components/ClimbCountMain';
import MyPage from './components/member/MemberMypage';
import AdminPartyTeamPage from './components/admin/AdminPartyTeamPage';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import ScorerSheet from './components/scorerSheet';
import AdminRankingPage from './components/admin/AdminRankingPage';
import AdminPartyTape from './components/admin/AdminPartyTape';

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (FirebaseUser) => {
      if (FirebaseUser) {
        if (!FirebaseUser.emailVerified) {
          await signOut(auth);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }

        setUser(FirebaseUser);

        try {
          const docRef = doc(db, "users", FirebaseUser.uid);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserRole(data.role || "user");
          } else {
            setUserRole("user");
          }
        } catch (err) {
          console.error("role 가져오기 오류:", err);
          setUserRole("user");
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <div className='pt-5'>
        <Menu user={user} userRole={userRole} />

        {loading ? (
          <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status" />
              <div className="fw-semibold">로그인 상태를 확인 중입니다...</div>
            </div>
          </div>
        ) : (
          <>
            <Routes>
              <Route path='/' element={<ClimbCountMain user={user} />} />
              <Route path='/login' element={<MemberLogin />} />
              <Route path='/join' element={<MemberJoin />} />
              <Route path='/teamCount' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["user", "admin", "superadmin"]}>
                  <TeamCount />
                </RoleProtectedRoute>
              } />
              <Route path='/rank/tape' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["user", "admin", "superadmin"]}>
                  <TapeRank />
                </RoleProtectedRoute>
              } />
              <Route path='/mypage' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["user", "admin", "superadmin"]}>
                  <MyPage />
                </RoleProtectedRoute>
              } />
              <Route path='/ScorerSheet' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["admin", "superadmin"]}>
                  <ScorerSheet />
                </RoleProtectedRoute>
              } />
              <Route path='/admin/userlist' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["admin", "superadmin"]}>
                  <AdminUserList />
                </RoleProtectedRoute>
              } />
              <Route path='/admin/gym' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["admin", "superadmin"]}>
                  <AdminGymPage />
                </RoleProtectedRoute>
              } />
              <Route path='/admin/party-team' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["admin", "superadmin"]}>
                  <AdminPartyTeamPage />
                </RoleProtectedRoute>
              } />
              <Route path='/admin/rankPage' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["admin", "superadmin"]}>
                  <AdminRankingPage />
                </RoleProtectedRoute>
              } />
              <Route path='/admin/partyTape' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["admin", "superadmin"]}>
                  <AdminPartyTape />
                </RoleProtectedRoute>
              } />
              <Route path='/admin/add' element={
                <RoleProtectedRoute user={user} userRole={userRole} allowRoles={["superadmin"]}>
                  <AdminMemberAdd />
                </RoleProtectedRoute>
              } />
            </Routes>

            {/* Footer 크레딧 */}
            <footer className="text-center text-muted py-4 border-top mt-5 small">
              © 2025 Bouldering Party. All rights reserved.
              <br />
              This site uses open-source libraries under the MIT License:
              React, Recharts, react-icons, echarts-for-react, etc.
            </footer>
          </>
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
