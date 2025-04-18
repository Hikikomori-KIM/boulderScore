// 📁 src/components/ClimbCountMain.jsx
import { ShieldCheck, AlertCircle, ActivitySquare, Footprints, Zap } from "lucide-react";

export default function ClimbCountMain({ user }) {
  return (
    <div>
      {/* Hero Section */}
      <div className="text-center bg-primary text-white p-5">
        <h1 className="display-4 fw-bold">🎉 Bouldering Party에 오신 걸 환영합니다!</h1>
        <p className="fs-5 mt-3">지금 바로 참가하고 클라이밍 랭킹에 도전해보세요!</p>
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
            다치면 상품은 지금 안됩니다 😢 꼭 안전하게 즐겨주세요!
          </li>
        </ul>
      </div>

      {/* 제작자 정보 섹션 */}
      <div className="container mt-5 mb-5">
        <hr />
        <div className="text-center">
          <h5 className="mb-3">👨‍💻 제작자 정보</h5>
          <p className="mb-1">만든이: <strong>김성범</strong></p>
          <p className="mb-1">
            인스타그램: <a href="https://www.instagram.com/climbxxg/" target="_blank" rel="noopener noreferrer">https://www.instagram.com/climbxxg/</a>
          </p>
          <p className="mb-1">
            이메일: <span> gsb1028@naver.com </span>
          </p>
        </div>
      </div>
    </div>
  );
}
