import { useEffect, useState } from "react";
import { loadMembers } from "../../firebaseFunctions";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../firebase"; // db는 firebase.js에서 export한 firestore 인스턴스

export default function AdminRankingPage() {
  const [members, setMembers] = useState([]);
  const [teamRanks, setTeamRanks] = useState([]);
  const [userRanks, setUserRanks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const loaded = await loadMembers();
      setMembers(loaded);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const calculateRanks = async () => {
      const teamMap = {};
      const userRankArray = [];

      for (const m of members) {
        // 해당 파티의 테이프 점수 불러오기
        const partyDoc = await getDoc(doc(db, "parties", m.partyId));
        const tapeScores = partyDoc.exists() ? (partyDoc.data().tapeScores || {}) : {};

        // 개수 × 점수 계산
        const totalScore = Object.entries(m.scores || {}).reduce((sum, [color, count]) => {
          const scorePerColor = tapeScores[color] || 0;
          return sum + scorePerColor * count;
        }, 0);

        // 개인 랭킹용
        userRankArray.push({
          name: m.name,
          team: m.team,
          partyId: m.partyId,
          totalScore,
        });

        // 조 랭킹용
        const key = `${m.partyId}-${m.team}`;
        if (!teamMap[key]) {
          teamMap[key] = {
            team: m.team,
            partyId: m.partyId,
            totalScore: 0,
          };
        }
        teamMap[key].totalScore += totalScore;
      }

      setUserRanks(userRankArray.sort((a, b) => b.totalScore - a.totalScore));

      const teamArray = Object.values(teamMap);
      const updatedTeamArray = await Promise.all(
        teamArray.map(async (team) => {
          const partyDoc = await getDoc(doc(db, "parties", team.partyId));
          const partyName = partyDoc.exists() ? partyDoc.data().name : "이름없음";
          return {
            ...team,
            partyName,
          };
        })
      );

      updatedTeamArray.sort((a, b) => b.totalScore - a.totalScore);
      setTeamRanks(updatedTeamArray);
    };

    if (members.length > 0) {
      calculateRanks();
    }
  }, [members]);

  return (
    <div className="container mt-5">
      <h2 className="text-center fw-bold mb-4">📊 전체 랭킹 (관리자용)</h2>

      <div className="row">
        {/* 좌측: 조 랭킹 */}
        <div className="col-md-6">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white fw-semibold">🏆 조별 랭킹</div>
            <ul className="list-group list-group-flush">
              {teamRanks.map((team, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between">
                  <span>{team.partyName} - {team.team}</span>
                  <span className="fw-bold">{team.totalScore}점</span>
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
              {userRanks.map((user, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between">
                  <span>{user.name} ({user.team})</span>
                  <span className="fw-bold">{user.totalScore}점</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
