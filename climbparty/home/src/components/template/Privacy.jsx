export default function Privacy() {
  return (
    <div className="bg-light py-5">
      <div className="container">
        <div
          className="bg-white p-5 rounded shadow"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            fontFamily: "'Pretendard', sans-serif",
            lineHeight: "1.8",
            color: "#333",
          }}
        >
          <h1 className="mb-4" style={{ fontWeight: 700, fontSize: "2rem", color: "#2c3e50" }}>
            개인정보처리방침
          </h1>

          <p className="mb-4" style={{ fontSize: "1.05rem" }}>
            <strong>Bouldering Party</strong>는 참가자의 기록 관리 및 랭킹 제공을 위해 최소한의 개인정보를 수집하며,
            수집된 정보는 아래의 목적과 기준에 따라 보호됩니다.
          </p>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>1. 수집 항목</h6>
            <p>
              - 이메일 주소 (로그인 목적)<br />
              - 이름 또는 닉네임 (참가자 식별)<br />
              - 생년월일 (조 편성 및 통계용)
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>2. 수집 목적</h6>
            <p>
              참가자 식별, 점수 기록 저장, 파티 랭킹 집계를 위한 용도로만 사용되며,
              <strong> 마케팅, 광고, 외부 제공 목적은 없습니다.</strong>
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>3. 보관 및 파기</h6>
            <p>
              수집된 개인정보는 참가자의 삭제 요청이 없는 한 계속 보관되며,
              요청 시 합리적인 기간 내 즉시 파기 또는 익명 처리됩니다.
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>4. 외부 제공</h6>
            <p>
              본 사이트는 수집된 개인정보를 제3자에게 제공하지 않으며,
              <strong> 외부 서버나 타 기관과 공유하지 않습니다.</strong>
            </p>
          </section>

          <section>
            <h6 className="text-muted mt-4" style={{ fontWeight: 600 }}>5. 이용자 권리</h6>
            <p>
              사용자는 본인의 개인정보 열람, 수정, 삭제를 언제든지 요청할 수 있으며,<br />
              해당 요청은 이메일{" "}
              <a href="mailto:gsb1028@naver.com" className="text-decoration-none" style={{ color: "#007bff" }}>
                gsb1028@naver.com
              </a>{" "}
              또는 인스타그램{" "}
              <a href="https://www.instagram.com/climbxxg/" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: "#007bff" }}>
                @climbxxg
              </a>{" "}
              DM을 통해 처리됩니다.
            </p>
          </section>

          <p className="text-muted mt-5 mb-0 small text-end">
            본 방침은 2025년 4월 19일부터 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
