import React, { useState } from "react";
import holdImage from "../../assets/hold.jpg";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

export default function Menu({ user, userRole }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false); // ✅ 추가

  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isSuperAdmin = userRole === "superadmin";

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    alert("로그아웃 되었습니다!");
    navigate("/");
  };

  return (
    <>
      <nav className="navbar navbar-light bg-light fixed-top shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center px-3">
          {/* 로고 + 텍스트 */}
          <Link to="/" className="d-flex align-items-center text-decoration-none text-dark gap-2">
            <img
              src={holdImage}
              height="35"
              alt="logo"
              className="d-inline-block align-middle"
              style={{ verticalAlign: "middle" }}
            />
            <strong className="fs-5 mb-0">볼더링파티 점수판</strong>
          </Link>

          {/* ✅ PC 메뉴 */}
          <div className="d-none d-lg-flex align-items-center gap-2 flex-nowrap fw-semibold">
            <Link to="/teamCount" className="text-dark text-decoration-none px-2">📊 팀 점수</Link>
            <Link to="/rank/tape" className="text-dark text-decoration-none px-2">🧗 테이프 랭킹</Link>

            {isAdmin && (
              <>
                <Link to="/ScorerSheet" className="text-dark text-decoration-none px-2">🧑‍🏫 채점지</Link>

                {/* ✅ 드롭다운 관리자 메뉴 */}
                <div className="dropdown">
                  <button className="btn btn-outline-dark btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                    🛠 관리자
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link to="/admin/userlist" className="dropdown-item">👥 권한부여</Link></li>
                    <li><Link to="/admin/gym" className="dropdown-item">🏟 암장설정</Link></li>
                    <li><Link to="/admin/party-team" className="dropdown-item">🎉 파티명&조별설정</Link></li>
                    <li><Link to="/admin/rankPage" className="dropdown-item">📊 전체랭킹</Link></li>
                    {isSuperAdmin && (
                      <li><Link to="/admin/add" className="dropdown-item">🛠 등록</Link></li>
                    )}
                  </ul>
                </div>
              </>
            )}

            {user ? (
              <>
                <span className="text-muted small text-nowrap px-2">{user.displayName} ({user.email})</span>
                <Link to="/mypage" className="btn btn-outline-info btn-sm rounded-pill">마이페이지</Link>
                <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={handleLogout}>로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary btn-sm rounded-pill">로그인</Link>
                <Link to="/join" className="btn btn-primary btn-sm rounded-pill">회원가입</Link>
              </>
            )}
          </div>

          {/* ✅ 모바일 햄버거 버튼 */}
          <button className="btn btn-outline-dark d-lg-none" onClick={() => setOpen(true)}>
            ☰
          </button>
        </div>
      </nav>

      {/* ✅ 모바일 메뉴 오버레이 */}
      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white zindex-modal d-flex flex-column p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="text-end">
            <button className="btn btn-outline-dark" onClick={() => setOpen(false)}>❌ 닫기</button>
          </div>

          <div className="mt-4 text-center d-flex flex-column gap-3 fs-5 fw-semibold">
            <Link to="/teamCount" className="text-dark" onClick={() => setOpen(false)}>📊 팀 점수</Link>
            <Link to="/rank/tape" className="text-dark" onClick={() => setOpen(false)}>🧗 테이프별 랭킹</Link>

            {/* ✅ 모바일 관리자 메뉴 드롭다운 */}
            {isAdmin && (
              <>
                <div className="border-top pt-3 mt-3">
                  <button
                    className="btn btn-outline-dark w-100"
                    onClick={() => setIsAdminMenuOpen((prev) => !prev)}
                  >
                    🛠 관리자 메뉴 {isAdminMenuOpen ? "▲" : "▼"}
                  </button>

                  {isAdminMenuOpen && (
                    <div className="d-flex flex-column gap-2 mt-3 px-2">
                      <Link to="/ScorerSheet" className="text-dark" onClick={() => setOpen(false)}>🧑‍🏫 채점하기</Link>
                      <Link to="/admin/userlist" className="text-dark" onClick={() => setOpen(false)}>👥 사용자 권한 관리</Link>
                      <Link to="/admin/gym" className="text-dark" onClick={() => setOpen(false)}>🏟 암장/테이프 관리</Link>
                      <Link to="/admin/party-team" className="text-dark" onClick={() => setOpen(false)}>🎉 파티 & 조 구성</Link>
                      <Link to="/admin/rankPage" className="text-dark" onClick={() => setOpen(false)}>📊 전체랭킹</Link>
                      {isSuperAdmin && (
                        <Link to="/admin/add" className="text-dark" onClick={() => setOpen(false)}>🛠 관리자 등록</Link>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {user ? (
              <>
                <hr />
                <div className="text-muted small">{user.displayName} ({user.email})</div>
                <Link to="/mypage" className="btn btn-outline-info" onClick={() => setOpen(false)}>마이페이지</Link>
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
