import { ShieldCheck, AlertCircle, ActivitySquare, Footprints, Zap } from "lucide-react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuth } from "../components/AuthContext";
import { Modal, Button } from "react-bootstrap";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";

export default function ClimbCountMain() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const hiddenDate = localStorage.getItem("hideAnnouncementDate");

    if (hiddenDate === today) return; // 오늘 안보기 설정되어 있으면 모달 X

    const fetchAnnouncement = async () => {
      const q = query(
        collection(db, "announcements"),
        where("active", "==", true),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setAnnouncement(snapshot.docs[0].data());
        setShowModal(true);
      }
    };
    fetchAnnouncement();
  }, []);


  return (
    <div className="bg-white">
      {/* 공지사항 모달 */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📢 {announcement?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* 날짜와 시간 표시 */}
          {announcement?.createdAt && (
            <div className="text-muted small mb-2">
              📅 {announcement.createdAt.toDate().toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          {/* 본문 내용 */}
          <p style={{ whiteSpace: "pre-line" }}>{announcement?.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>닫기</Button>
          <Button
            variant="outline-secondary"
            onClick={() => {
              const today = new Date().toISOString().slice(0, 10);
              localStorage.setItem("hideAnnouncementDate", today);
              setShowModal(false);
            }}
          >
            오늘 하루 안보기
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Hero Section */}
      <div className="text-center bg-light p-5 border-bottom">
        <h1 className="fw-bold display-4 mb-3" style={{ wordBreak: "keep-all", color: "#2c3e50" }}>
          🧗‍♀️ BolPa
        </h1>
        <h2 className="fs-5 text-muted mb-4">
          함께하는 클라이밍의 즐거움, BolPa에서 시작해요
        </h2>

        <div className="d-flex flex-column align-items-center" style={{ maxWidth: "320px", margin: "0 auto" }}>
          {user ? (
            <a href="/board/list" className="btn btn-primary btn-lg mb-3 w-100 shadow rounded-pill">
              📝 게시판으로 이동
            </a>
          ) : (
            <a href="/join" className="btn btn-success btn-lg mb-3 w-100 shadow rounded-pill">
              🙋 지금 바로 참가하기
            </a>
          )}
          {user && (
            <>
              <a href="/challenge" className="btn btn-outline-dark btn-lg mb-3 w-100 shadow rounded-pill">
                🎮 미니게임 즐기기
              </a>
              <a href="/teamCount" className="btn btn-outline-info btn-lg mb-3 w-100 shadow rounded-pill">
                📊 팀별 점수 보기
              </a>
            </>
          )}
        </div>
      </div>

      {/* 소개 섹션 */}
      <div className="container mt-5">
        <h2 className="text-center mb-3">🎉 BolPa란?</h2>
        <p className="text-center text-muted">
          BolPa는 친구들과 함께 즐기는 <strong>볼더링 점수 공유 플랫폼</strong>이에요.<br />
          클라이밍장에서 각자 클리어한 테이프를 기록하고,<br />
          누가 얼마나 풀었는지, 어떤 테이프가 인기 많은지 <strong>실시간으로 확인</strong>할 수 있어요.
        </p>
        <p className="text-center text-muted">
          대회를 위한 <strong>공식 점수판</strong>은 물론,<br />
          동호회나 친구들끼리 <strong>자율적으로 점수를 기록하며</strong><br />
          가볍게 경쟁하고 추억을 남기는 데에도 적합해요.
        </p>
      </div>

      {/* 사용 방법 섹션 */}
      <div className="container mt-5 mb-5">
        <h2 className="text-center mb-4">📌 어떻게 이용하나요?</h2>

        <p className="text-center text-muted mb-4">
          BolPa는 <strong>2가지 방식</strong>으로 즐길 수 있어요.
        </p>

        <div className="row g-4">
          {/* 자율형 */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold">🙋 자율형 파티</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">1. 로그인 후 원하는 파티에 참가해요.</li>
                  <li className="list-group-item">2. 클라이밍 후 직접 채점지를 작성해요.</li>
                  <li className="list-group-item">3. 나의 점수와 랭킹을 실시간 확인할 수 있어요.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 운영형 */}
          <div className="col-md-6">
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title fw-bold">🎯 대회/운영형 파티</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">1. 사전에 참가 신청하고 현장에 방문해요.</li>
                  <li className="list-group-item">2. 채점자가 클리어 여부를 기록해요.</li>
                  <li className="list-group-item">3. 조별/개인별 점수가 자동 반영돼요.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 제작자 정보 */}
      <div className="card text-center border-0 mt-5 mb-5">
        <div className="card-body">
          <h5 className="card-title fw-bold mb-3">👨‍💻 제작자 정보</h5>
          <p className="card-text">만든이: <strong>김성범</strong></p>

          <div className="d-flex justify-content-center align-items-center gap-3">
            <a href="https://www.instagram.com/climbxxg/" target="_blank" rel="noreferrer" className="text-decoration-none d-flex align-items-center gap-1">
              <i className="bi bi-instagram" style={{ color: "#E4405F", fontSize: "1.2rem" }}></i>
              @climbxxg
            </a>

            <a href="mailto:gsb1028@naver.com" className="text-decoration-none d-flex align-items-center gap-1">
              <i className="bi bi-envelope-fill" style={{ color: "#0d6efd", fontSize: "1.2rem" }}></i>
              gsb1028@naver.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
