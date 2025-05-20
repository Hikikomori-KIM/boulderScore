import { useEffect } from "react";

export default function VersionChecker() {
  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const savedVersion = localStorage.getItem("appVersion");

        if (savedVersion && savedVersion !== data.version) {
          alert("새 버전이 감지되어 새로고침합니다.");
          localStorage.setItem("appVersion", data.version);

          // ✅ 쿼리스트링으로 강제 reload + 캐시 우회
          const url = new URL(window.location.href);
          url.searchParams.set("v", data.version);
          window.location.href = url.toString(); // ✅ 새 주소로 이동 (캐시 안 씀)
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
