import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Navbar, Nav, Container } from "react-bootstrap";
import { FiLogIn, FiLogOut, FiSettings, FiUserPlus, FiClipboard, FiUsers } from "react-icons/fi";
import { TbChecklist, TbLayoutDashboard } from "react-icons/tb";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdEmojiEvents, MdGroupAdd, MdLeaderboard } from "react-icons/md";

function Menu() {
  const navigate = useNavigate();
  const { user, logout, selectedProject, userRole } = useAuth();
  const [expanded, setExpanded] = useState(false); // 메뉴 토글 상태

  const handleLogout = () => {
    logout();
    navigate("/login");
    setExpanded(false); // 로그아웃 시 메뉴 닫기
  };

  const handleNavClick = () => {
    setExpanded(false); // 메뉴 항목 클릭 시 닫기
  };

  return (
    <>
    <Navbar bg="light" expand="lg" expanded={expanded} className="shadow-sm mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={handleNavClick}>
          🎯 볼파 (BolPa)
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" onClick={() => setExpanded(!expanded)} />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/projects/list" onClick={handleNavClick}>
                  <FiClipboard className="me-1" />
                  내 프로젝트
                </Nav.Link>
                <Nav.Link as={Link} to="/join" onClick={handleNavClick}>
                  <FiUserPlus className="me-1" />
                  초대코드 입장
                </Nav.Link>
              </>
            )}
            {user && selectedProject && (
              <>
                <Nav.Link as={Link} to="/ScorerSheet" onClick={handleNavClick}>
                  <FaChalkboardTeacher className="me-1" />
                  채점하기
                </Nav.Link>
                {(userRole === "admin" || userRole === "superadmin") && (
                  <>
                    <Nav.Link as={Link} to="/admin/userlist" onClick={handleNavClick}>
                      <FiUsers className="me-1" />
                      사용자 권한 관리
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/gym" onClick={handleNavClick}>
                      <FiSettings className="me-1" />
                      암장/테이프 관리
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/party-team" onClick={handleNavClick}>
                      <MdGroupAdd className="me-1" />
                      파티 & 조 구성
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/partyTape" onClick={handleNavClick}>
                      <MdEmojiEvents className="me-1" />
                      테이프 점수 설정
                    </Nav.Link>
                    <Nav.Link as={Link} to="/admin/rankPage" onClick={handleNavClick}>
                      <MdLeaderboard className="me-1" />
                      전체 랭킹
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>

          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/mypage" onClick={handleNavClick}>
                  <TbLayoutDashboard className="me-1" />
                  마이페이지
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>
                  <FiLogOut className="me-1" />
                  로그아웃
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/join" onClick={handleNavClick}>
                  <FiUserPlus className="me-1" />
                  초대코드 입장
                </Nav.Link>
                <Nav.Link as={Link} to="/login" onClick={handleNavClick}>
                  <FiLogIn className="me-1" />
                  로그인
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </>
  );
}

export default Menu;
