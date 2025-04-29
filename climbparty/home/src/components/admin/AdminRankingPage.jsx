import { useEffect, useState } from "react";
import { loadMembers } from "../../firebaseFunctions";
import { getDoc, doc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminRankingPage() {
  const [members, setMembers] = useState([]);
  const [teamRanks, setTeamRanks] = useState([]);
  const [userRanks, setUserRanks] = useState([]);
  const [parties, setParties] = useState([]);

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
      const teamMap = {};
      const userRankArray = [];

      for (const m of members) {
        const party = parties.find(p => p.id === m.partyId);
        const tapeScores = party?.tapeScores || {};

        const totalScore = Object.entries(m.scores || {}).reduce((sum, [color, count]) => {
          const scorePerColor = tapeScores[color] || 0;
          return sum + scorePerColor * count;
        }, 0);

        userRankArray.push({
          name: m.name,
          teamId: m.teamId,
          partyId: m.partyId,
          totalScore,
        });

        const key = `${m.partyId}-${m.teamId}`;
        if (!teamMap[key]) {
          teamMap[key] = {
            teamId: m.teamId,
            partyId: m.partyId,
            totalScore: 0,
          };
        }
        teamMap[key].totalScore += totalScore;
      }

      const userRanksSorted = userRankArray.sort((a, b) => b.totalScore - a.totalScore);
      setUserRanks(userRanksSorted);

      const teamArray = Object.values(teamMap).map((team) => {
        const party = parties.find(p => p.id === team.partyId);
        const teamName = party?.teams.find(t => t.id === team.teamId)?.name || "이름없음";
        const partyName = party?.name || "이름없음";
        return {
          ...team,
          teamName,
          partyName,
        };
      }).sort((a, b) => b.totalScore - a.totalScore);

      setTeamRanks(teamArray);
    };

    if (members.length > 0 && parties.length > 0) {
      calculateRanks();
    }
  }, [members, parties]);

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
                  <span>{team.partyName} - {team.teamName}</span>
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
