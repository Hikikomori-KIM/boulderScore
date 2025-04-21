import React from "react";
import { FaSmileWink } from "react-icons/fa";

export default function OpenInBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|mac/.test(ua);

  const handleOpenChrome = () => {
    // 🔁 너의 도메인으로 바뀐 크롬 intent 링크
    window.location.href = "intent://climbparty.web.app#Intent;scheme=https;package=com.android.chrome;end";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFF9EC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Nunito', sans-serif",
        textAlign: "center",
        flexDirection: "column",
      }}
    >
      <FaSmileWink size={48} color="#FFA500" style={{ marginBottom: "10px" }} />
      <h2 style={{ color: "#FF7F50", fontSize: "1.8rem", marginBottom: "10px" }}>
        브라우저에서 열어주세요!
      </h2>

      <p style={{ fontSize: "1rem", color: "#555", maxWidth: "320px", marginBottom: "20px" }}>
        현재 카카오톡 등 인앱 브라우저에서는 <br /> Google 로그인이 차단되어 있어요.
      </p>

      {isAndroid && (
        <>
          <p style={{ fontSize: "0.95rem", color: "#444" }}>
            아래 버튼을 누르면 <b>Chrome</b>으로 열 수 있어요!
          </p>
          <button
            onClick={handleOpenChrome}
            style={{
              marginTop: "12px",
              padding: "10px 20px",
              backgroundColor: "#FF7F50",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Chrome으로 열기
          </button>
        </>
      )}

      {isIOS && (
        <div style={{ marginTop: "12px", color: "#666", fontSize: "0.95rem", maxWidth: "320px" }}>
          <p>아래 단계로 Safari,chrome 에서 열 수 있어요 🧭</p>
          <ol style={{ textAlign: "left", margin: "0 auto", padding: "0 0 0 16px" }}>
            <li>하단 공유 아이콘(📤) 클릭</li>
            <li>"Safari, chrome 에서 열기" 선택</li>
          </ol>
        </div>
      )}

      <p style={{ fontSize: "0.85rem", color: "#aaa", marginTop: "30px" }}>
        항상 외부 브라우저에서 접속해주셔야 Google 로그인이 정상 작동합니다 😊
      </p>
    </div>
  );
}
