import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-4 mt-auto">
      <div className="container text-center small">
        <p className="mb-1">
          © 2025 <strong>Bouldering Party</strong>. All rights reserved.
        </p>

        <p className="mb-1">
          본 사이트는 클라이밍 커뮤니티를 위한 <strong>비영리 프로젝트</strong>입니다.  
          채점 및 기록 제공 외의 상업적 기능은 포함되어 있지 않으며,  
          참가비 결제 및 상품 제공 등은 사이트 외부에서 진행됩니다.
        </p>

        <p className="mb-2">
          본 사이트는 <strong>자동화된 시스템</strong>에 의해 운영되며,  
          실시간 응답이나 수동 관리를 보장하지 않습니다.  
          데이터 오류, 순위 변동, 누락 정보에 대해 운영자는 책임지지 않으며,  
          모든 문의는 이메일 또는 인스타그램을 통해 접수받습니다.
        </p>

        <p className="mb-3">
          문의:{" "}
          <a href="mailto:gsb1028@naver.com" className="text-info text-decoration-none">
            gsb1028@naver.com
          </a>{" "}
          /{" "}
          <a href="https://www.instagram.com/climbxxg/" target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none">
            @climbxxg (Instagram)
          </a>
        </p>

        <div className="mb-2">
          <Link to="/terms" className="text-secondary me-3 text-decoration-none">
            이용약관
          </Link>
          <Link to="/privacy" className="text-secondary text-decoration-none">
            개인정보처리방침
          </Link>
        </div>

        <div>
          <a
            href="https://www.instagram.com/boulderingparty"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light me-3 fs-5"
          >
            <i className="bi bi-instagram"></i>
          </a>
          <a
            href="https://github.com/your_github"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-5"
          >
            <i className="bi bi-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
