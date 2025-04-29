import React from "react";
import { FaSmileWink } from "react-icons/fa";

export default function OpenInBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|mac/.test(ua);
  const siteURL = "https://climbparty.web.app";

  const handleOpenChrome = () => {
    window.location.href =
      "intent://climbparty.web.app#Intent;scheme=https;package=com.android.chrome;end";
  };

  const handleDownloadChrome = () => {
    window.location.href =
      "https://apps.apple.com/kr/app/google-chrome/id535886823";
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(siteURL);
    alert("링크가 복사되었어요! 크롬 앱에 붙여넣기 해주세요 😊");
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
        <>
          <p style={{ fontSize: "0.95rem", color: "#444" }}>
            <b>iPhone 사용자</b>는 아래 순서대로 진행해주세요!
          </p>

          <ol
            style={{
              textAlign: "left",
              margin: "12px 0",
              paddingLeft: "20px",
              color: "#555",
              fontSize: "0.95rem",
              maxWidth: "300px",
            }}
          >
            <li>Chrome 앱을 설치해주세요</li>
            <li>Chrome 실행 후 아래 링크를 붙여넣어 접속해주세요</li>
          </ol>

          <button
            onClick={handleDownloadChrome}
            style={{
              marginTop: "8px",
              padding: "10px 20px",
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "1rem",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            Chrome 설치하기
          </button>

          <input
            value={siteURL}
            readOnly
            onClick={(e) => e.target.select()}
            style={{
              width: "100%",
              maxWidth: "320px",
              padding: "10px",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              textAlign: "center",
              marginBottom: "10px",
            }}
          />
          <button
            onClick={handleCopyURL}
            style={{
              padding: "8px 16px",
              backgroundColor: "#FF7F50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            링크 복사하기
          </button>
        </>
      )}

      <p style={{ fontSize: "0.85rem", color: "#aaa", marginTop: "30px" }}>
        항상 <b>Chrome 브라우저</b>에서 접속해야 Google 로그인이 정상 작동합니다 😊
      </p>
    </div>
  );
}
