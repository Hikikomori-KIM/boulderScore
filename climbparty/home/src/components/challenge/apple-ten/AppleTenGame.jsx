import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./AppleTenGame.css";

function getRandomApple() {
  const rand = Math.random();
  if (rand < 0.1111) return 1;
  else if (rand < 0.2222) return 2;
  else if (rand < 0.3333) return 3;
  else if (rand < 0.4444) return 4;
  else if (rand < 0.5555) return 5;
  else if (rand < 0.6666) return 6;
  else if (rand < 0.7777) return 7;
  else if (rand < 0.8888) return 8;
  else return 9;
}

function generateAppleGrid(rows = 10, cols = 17) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push(getRandomApple());
    }
    grid.push(row);
  }
  return grid;
}

export default function AppleTenGame() {
  const isMobile = window.innerWidth <= 768; // ✅ 모바일 판단
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
  const [scale, setScale] = useState(1);

  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const bgmRef = useRef(null);
  const successSoundRef = useRef(null);

  useEffect(() => {
    const resize = () => {
      const baseWidth = 800;
      const baseHeight = 600;
      const scaleW = window.innerWidth / baseWidth;
      const scaleH = window.innerHeight / baseHeight;
      setScale(Math.min(scaleW, scaleH, 1));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (bgmRef.current) bgmRef.current.pause();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      document.documentElement.style.height = "100%";
      document.body.style.height = "100%";
      const root = document.getElementById("root");
      if (root) root.style.height = "100%";
    }

    return () => {
      document.documentElement.style.height = "";
      document.body.style.height = "";
      const root = document.getElementById("root");
      if (root) root.style.height = "";
    };
  }, []);
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

  const updateSelection = (pos) => {
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const scaleX = container.offsetWidth / rect.width;
    const scaleY = container.offsetHeight / rect.height;

    const correctedStartX = Math.min(dragStart.x, pos.x) / scaleX;
    const correctedEndX = Math.max(dragStart.x, pos.x) / scaleX;
    const correctedStartY = Math.min(dragStart.y, pos.y) / scaleY;
    const correctedEndY = Math.max(dragStart.y, pos.y) / scaleY;

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


  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragCurrent || !started) return;
    setIsDragging(false);

    const total = selected.reduce((acc, { row, col }) => acc + grid[row][col], 0);
    if (total === 10) {
      successSoundRef.current?.play().catch(() => { });

      // ✅ 사과를 바로 null 처리하고 점수 증가
      const newGrid = grid.map((row) => [...row]);
      selected.forEach(({ row, col }) => {
        newGrid[row][col] = null;
      });
      setGrid(newGrid);
      setScore((prev) => prev + selected.length);

      // ✅ 시각적 효과용으로만 disappearingCells 설정
      setDisappearingCells(selected.map((cell) => ({ ...cell })));

      // ✅ 0.4초 뒤에 disappearingCells만 제거
      setTimeout(() => {
        setDisappearingCells([]);
      }, 400);
    }

    setSelected([]);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleStart = () => {
    // 1단계: started를 false로 껐다가
    setStarted(false);

    // 2단계: 약간의 delay 후 다시 true로 설정
    setTimeout(() => {
      setGrid(generateAppleGrid());
      setScore(0);
      setTimeLeft(120); // 또는 4로 테스트용
      setIsSubmitted(false);
      setRecordSaved(false);
      setStarted(true);
      // bgmRef.current?.play().catch(() => { });
    }, 50); // 최소한의 딜레이 주면 started가 변화로 인식됨
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
  };

  const toggleBgm = () => setBgmOn((prev) => !prev);
  const isSelected = (row, col) => selected.some((cell) => cell.row === row && cell.col === col);
  const getDisappearClass = (row, col) =>
    disappearingCells.find((c) => c.row === row && c.col === col) ? "disappear" : "";
  const progressPercent = (timeLeft / 120) * 100;

  if (isMobile) {
    return (
      <div className="apple-mobile-block">
        <h2>⚠️ Apple 10 게임은 현재 PC에서만 플레이할 수 있어요.</h2>
        <p>더 넓은 화면에서 드래그가 원활하게 작동하도록 PC 버전만 지원됩니다.</p>
      </div>
    );
  }

  return (
    <div
      className="apple-game-wrapper"
      ref={wrapperRef}
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      <div className="score-board">점수: {score}</div>
      {!started ? (
        <div className="start-screen">
          <h1 className="start-title">🍎 Apple 10</h1>
          <p className="start-subtitle">사과를 선택해서 합이 10이 되도록 하세요</p>
          <button className="btn btn-success" onClick={handleStart}>
            게임 시작
          </button>
        </div>
      ) : (
        <div className="game-main">
          <div
            className="grid-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="apple-board">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="apple-row">
                  {row.map((num, colIndex) => {
                    if (num === null) return <div key={colIndex} className="apple-cell empty" />;
                    const selectedNow = isSelected(rowIndex, colIndex);
                    const disappearClass = getDisappearClass(rowIndex, colIndex);
                    return (
                      <div
                        key={colIndex}
                        className={`apple-cell ${selectedNow ? "selected" : ""} ${disappearClass}`}
                      >
                        <img
                          src={selectedNow ? "/apple2.png" : "/apple.png"}
                          alt="apple"
                          className="apple-img"
                          draggable={false}
                        />
                        <span className="apple-number">{num}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            {isDragging && dragStart && dragCurrent && (
              <div
                className="selection-rectangle"
                style={{
                  left: `${Math.min(dragStart.x, dragCurrent.x)}px`,
                  top: `${Math.min(dragStart.y, dragCurrent.y)}px`,
                  width: `${Math.abs(dragCurrent.x - dragStart.x)}px`,
                  height: `${Math.abs(dragCurrent.y - dragStart.y)}px`,
                }}
              />
            )}
          </div>
          <div className="time-bar-container">
            <div className="time-bar" style={{ height: `${progressPercent}%` }}></div>
            <div className="time-text">{timeLeft}s</div>
          </div>
        </div>
      )}
      <div className="footer-controls">
        {started && timeLeft > 0 && !isSubmitted && (
          <div className="footer-controls">
            <button className="btn btn-success" onClick={handleReset}>
              Reset
            </button>
            <button className="btn btn-success" onClick={toggleBgm}>
              {bgmOn ? "BGM 🔈" : "BGM 🔇"}
            </button>
          </div>
        )}
      </div>
      {timeLeft === 0 && (
        <div className="game-over-overlay">
          <div className="game-over-content">
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
                  {recordSaved ? "🎉 기록이 저장되었습니다!" : "😅 기존 점수가 더 좋아서 저장되지 않았습니다."}
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