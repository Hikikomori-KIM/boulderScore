import { useEffect, useState } from "react";
import { loadMembers } from "../../firebaseFunctions";
import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminRankingPage() {
  const [members, setMembers] = useState([]);
  const [teamRanks, setTeamRanks] = useState([]);
  const [userRanks, setUserRanks] = useState([]);
  const [parties, setParties] = useState([]);
  const [scoreMode, setScoreMode] = useState("simple"); // "simple" or "fair"

  useEffect(() => {
    const fetchData = async () => {
      const loadedMembers = await loadMembers();
      setMembers(loadedMembers);

      const snapshot = await getDocs(collection(db, "parties"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setParties(list);
    };
    fetchData(); // ✅ fetchData 호출!
  }, []);

  const fetchParties = async () => {
    const snapshot = await getDocs(collection(db, "parties"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setParties(list);
  };

  useEffect(() => {
    const calculateRanks = async () => {
      const problemCountByColor = {
        초록: 15,
        파랑: 21,
        남색: 26,
        보라: 28,
        갈색: 15,
        검정: 5,
      };

      const levelOrder = ['초록', '파랑', '남색', '보라', '갈색', '검정'];
      const teamMap = {};
      const userRankArray = [];

      for (const m of members) {
        const party = parties.find(p => p.id === m.partyId);
        const tapeScores = party?.tapeScores || {};
        const scores = m.scores || {};
        let totalScore = 0;

        if (scoreMode === "fair") {
          const rawLevel = (m.level || "").split(",")[0].trim();
          const userLevelIndex = levelOrder.indexOf(rawLevel);
          const baseLevel = levelOrder[userLevelIndex];
          const bonusLevel = levelOrder[userLevelIndex + 1];

          const baseSolved = scores[baseLevel] || 0;
          const bonusSolved = bonusLevel ? (scores[bonusLevel] || 0) : 0;
          const baseTotal = problemCountByColor[baseLevel] || 1;
          const bonusTotal = bonusLevel ? (problemCountByColor[bonusLevel] || 1) : 1;

          if (baseLevel === '검정') {
            // 검정: 자기(검정) 2000점, 아래(갈색) 최대 5개까지 1000점
            const reverseBonusLevel = levelOrder[userLevelIndex - 1]; // 갈색
            const reverseBonusSolved = scores[reverseBonusLevel] || 0;
            const basePart = 1000 * (baseSolved / baseTotal);
            const bonusPart = 1000 * (Math.min(5, reverseBonusSolved) / 5);
            totalScore = Math.round(basePart + bonusPart);
          } else {
            // 일반: 자기 1000점, 윗레벨 5개 기준 2000점
            const basePart = 1000 * (baseSolved / baseTotal);
            const bonusPart = 1000 * (Math.min(5, bonusSolved) / 5);
            totalScore = Math.round(basePart + bonusPart);
          }
        } else {
          totalScore = Object.entries(scores).reduce((sum, [color, count]) => {
            const scorePerColor = tapeScores[color] || 0;
            return sum + scorePerColor * count;
          }, 0);
        }

        // 개인 랭킹 추가
        userRankArray.push({
          name: m.name,
          teamId: m.teamId,
          partyId: m.partyId,
          totalScore,
        });

        // 조별 랭킹 계산
        const key = `${m.partyId}-${m.teamId}`;
        if (!teamMap[key]) {
          teamMap[key] = {
            teamId: m.teamId,
            partyId: m.partyId,
            totalScore: 0,
            count: 0,
          };
        }
        teamMap[key].totalScore += totalScore;
        teamMap[key].count += 1;
      }

      const userRanksSorted = userRankArray.sort((a, b) => b.totalScore - a.totalScore);
      setUserRanks(userRanksSorted);

      const teamArray = Object.values(teamMap).map((team) => {
        const party = parties.find(p => p.id === team.partyId);
        const teamName = party?.teams.find(t => t.id === team.teamId)?.name || "이름없음";
        const partyName = party?.name || "이름없음";
        const averageScore = team.count > 0 ? Math.round(team.totalScore / team.count) : 0;

        return {
          ...team,
          teamName,
          partyName,
          averageScore,
        };
      }).sort((a, b) => b.totalScore - a.totalScore);

      setTeamRanks(teamArray);
    };

    if (members.length > 0 && parties.length > 0) {
      calculateRanks();
    }
  }, [members, parties, scoreMode]);



  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">📊 전체 랭킹 (관리자용)</h2>

      <div className="text-center mb-3">
        <button
          className={`btn btn-sm me-2 ${scoreMode === "simple" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setScoreMode("simple")}
        >
          단순 점수제
        </button>
        <button
          className={`btn btn-sm ${scoreMode === "fair" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setScoreMode("fair")}
        >
          공정 점수제
        </button>
      </div>

      <div className="row">
        {/* 좌측: 조 랭킹 */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white fw-semibold">🏆 조별 랭킹</div>
            <ul className="list-group list-group-flush">
              {teamRanks.map((team, idx) => (
                <li key={idx} className="list-group-item d-flex flex-column">
                  <div className="d-flex justify-content-between w-100">
                    <div className="d-flex flex-column">
                      <span className="fw-semibold">{team.partyName}</span>  {/* 윗줄: 파티 이름 */}
                      <span className="text-muted">{team.teamName}</span>    {/* 아랫줄: 팀 이름 */}
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">{team.totalScore}점</div>     {/* 윗줄: 총점 */}
                      <div className="text-muted small">평균 {team.averageScore}점</div> {/* 아랫줄: 평균 */}
                    </div>
                  </div>
                </li>
              ))}

            </ul>

          </div>
        </div>

        {/* 우측: 개인 랭킹 */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white fw-semibold">👤 개인 랭킹</div>
            <ul className="list-group list-group-flush">
              {userRanks.map((user, idx) => {
                const party = parties.find(p => p.id === user.partyId);
                const teamName = party?.teams.find(t => t.id === user.teamId)?.name || "팀없음";
                return (
                  <li key={idx} className="list-group-item d-flex justify-content-between">
                    <span>{user.name} ({teamName})</span>
                    <span className="fw-bold">{user.totalScore}점</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
