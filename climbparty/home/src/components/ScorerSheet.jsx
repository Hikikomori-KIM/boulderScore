import { useEffect, useState } from "react";
import {
  saveMember,
  deleteMember,
  updateMember,
  loadParties
} from "../firebaseFunctions";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from 'uuid';
import ReactECharts from "echarts-for-react";

const colors = ["검정", "갈색", "보라", "남색", "파랑", "초록"];
const colorMap = {
  초록: "#22C55E",
  파랑: "#3B82F6",
  남색: "#1E40AF",
  보라: "#8B5CF6",
  갈색: "#92400E",
  검정: "#111827",
};

export default function ScorerSheet() {
  const [parties, setParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [newInput, setNewInput] = useState(null);

  useEffect(() => {
    loadParties().then(setParties);
  }, []);

  useEffect(() => {
    const party = parties.find(p => p.id === selectedPartyId);
    setTeams(party?.teams || []);
    setSelectedTeamId("");
  }, [selectedPartyId, parties]);

  useEffect(() => {
    if (!selectedPartyId || !selectedTeamId) return;

    const q = query(
      collection(db, "members"),
      where("partyId", "==", selectedPartyId),
      where("teamId", "==", selectedTeamId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMembers(data);
    });

    return () => unsubscribe();
  }, [selectedPartyId, selectedTeamId]);

  const sortedMembers = [...members].sort((a, b) => {
    const levelA = a.level?.split(",")[0]?.trim();
    const levelB = b.level?.split(",")[0]?.trim();
    return colors.indexOf(levelA) - colors.indexOf(levelB);
  });

  const chartData = sortedMembers
    .map((m) => {
      const scores = colors.map(color => m.scores?.[color] || 0);
      const total = scores.reduce((a, b) => a + b, 0);
      return { name: m.name, scores, total };
    })
    .sort((a, b) => b.total - a.total);

  const chartOption = {
    grid: { left: 100, right: 60, top: 30, bottom: 30 },
    xAxis: { type: "value", max: value => value.max * 1.1 },
    yAxis: { type: "category", data: chartData.map(m => m.name), inverse: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const data = params[0].data;
        return colors.map((c, i) => `${c}: ${data.scores[i]}개`).join("<br/>");
      },
    },
    series: [
      {
        type: "bar",
        barWidth: 25,
        data: chartData.map((m) => {
          const total = m.total;
          let offset = 0;
          const colorStops = [];
          m.scores.forEach((count, i) => {
            const ratio = count / total;
            if (count > 0) {
              colorStops.push(
                { offset: offset, color: colorMap[colors[i]] },
                { offset: offset + ratio, color: colorMap[colors[i]] }
              );
              offset += ratio;
            }
          });
          return {
            value: total,
            name: m.name,
            scores: m.scores,
            itemStyle: {
              color: {
                type: "linear", x: 0, y: 0, x2: 1, y2: 0, colorStops,
              },
              borderRadius: [0, 10, 10, 0],
            },
          };
        })
      }
    ]
  };

  const handleScoreChange = async (memberId, color, diff) => {
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const updated = {
      ...member,
      scores: {
        ...member.scores,
        [color]: Math.max(0, (member.scores?.[color] || 0) + diff)
      }
    };

    try {
      await updateMember(updated);
    } catch (err) {
      console.error("점수 업데이트 실패", err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("정말 이 참가자를 삭제하시겠습니까?")) {
      try {
        await deleteMember(memberId);
        alert("참가자가 삭제되었습니다.");
      } catch (err) {
        console.error("삭제 실패", err);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleNewInputChange = (field, value) => {
    setNewInput(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterNewMember = async () => {
    const { name, level1, level2 } = newInput || {};
    if (!name || !level1 || !selectedPartyId || !selectedTeamId) {
      alert("파티, 조, 이름, 난이도를 입력해주세요.");
      return;
    }
    const selectedLevels = [];
    if (level1) selectedLevels.push(level1);
    if (level2 && level2 !== level1) selectedLevels.push(level2);
    const scoreTemplate = {};
    selectedLevels.forEach(level => { scoreTemplate[level] = 0 });
    const newMember = {
      id: uuidv4(),
      partyId: selectedPartyId,
      teamId: selectedTeamId,
      name,
      level: selectedLevels.join(", "),
      scores: scoreTemplate,
    };
    setNewInput(null);
    try {
      await saveMember(newMember);
      alert("참가자가 DB에 저장되었습니다!");
    } catch (err) {
      console.error("DB 저장 실패", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-4">채점자 전용 기록지</h2>

      {/* 셀렉트박스 */}
      <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold mb-0">파티:</label>
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="form-select form-select-sm rounded-pill shadow-sm border-primary"
            style={{ width: "auto", minWidth: "150px" }}
          >
            <option value="">파티 선택</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>{party.name}</option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold mb-0">조:</label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            disabled={!selectedPartyId}
            className="form-select form-select-sm rounded-pill shadow-sm border-primary"
            style={{ width: "auto", minWidth: "120px" }}
          >
            <option value="">조 선택</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 참가자 카드 */}
      <div className="row g-4">
        {sortedMembers.map((member) => (
          <div key={member.id} className="col-md-6">
            <div className="p-3 border rounded shadow-sm bg-white h-100 position-relative">
              <button
                type="button"
                className="btn-close position-absolute"
                style={{ top: "10px", right: "10px" }}
                aria-label="삭제"
                onClick={() => handleRemoveMember(member.id)}
              ></button>

              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                {member.name}
                {(() => {
                  const level1 = member.level?.split(",")[0]?.trim();
                  if (!level1) return null;

                  const emojiMap = {
                    초록: "🟢",
                    파랑: "🔵",
                    남색: "🔷",
                    보라: "🟣",
                    갈색: "🟤",
                    검정: "⚫"
                  };

                  return (
                    <span
                      className="badge rounded-pill d-flex align-items-center"
                      title={`1순위: ${level1}`}
                      style={{
                        backgroundColor: `${colorMap[level1]}20`,
                        color: colorMap[level1],
                        fontWeight: 600,
                        fontSize: "0.75rem"
                      }}
                    >
                      {emojiMap[level1] || "🎯"}&nbsp;{level1}
                    </span>
                  );
                })()}
              </h5>

              <div className="d-flex flex-wrap gap-3">
                {(() => {
                  const levels = member.level?.split(",").map(l => l.trim()) || [];
                  const rest = colors.filter(c => levels.indexOf(c) === -1 && member.scores?.[c] !== undefined);
                  const displayOrder = [...levels, ...rest];

                  return displayOrder.map(color => (
                    <div key={color} className="d-flex align-items-center gap-2">
                      <span className="badge rounded-pill text-white" style={{ backgroundColor: colorMap[color] }}>
                        {color}
                      </span>
                      <button onClick={() => handleScoreChange(member.id, color, -1)} className="btn btn-outline-secondary btn-sm">–</button>
                      <span className="px-2 fw-bold">{member.scores?.[color] || 0}</span>
                      <button onClick={() => handleScoreChange(member.id, color, +1)} className="btn btn-outline-primary btn-sm">+</button>
                    </div>
                  ));
                })()}

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 참가자 추가 */}
      <div className="text-end mt-4 mb-3">
        {!newInput && selectedPartyId && selectedTeamId && (
          <button className="btn btn-success" onClick={() => setNewInput({ name: "", level1: "", level2: "" })}>
            + 참가자 추가
          </button>
        )}
      </div>

      {newInput && (
        <div className="mb-4 p-3 border rounded bg-light">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="이름"
                value={newInput.name}
                onChange={(e) => handleNewInputChange("name", e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={newInput.level1}
                onChange={(e) => handleNewInputChange("level1", e.target.value)}
              >
                <option value="">1순위 난이도</option>
                {colors.map(color => (
                  <option key={color} value={color} disabled={color === newInput.level2}>{color}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={newInput.level2}
                onChange={(e) => handleNewInputChange("level2", e.target.value)}
              >
                <option value="">2순위 난이도 (선택)</option>
                {colors.map(color => (
                  <option key={color} value={color} disabled={color === newInput.level1}>{color}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-primary w-50" onClick={handleRegisterNewMember}>등록</button>
              <button className="btn btn-secondary w-50" onClick={() => setNewInput(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 차트 */}
      {selectedTeamId && chartData.length > 0 && (
        <div
          style={{
            width: "95vw",
            maxWidth: "1200px",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: "1rem"
          }}
        >
          <h5 className="text-center mb-3 fw-semibold">
            {teams.find((t) => t.id === selectedTeamId)?.name || "팀"} 클리어 현황 (차트)
          </h5>

          <div
            style={{
              width: "100%",
              height: Math.max(chartData.length * 60, 300),
              minHeight: "300px",
              maxHeight: "600px",
              overflow: "hidden"
            }}
          >
            <ReactECharts option={chartOption} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
