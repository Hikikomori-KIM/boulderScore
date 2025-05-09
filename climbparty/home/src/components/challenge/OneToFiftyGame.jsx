import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { saveOneToFiftyRecord } from "../../firebaseFunctions";
import styles from "./OneToFiftyGame.module.css";
import GridButton from "./GridButton";

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
  const [clickSounds, setClickSounds] = useState([]); // ✅ 오디오 상태
  let soundIndex = 0; // ✅ 전역 인덱스

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ✅ 오디오 비동기 로딩
  useEffect(() => {
    const sounds = Array.from({ length: 5 }, () => {
      const audio = new Audio("/sounds/coin.mp3");
      audio.volume = 0.5;
      return audio;
    });
    setClickSounds(sounds);
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

    document.body.style.overflow = "auto";
  };

  const startCountdown = () => {
    prepareGrid();
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";

    const steps = ["3", "2", "1"];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setVisibleCountdown(step);
      }, index * 1000);
    });

    setTimeout(() => {
      setVisibleCountdown(null);
      setStarted(true);
      setStartTime(Date.now());
    }, steps.length * 1000);
  };

  const handleClick = (idx) => {
    if (grid[idx].top !== currentNumber) return;

    // ✅ 클릭 사운드 재생
    const sound = clickSounds[soundIndex];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
      soundIndex = (soundIndex + 1) % clickSounds.length;
    }

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
          <button className={`${styles.retryBtn} ${styles.glass}`} onClick={startCountdown}>
            🔄 다시하기
          </button>
        )}
      </div>

      {!started && grid.length === 0 && (
        <button className={`${styles.startBtn} ${styles.glass}`} onClick={startCountdown}>
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
