import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import { saveOneToFiftyRecord } from "../../firebaseFunctions";
import styles from "./OneToFiftyGame.module.css";
import GridButton from "../../components/challenge/GridButton";

export default function OneToFiftyGame() {
  const [grid, setGrid] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);
  const [visibleCountdown, setVisibleCountdown] = useState(null);
  const [countingDown, setCountingDown] = useState(false);
  const hasShownMouseIdleWarning = useRef(false); // ⬅️ 중복 alert 방지용
  const [lastMouseMoveTime, setLastMouseMoveTime] = useState(Date.now());
  const isTouchDevice = useRef(false);

  // ✅ Web Audio API 관련 Ref
  const audioCtxRef = useRef(null);
  const bufferRef = useRef(null);

  useEffect(() => {
    // 모바일 디바이스 감지
    isTouchDevice.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // PC인 경우에만 마우스 감지
    if (!isTouchDevice.current) {
      const handleMove = () => {
        setLastMouseMoveTime(Date.now());
        hasShownMouseIdleWarning.current = false; // ⬅️ 마우스 움직이면 경고 초기화
      };
      window.addEventListener("mousemove", handleMove);

      return () => window.removeEventListener("mousemove", handleMove);
    }
  }, []);

  useEffect(() => {
    if (!isTouchDevice.current) {
      const interval = setInterval(() => {
        if (!started) return; // 게임이 시작되지 않았으면 검사 안 함

        const now = Date.now();
        const idleTime = now - lastMouseMoveTime;

        if (idleTime > 3000 && !hasShownMouseIdleWarning.current) {
          alert("마우스를 3초 이상 움직이지 않았습니다. 자동화 사용이 의심됩니다.");
          hasShownMouseIdleWarning.current = true;
        }
      }, 500); // 0.5초마다 검사

      return () => clearInterval(interval);
    }
  }, [started, lastMouseMoveTime]);


  // ✅ 오디오 초기화 (mp3 버퍼 로드)
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    fetch("/sounds/coin.mp3")
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => ctx.decodeAudioData(arrayBuffer))
      .then(decoded => {
        bufferRef.current = decoded;
      });

    return () => {
      ctx.close();
    };
  }, []);

  // ✅ 고성능 사운드 재생 함수
  const playClickSound = () => {
    const ctx = audioCtxRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !buffer) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (startTime && !endTime) {
      interval = setInterval(() => {
        setElapsed(((Date.now() - startTime) / 1000).toFixed(2));
      }, 100);
    }
    if (endTime) {
      clearInterval(interval);
      setElapsed(((endTime - startTime) / 1000).toFixed(2));
    }
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const prepareGrid = () => {
    const top = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const bottom = Array.from({ length: 25 }, (_, i) => i + 26).sort(() => Math.random() - 0.5);
    const initialGrid = top.map((num, idx) => ({
      top: num,
      bottom: bottom[idx] || null,
    }));
    setGrid(initialGrid);
    setCurrentNumber(1);
    setStartTime(null);
    setEndTime(null);
    setElapsed(0);
    setStarted(false);
    setIsSubmitted(false);
    setRecordSaved(false);

    setLastMouseMoveTime(Date.now()); // ✅ 이 줄 추가!
    document.body.style.overflow = "auto";
  };

  const startCountdown = () => {
    if (countingDown) return; // 중복 방지
    setCountingDown(true);
    prepareGrid();
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    const steps = ["3", "2", "1"];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setVisibleCountdown(step);
      }, index * 1000);
    });

    // 마지막만 실행
    const countdownDuration = steps.length * 1000;
    setTimeout(() => {
      setVisibleCountdown(null);
      setStarted(true);
      setStartTime(Date.now());
      setCountingDown(false);
    }, countdownDuration);
  };


  const handleClick = (idx) => {
    if (countingDown || !started) return; // 카운트다운 중엔 클릭 금지

    if (!isTouchDevice.current) {
      const now = Date.now();
      const idleDuration = now - lastMouseMoveTime;

      if (idleDuration > 3000) {
        alert("마우스를 마지막으로 움직인 지 3초 이상 지났습니다. 마우스를 움직여주세요!");
        return;
      }
    }


    if (grid[idx].top !== currentNumber) return;

    playClickSound();

    setCurrentNumber((prev) => prev + 1);
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const next = newGrid[idx].bottom;
      newGrid[idx] = { top: next, bottom: null };
      return newGrid;
    });

    if (currentNumber === 50) {
      setEndTime(Date.now());
      document.body.style.overflow = "auto";
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 300);
    }
  };


  const submitRecord = async () => {
    const user = getAuth().currentUser;
    if (!user) {
      alert("로그인 후 기록을 저장할 수 있습니다.");
      return;
    }
    const saved = await saveOneToFiftyRecord(user.uid, user.displayName || "이름없음", elapsed);
    setRecordSaved(saved);
    setIsSubmitted(true);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.headerBox} ${styles.glass}`}>
        <h2 className={styles.title}>1 to 50</h2>
        <div className={styles.timerBox}>
          {started && <p className={styles.timer}>⏱️ {elapsed}초</p>}
        </div>
        {(started || grid.length > 0) && (
          <button
            className={`${styles.retryBtn} ${styles.glass}`}
            onClick={startCountdown}
            disabled={countingDown}
          >
            🔄 다시하기
          </button>

        )}
      </div>

      {!started && grid.length === 0 && (
        <button
          className={`${styles.startBtn} ${styles.glass}`}
          onClick={startCountdown}
          disabled={countingDown}
        >
          게임 시작
        </button>

      )}

      {visibleCountdown && <div className={styles.countdown}>{visibleCountdown}</div>}

      {grid.length > 0 && (
        <div className={styles.grid}>
          {grid.map((cell, idx) => (
            <GridButton
              key={idx}
              cell={cell}
              idx={idx}
              onClick={handleClick}
              started={started}
            />
          ))}
        </div>
      )}

      {endTime && !isSubmitted && (
        <div className={`${styles.recordBox} ${styles.glass}`}>
          <p>기록을 저장하시겠습니까?</p>
          <button className={styles.submitBtn} onClick={submitRecord}>
            기록 제출
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className={`${styles.resultBox} ${styles.glass}`}>
          <p>
            {recordSaved
              ? "🎉 기록이 저장되었습니다!"
              : "😅 기존 기록이 더 좋아서 저장되지 않았습니다."}
          </p>
        </div>
      )}
    </div>
  );
}
