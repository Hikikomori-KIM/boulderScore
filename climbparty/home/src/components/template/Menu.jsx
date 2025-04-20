// 📁 src/components/template/Menu.jsx
import React, { useState } from "react";
import holdImage from "../../assets/hold.jpg";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "../AuthContext";

export default function Menu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const { user, userRole } = useAuth();
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isSuperAdmin = userRole === "superadmin";

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    alert("로그아웃 되었습니다!");
    navigate("/");
  };

  const handleProtectedClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      <nav className="navbar navbar-light bg-light fixed-top shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center px-3">
          <Link to="/" className="d-flex align-items-center text-decoration-none text-dark gap-2">
            <img src={holdImage} height="35" alt="logo" style={{ verticalAlign: "middle" }} />
            <strong className="fs-5 mb-0">볼더링파티 점수판</strong>
          </Link>

          <div className="d-none d-lg-flex align-items-center gap-2 flex-nowrap fw-semibold">
            <a href="/teamCount" className="text-dark text-decoration-none px-2" onClick={(e) => handleProtectedClick(e, "/teamCount")}>📊 조별 점수 보기</a>
            <a href="/rank/tape" className="text-dark text-decoration-none px-2" onClick={(e) => handleProtectedClick(e, "/rank/tape")}>🧗 색상별 전체 랭킹</a>
            <a href="/board/list" className="text-dark text-decoration-none px-2" onClick={(e) => handleProtectedClick(e, "/board/list")}>📝 자유게시판(공사중)</a>


            {isAdmin && (
              <>
                <a href="/ScorerSheet" className="text-dark text-decoration-none px-2" onClick={(e) => handleProtectedClick(e, "/ScorerSheet")}>🧑‍🏫 채점지</a>
                <div className="dropdown">
                  <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                    🛠 관리자
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><a href="/admin/userlist" className="dropdown-item" onClick={(e) => handleProtectedClick(e, "/admin/userlist")}>👥 권한부여</a></li>
                    <li><a href="/admin/gym" className="dropdown-item" onClick={(e) => handleProtectedClick(e, "/admin/gym")}>🏟 암장설정</a></li>
                    <li><a href="/admin/party-team" className="dropdown-item" onClick={(e) => handleProtectedClick(e, "/admin/party-team")}>🎉 파티명&조별설정</a></li>
                    <li><a href="/admin/partyTape" className="dropdown-item" onClick={(e) => handleProtectedClick(e, "/admin/partyTape")}>🎨 테이프 점수 설정</a></li> {/* ✅ 추가 */}
                    <li><a href="/admin/rankPage" className="dropdown-item" onClick={(e) => handleProtectedClick(e, "/admin/rankPage")}>📊 전체랭킹</a></li>
                  </ul>
                </div>
              </>
            )}

            {user ? (
              <>
                <span className="text-muted small text-nowrap px-2">{user.displayName} ({user.email})</span>
                <a href="/mypage" className="btn btn-outline-info btn-sm rounded-pill" onClick={(e) => handleProtectedClick(e, "/mypage")}>마이페이지</a>
                <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill">로그인</Link>
                <Link to="/join" className="btn btn-primary btn-sm rounded-pill">회원가입</Link>
              </>
            )}
          </div>

          <button className="btn btn-outline-dark d-lg-none" onClick={() => setOpen(true)}>☰</button>
        </div>
      </nav>

      {open && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-white zindex-modal d-flex flex-column p-4" style={{ zIndex: 9999 }}>
          <div className="text-end">
            <button className="btn btn-outline-dark" onClick={() => setOpen(false)}>❌ 닫기</button>
          </div>

          <div className="mt-4 text-center d-flex flex-column gap-3 fs-5 fw-semibold">
            <a href="/teamCount" className="text-dark" onClick={(e) => handleProtectedClick(e, "/teamCount")}>📊 조별 점수 보기</a>
            <a href="/rank/tape" className="text-dark" onClick={(e) => handleProtectedClick(e, "/rank/tape")}>🧗 색상별 전체 랭킹</a>
            <a href="/board/list" className="text-dark text-decoration-none px-2" onClick={(e) => handleProtectedClick(e, "/board/list")}>📝 자유게시판(공사중)</a>

            {isAdmin && (
              <div className="border-top pt-3 mt-3">
                <button className="btn btn-outline-dark w-100" onClick={() => setIsAdminMenuOpen((prev) => !prev)}>
                  🛠 관리자 메뉴 {isAdminMenuOpen ? "▲" : "▼"}
                </button>

                {isAdminMenuOpen && (
                  <div className="d-flex flex-column gap-2 mt-3 px-2">
                    <a href="/ScorerSheet" className="text-dark" onClick={(e) => handleProtectedClick(e, "/ScorerSheet")}>🧑‍🏫 채점하기</a>
                    <a href="/admin/userlist" className="text-dark" onClick={(e) => handleProtectedClick(e, "/admin/userlist")}>👥 사용자 권한 관리</a>
                    <a href="/admin/gym" className="text-dark" onClick={(e) => handleProtectedClick(e, "/admin/gym")}>🏟 암장/테이프 관리</a>
                    <a href="/admin/party-team" className="text-dark" onClick={(e) => handleProtectedClick(e, "/admin/party-team")}>🎉 파티 & 조 구성</a>
                    <a href="/admin/partyTape" className="text-dark" onClick={(e) => handleProtectedClick(e, "/admin/partyTape")}>🎨 테이프 점수 설정</a> {/* ✅ 추가 */}
                    <a href="/admin/rankPage" className="text-dark" onClick={(e) => handleProtectedClick(e, "/admin/rankPage")}>📊 전체랭킹</a>
                  </div>
                )}
              </div>
            )}

            {user ? (
              <>
                <hr />
                <div className="text-muted small">{user.displayName} ({user.email})</div>
                <a href="/mypage" className="btn btn-outline-info" onClick={(e) => handleProtectedClick(e, "/mypage")}>마이페이지</a>
                <button className="btn btn-outline-secondary" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <>
                <hr />
                <Link to="/login" className="btn btn-outline-primary" onClick={() => setOpen(false)}>로그인</Link>
                <Link to="/join" className="btn btn-primary" onClick={() => setOpen(false)}>회원가입</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
