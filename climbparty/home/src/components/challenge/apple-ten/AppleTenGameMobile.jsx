// AppleTenGameMobile.jsx (수정된 최종 버전)
import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import styles from "./AppleTenGameMobile.module.css";
import { useNavigate } from "react-router-dom";

function getRandomApple() {
  return Math.floor(Math.random() * 9) + 1;
}

function generateAppleGrid(rows = 10, cols = 17) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => getRandomApple())
  );
}

export default function AppleTenGameMobile() {
  const navigate = useNavigate();
  const [grid, setGrid] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [disappearingCells, setDisappearingCells] = useState([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [bgmOn, setBgmOn] = useState(false);
  const [started, setStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [orientationOk, setOrientationOk] = useState(false);

  const containerRef = useRef(null);
  const bgmRef = useRef(null);
  const successSoundRef = useRef(null);

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      setOrientationOk(isLandscape);
    };

    checkOrientation();
    window.addEventListener("orientationchange", checkOrientation);
    window.addEventListener("resize", checkOrientation);
    return () => {
      window.removeEventListener("orientationchange", checkOrientation);
      window.removeEventListener("resize", checkOrientation);
    };
  }, []);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          bgmRef.current?.pause();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (bgmRef.current && started) {
      bgmOn ? bgmRef.current.play().catch(console.warn) : bgmRef.current.pause();
    }
  }, [bgmOn, started]);

  const handleSubmitRecord = async () => {
    const user = getAuth().currentUser;
    if (!user) return alert("로그인이 필요합니다.");
    const ref = doc(db, "appleTenRecords", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data().score < score) {
      await setDoc(ref, {
        name: user.displayName || "익명",
        score,
        createdAt: new Date(),
      });
      setRecordSaved(true);
    } else {
      setRecordSaved(false);
    }
    setIsSubmitted(true);
  };

  const getTouchPos = (touch) => {
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = containerRef.current.offsetWidth / rect.width;
    const scaleY = containerRef.current.offsetHeight / rect.height;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  };

  const handleTouchStart = (e) => {
    if (!started) return;
    e.preventDefault();
    const pos = getTouchPos(e.touches[0]);
    setDragStart(pos);
    setDragCurrent(pos);
    setSelected([]);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !dragStart || !started) return;
    const pos = getTouchPos(e.touches[0]);
    setDragCurrent(pos);
    updateSelection(pos);
  };

  const handleTouchEnd = () => handleMouseUp();

  const getLocalMousePos = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    if (!started) return;
    e.preventDefault();
    const pos = getLocalMousePos(e);
    setDragStart(pos);
    setDragCurrent(pos);
    setSelected([]);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart || !started) return;
    const pos = getLocalMousePos(e);
    setDragCurrent(pos);
    updateSelection(pos);
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragCurrent || !started) return;
    setIsDragging(false);

    const uniqueSelected = selected.filter(
      (cell, index, self) =>
        index === self.findIndex((c) => c.row === cell.row && c.col === cell.col)
    );

    const total = uniqueSelected.reduce((acc, { row, col }) => acc + grid[row][col], 0);
    if (total === 10) {
      successSoundRef.current?.play().catch(() => { });
      const newGrid = grid.map((row) => [...row]);
      uniqueSelected.forEach(({ row, col }) => (newGrid[row][col] = null));
      setGrid(newGrid);
      setScore((prev) => prev + uniqueSelected.length);
      setDisappearingCells(uniqueSelected.map((cell) => ({ ...cell })));
      setTimeout(() => setDisappearingCells([]), 400);
    }

    setSelected([]);
    setDragStart(null);
    setDragCurrent(null);
  };

  const updateSelection = (pos) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    const scaleX = container.offsetWidth / rect.width;
    const scaleY = container.offsetHeight / rect.height;

    // ✅ 좌표 계산 보정 (top/left 기준 맞춤)
    const correctedStartX = Math.min(dragStart.x, pos.x);
    const correctedEndX = Math.max(dragStart.x, pos.x);
    const correctedStartY = Math.min(dragStart.y, pos.y);
    const correctedEndY = Math.max(dragStart.y, pos.y);

    const selectedCells = [];
    const style = getComputedStyle(container);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);
    const cellWidth = (rect.width - paddingLeft * 2) / grid[0].length;
    const cellHeight = (rect.height - paddingTop * 2) / grid.length;

    grid.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const x = colIndex * cellWidth + paddingLeft;
        const y = rowIndex * cellHeight + paddingTop;
        const centerX = x + cellWidth / 2;
        const centerY = y + cellHeight / 2;
        if (
          centerX >= correctedStartX &&
          centerX <= correctedEndX &&
          centerY >= correctedStartY &&
          centerY <= correctedEndY
        ) {
          selectedCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    setSelected(selectedCells);
  };


  const handleStart = () => {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    if (!isLandscape) {
      alert("화면을 가로로 돌려주세요!");
      return;
    }

    setStarted(false);
    setTimeout(() => {
      setGrid(generateAppleGrid());
      setScore(0);
      setTimeLeft(120);
      setIsSubmitted(false);
      setRecordSaved(false);
      setStarted(true);
      setFullScreen(true);

      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(console.warn);
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

      if (screen.orientation?.lock) {
        screen.orientation.lock("landscape").catch(() => { });
      }
      // ✅ 추가된 부분: 주소창 자동 숨김 유도
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 500);
    }, 50);
  };


  const handleReset = () => {
    setStarted(false);
    setGrid([]);
    setScore(0);
    setTimeLeft(120);
    setSelected([]);
    setDisappearingCells([]);
    setIsSubmitted(false);
    setRecordSaved(false);
    bgmRef.current?.pause();

    setTimeout(() => {
      setGrid(generateAppleGrid());
      setStarted(true);
    }, 50);
  };

  const handleExitToHome = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.warn("전체화면 해제 실패", e);
    }

    try {
      if (screen.orientation?.unlock) {
        screen.orientation.unlock();
      }
    } catch (e) {
      console.warn("화면 방향 잠금 해제 실패", e);
    }

    // 세로 안내 메시지
    alert("홈으로 이동합니다. 화면이 세로가 아닐 경우, 직접 회전해주세요 📱");

    setTimeout(() => {
      navigate("/challenge");
    }, 300);
  };


  const toggleBgm = () => setBgmOn((prev) => !prev);
  const isSelected = (row, col) => selected.some((c) => c.row === row && c.col === col);
  const getDisappearClass = (row, col) =>
    disappearingCells.find((c) => c.row === row && c.col === col) ? styles.disappear : "";
  const progressPercent = (timeLeft / 120) * 100;

  if (!fullScreen) {
    if (!orientationOk) {
      return (
        <div className={styles.fullScreenWrapper}>
          <h2>📱 화면을 가로로 돌려주세요</h2>
          <p>게임은 가로 모드에서만 실행됩니다</p>
        </div>
      );
    }

    return (
      <div className={styles.fullScreenWrapper}>
        <h2>전체화면 모드로 시작할까요?</h2>
        <button className={styles.btn} onClick={handleStart}>
          전체화면 시작하기
        </button>
      </div>
    );
  }


  return (
    <div className={styles.fullScreenWrapper}>
      {started && timeLeft > 0 && !isSubmitted && (
        <div className={styles.footerControls}>
          <span className={styles.scoreText}>🍎 점수: {score}</span>
          <button className={styles.btn} onClick={handleReset}>Reset</button>
          <button className={styles.btn} onClick={toggleBgm}>
            {bgmOn ? "🔈 BGM 끄기" : "🔇 BGM 켜기"}
          </button>
          <button className={styles.btn} onClick={handleExitToHome}>
            🏠 홈으로
          </button>

        </div>
      )}
      <div className={styles.gameMainRow}>
        <div
          className={styles.gridContainer}
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.appleBoard}>
            {grid.map((row, rowIndex) =>
              row.map((num, colIndex) => {
                const selectedNow = isSelected(rowIndex, colIndex);
                const disappearClass = getDisappearClass(rowIndex, colIndex);
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`${styles.appleCell} ${selectedNow ? styles.selected : ""} ${disappearClass}`}
                  >
                    {num !== null && (
                      <>
                        <img
                          src={selectedNow ? "/apple2.png" : "/apple.png"}
                          alt="apple"
                          className={styles.appleImg}
                          draggable={false}
                        />
                        <span className={styles.appleNumber}>{num}</span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {isDragging && dragStart && dragCurrent && (
            <div
              className={styles.selectionRectangle}
              style={{
                left: `${Math.min(dragStart.x, dragCurrent.x)}px`,
                top: `${Math.min(dragStart.y, dragCurrent.y)}px`,
                width: `${Math.abs(dragCurrent.x - dragStart.x)}px`,
                height: `${Math.abs(dragCurrent.y - dragStart.y)}px`,
              }}
            />
          )}
        </div>
        <div className={styles.timeBarContainer}>
          <div className={styles.timeText}>{timeLeft}s</div>
          <div className={styles.timeBar} style={{ height: `${progressPercent}%` }}></div>
        </div>
      </div>
      {timeLeft === 0 && (
        <div className={styles.gameOverOverlay}>
          <div className={styles.gameOverContent}>
            <h2>🍎 게임 오버!</h2>
            <p>최종 점수: {score}점</p>
            {!isSubmitted ? (
              <>
                <p className="mt-3">기록을 저장하시겠습니까?</p>
                <button className="btn btn-primary" onClick={handleSubmitRecord}>
                  기록 제출
                </button>
              </>
            ) : (
              <>
                <p className="mt-3">
                  {recordSaved
                    ? "🎉 기록이 저장되었습니다!"
                    : "😅 기존 점수가 더 좋아서 저장되지 않았습니다."}
                </p>
                <button className="btn btn-success mt-3" onClick={handleStart}>
                  🔄 다시 하기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <audio ref={bgmRef} loop src="/sounds/3.mp3" />
      <audio ref={successSoundRef} src="/sounds/success.wav" />
    </div>
  );
}