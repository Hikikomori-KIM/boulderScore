import React from "react";
import { useNavigate } from "react-router-dom";
import "./ChallengeHome.css";

export default function ChallengeHome() {
    const navigate = useNavigate();

    const handleGo = (path) => {
        navigate(path);
    };

    return (
        <div className="challenge-wrapper">
            <div className="challenge-header glass-reward">
                <h2 className="challenge-title">
                    🎮 미니게임 챌린지
                </h2>
                <p className="challenge-subtitle">
                    가볍게 즐기고, <strong className="highlight">기록</strong>으로 경쟁해보세요!
                </p>

                <div className="reward-banner">
                    <span className="trophy-icon">🏆</span>
                    <div className="reward-text">
                        <strong>특별한 경품이 기다리고 있어요!</strong><br />
                        🎁 지금 도전하고 랭킹에 이름을 남겨보세요!
                    </div>
                </div>
            </div>

            <div className="challenge-card-grid">
                <div className="challenge-card glass">
                    <div className="card-header">
                        <h3>1 to 50</h3>
                        <span className="badge">⏱ 기록 게임</span>
                    </div>
                    <p className="card-desc">1부터 50까지 순서대로 빠르게 클릭해서 최고 기록에 도전해보세요!</p>
                    <div className="card-actions">
                        <button className="btn btn-primary" onClick={() => handleGo("/challenge/one-to-fifty")}>게임 시작</button>
                        <button className="btn btn-outline-dark" onClick={() => handleGo("/challenge/one-to-fifty/rank")}>랭킹 보기</button>
                    </div>
                </div>

                {/* 향후 추가 게임 예시 */}
                {/* <div className="challenge-card glass">
          <div className="card-header">
            <h3>기억력 테스트</h3>
            <span className="badge">🧠 집중력</span>
          </div>
          <p className="card-desc">패턴을 기억하고 순서를 맞춰보세요! 곧 출시됩니다.</p>
          <div className="card-actions">
            <button className="btn btn-secondary disabled">게임 준비 중</button>
          </div>
        </div> */}
            </div>
        </div>
    );
}