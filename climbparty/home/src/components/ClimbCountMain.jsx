import { ShieldCheck, AlertCircle, ActivitySquare, Footprints, Zap } from "lucide-react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from "../components/AuthContext";


export default function ClimbCountMain() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center bg-light p-5 border-bottom">
        <h1 className="fw-bold display-5 mb-3" style={{ wordBreak: "keep-all" }}>
          🧗‍♀️ Bouldering Party<br className="d-sm-none" />
          <span className="text-primary">함께 즐기는 클라이밍 축제</span>
        </h1>

        <p className="fs-5 text-muted mb-4">
          친구들과 함께, 점수로 즐기는 실시간 클라이밍 랭킹!
        </p>

        {user ? (
          <a href="/board/list" className="btn btn-primary btn-lg shadow-sm">
            게시판으로 이동하기
          </a>
        ) : (
          <a href="/join" className="btn btn-primary btn-lg shadow-sm">
            지금 참가하기
          </a>
        )}
      </div>

      {/* 소개 섹션 */}
      <div className="container mt-5">
        <h2 className="text-center mb-3">🎯 Bouldering Party란?</h2>
        <p className="text-center text-muted">
          Bouldering Party는 누구나 참여할 수 있는 친목 클라이밍 이벤트입니다.<br />
          실시간 랭킹, 팀별 점수 시스템을 통해 재미있게 즐겨보세요!
        </p>
      </div>

      {/* 안전사항 섹션 */}
      <div className="container mt-5 mb-5">
        <h2 className="text-center mb-4">
          <ShieldCheck size={32} className="me-2 text-primary" />
          안전사항 및 유의사항
        </h2>
        <ul className="list-group">
          <li className="list-group-item d-flex align-items-center">
            <AlertCircle className="me-3 text-danger" />
            매트 위에서 뛰거나 장난치지 마세요.
          </li>
          <li className="list-group-item d-flex align-items-center">
            <Footprints className="me-3 text-secondary" />
            등반 전 주변 사람과의 간격을 확인하세요.
          </li>
          <li className="list-group-item d-flex align-items-center">
            <Zap className="me-3 text-warning" />
            음주 후 클라이밍은 절대 금지입니다.
          </li>
          <li className="list-group-item d-flex align-items-center">
            <ActivitySquare className="me-3 text-info" />
            낙하 시 주변 사람과 충돌하지 않도록 주의하세요.
          </li>
          <li className="list-group-item d-flex align-items-center">
            <ShieldCheck className="me-3 text-success" />
            부상 방지를 위해 충분한 준비운동을 해주세요.
          </li>
          <li className="list-group-item d-flex align-items-center">
            <ShieldCheck className="me-3 text-muted" />
            다치면 상품은 지급 안됩니다 😢 꼭 안전하게 즐겨주세요!
          </li>
        </ul>
      </div>

      {/* 제작자 정보 섹션 */}
      <div className="card text-center border-0 mt-5">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">👨‍💻 제작자 정보</h5>

          <p className="card-text">
            만든이: <strong>김성범</strong>
          </p>

          <p className="card-text d-flex justify-content-center align-items-center gap-2">
            <i className="bi bi-instagram" style={{ color: "#E4405F", fontSize: "1.2rem" }}></i>
            <a href="https://www.instagram.com/climbxxg/" target="_blank" rel="noreferrer" className="text-decoration-none">
              @climbxxg
            </a>
          </p>

          <p className="card-text d-flex justify-content-center align-items-center gap-2">
            <i className="bi bi-envelope-fill" style={{ color: "#0d6efd", fontSize: "1.2rem" }}></i>
            <a href="mailto:gsb1028@naver.com" className="text-decoration-none">
              gsb1028@naver.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
