export default function Terms() {
  return (
    <div className="bg-light py-5">
      <div className="container">
        <div
          className="bg-white p-5 rounded shadow"
          style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "'Pretendard', sans-serif", lineHeight: "1.8", color: "#333" }}
        >
          <h1 className="mb-4" style={{ fontWeight: 700, fontSize: "2rem", color: "#2c3e50" }}>
            이용약관
          </h1>

          <p className="mb-4" style={{ fontSize: "1.05rem" }}>
            본 웹사이트는 클라이밍 커뮤니티 <strong>“Bouldering Party”</strong>의 참가자들을 위한
            <strong> 비영리 정보 제공 및 기록 시스템</strong>입니다.
            아래의 약관을 통해 본 서비스의 이용 조건을 안내드립니다.
          </p>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>1. 서비스 목적</h6>
            <p>
              본 사이트는 참가자들의 점수 기록, 조 편성, 랭킹 시각화를 목적으로 제공됩니다.
              유료 서비스나 결제 기능은 포함되어 있지 않습니다.
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>2. 사용자 책임</h6>
            <p>
              사용자는 본인의 정보를 정확히 입력해야 하며, 타인의 정보를 무단 도용하거나
              허위로 등록해서는 안 됩니다.
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>3. 콘텐츠 및 기록 관리</h6>
            <p>
              기록된 정보는 관리자가 확인 없이 자동 저장될 수 있으며, 필요한 경우 운영자 판단 하에
              수정 또는 삭제될 수 있습니다.
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>4. 면책 조항</h6>
            <p>
              본 사이트는 자발적인 커뮤니티 기반으로 운영되며, 기술적 오류, 데이터 누락, 서비스 지연 등에
              따른 불이익에 대해 책임을 지지 않습니다. <br />
              또한 상품 지급, 참가비 수납 등은 별도로 운영되며,
              <strong> 해당 금전 거래는 사이트와 무관</strong>합니다.
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>5. 약관 변경</h6>
            <p>
              본 약관은 운영상 필요에 따라 사전 고지 없이 변경될 수 있으며,
              변경된 내용은 본 페이지를 통해 확인할 수 있습니다.
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>6. 문의</h6>
            <p>
              문의는 이메일{" "}
              <a href="mailto:gsb1028@naver.com" className="text-decoration-none" style={{ color: "#007bff" }}>
                gsb1028@naver.com
              </a>{" "}
              또는 인스타그램{" "}
              <a href="https://www.instagram.com/climbxxg/" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: "#007bff" }}>
                @climbxxg
              </a>{" "}
              DM으로 가능합니다.
            </p>
          </section>

          <p className="text-muted mt-5 mb-0 small text-end">
            본 약관은 2025년 4월 19일부터 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
