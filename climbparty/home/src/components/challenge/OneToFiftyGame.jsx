import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth } from "firebase/auth";
import { saveOneToFiftyRecord } from "../../firebaseFunctions";
import "./OneToFiftyGame.css";

export default function OneToFiftyGame() {
  const [grid, setGrid] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);

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

  const startGame = () => {
    const top = Array.from({ length: 25 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const bottom = Array.from({ length: 25 }, (_, i) => i + 26).sort(() => Math.random() - 0.5);

    const initialGrid = top.map((num, idx) => ({
      top: num,
      bottom: bottom[idx] || null,
    }));

    setGrid(initialGrid);
    setCurrentNumber(1);
    setStartTime(Date.now());
    setEndTime(null);
    setElapsed(0);
    setStarted(true);
    setIsSubmitted(false);
    setRecordSaved(false);
  };

  const handleClick = (idx) => {
    if (grid[idx].top !== currentNumber) return;

    setCurrentNumber((prev) => prev + 1);

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const next = newGrid[idx].bottom;
      newGrid[idx] = {
        top: next,
        bottom: null,
      };
      return newGrid;
    });

    if (currentNumber === 50) {
      setEndTime(Date.now());
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
    <div className="one-to-fifty-container">
      <div className="header-box glass">
        <h2 className="title">1 to 50</h2>
        {started && <p className="timer">⏱️ {elapsed}초</p>}
      </div>

      {!started && (
        <button className="start-btn glass" onClick={startGame}>
          게임 시작
        </button>
      )}

      {started && (
        <div className="grid">
          {grid.map((cell, idx) => (
            <button
              key={idx}
              className="grid-btn glass"
              onClick={() => handleClick(idx)}
              disabled={cell.top === null}
            >
              <AnimatePresence mode="wait">
                {cell.top !== null && (
                  <motion.span
                    key={cell.top + "_" + idx}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {cell.top}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      )}

      {endTime && !isSubmitted && (
        <div className="record-box glass">
          <p>기록을 저장하시겠습니까?</p>
          <button className="submit-btn" onClick={submitRecord}>
            기록 제출
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className="result-box glass">
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