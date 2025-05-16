import { useEffect } from "react";

export default function VersionChecker() {
  useEffect(() => {
    fetch("/version.json", { cache: "no-store" }) // 항상 최신 버전 가져오기
      .then((res) => res.json())
      .then((data) => {
        const savedVersion = localStorage.getItem("appVersion");
        if (savedVersion && savedVersion !== data.version) {
          alert("새로운 버전이 감지되어 페이지를 새로고침합니다.");
          localStorage.setItem("appVersion", data.version);
          window.location.reload();
        } else {
          localStorage.setItem("appVersion", data.version);
        }
      })
      .catch((err) => {
        console.error("버전 정보 확인 실패:", err);
      });
  }, []);

  return null;
}
