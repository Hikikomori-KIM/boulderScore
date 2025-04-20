import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { googleLogin, saveUserAfterAgreement } from "../../firebaseFunctions";
import { useNavigate } from "react-router-dom";

export default function GoogleLoginWithAgreement() {
  const [show, setShow] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    if (!agreeTerms || !agreePrivacy) return;

    setLoading(true);

    try {
      console.log("🧠 로그인 시도 중...");
      const user = await googleLogin();
      console.log("✅ 로그인 성공, 유저:", user);

      await saveUserAfterAgreement(user);
      console.log("✅ 약관 동의 저장 완료");

      alert("🎉 로그인 성공!");

      navigate("/"); // ✅ 홈으로 이동
      setTimeout(() => window.location.reload(), 100); // ✅ 상태 강제 반영
    } catch (error) {
      console.error("❌ Google 로그인 실패:", error);
      alert("❌ Google 로그인 실패: " + error.message);
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ 구글 로그인 버튼 */}
      <Button
        variant="light"
        className="border w-100 rounded-pill d-flex align-items-center justify-content-center"
        onClick={() => setShow(true)}
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          width="20"
          className="me-2"
        />
        구글 계정으로 로그인
      </Button>

      {/* ✅ 약관 동의 모달 */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>약관 동의</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Check
            type="checkbox"
            label={
              <span>
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                  이용약관
                </a>{" "}
                에 동의합니다.
              </span>
            }
            checked={agreeTerms}
            onChange={() => setAgreeTerms(!agreeTerms)}
          />
          <Form.Check
            className="mt-3"
            type="checkbox"
            label={
              <span>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                  개인정보처리방침
                </a>{" "}
                에 동의합니다.
              </span>
            }
            checked={agreePrivacy}
            onChange={() => setAgreePrivacy(!agreePrivacy)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)} disabled={loading}>
            취소
          </Button>
          <Button
            variant="primary"
            disabled={!(agreeTerms && agreePrivacy) || loading}
            onClick={handleGoogleLogin}
          >
            {loading ? "처리 중..." : "동의하고 계속하기"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
