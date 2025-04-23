import { useCallback, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { loadMembers, loadParties } from "../firebaseFunctions";

export default function TeamCount() {
  const [parties, setParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [memberData, setMemberData] = useState([]);

  const colors = ["초록", "파랑", "남색", "보라", "갈색", "검정"];
  const colorMap = {
    초록: "#22C55E",
    파랑: "#3B82F6",
    남색: "#1E40AF",
    보라: "#8B5CF6",
    갈색: "#92400E",
    검정: "#111827",
  };

  useEffect(() => {
    loadMembers().then(setMemberData);
    loadParties().then(setParties);
  }, []);

  useEffect(() => {
    const party = parties.find((p) => p.id === selectedPartyId);
    setTeams(party?.teams || []);
    setSelectedTeam("");
  }, [selectedPartyId, parties]);

  const changeParty = useCallback((e) => {
    setSelectedPartyId(e.target.value);
  }, []);

  const changeTeam = useCallback((e) => {
    setSelectedTeam(e.target.value);
  }, []);

  const selectedMembers = memberData.filter(
    (m) => m.partyId === selectedPartyId && m.team === selectedTeam
  );
  const chartData = selectedMembers
    .map((m) => {
      const scores = colors.map((color) => m.scores?.[color] || 0);
      const total = scores.reduce((a, b) => a + b, 0);
      return {
        name: m.name,
        scores,
        total,
      };
    })
    .sort((a, b) => b.total - a.total); // 점수 높은 순

  const option = {
    grid: {
      left: 100,
      right: 60,
      top: 30,
      bottom: 30,
    },
    xAxis: {
      type: "value",
      max: (value) => value.max * 1.1,
    },
    yAxis: {
      type: "category",
      data: chartData.map((m) => m.name),
      inverse: true,
    },
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
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops,
              },
              borderRadius: [0, 10, 10, 0],
            },
          };
        }),
      },
    ],
  };

  return (
    <div className="container py-4 mt-5">
      <h1 className="h3 fw-bold text-center mb-4">CLIMB COUNT</h1>

      {/* 선택 폼 */}
      <div className="row row-cols-1 row-cols-md-2 g-3 mb-4">
        <div className="col">
          <select
            className="form-select form-select-sm rounded-pill shadow-sm border-primary"
            value={selectedPartyId}
            onChange={changeParty}
          >
            <option value="">파티를 선택해주세요</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col">
          <select
            className="form-select form-select-sm rounded-pill shadow-sm border-primary"
            value={selectedTeam}
            onChange={changeTeam}
            disabled={!selectedPartyId}
          >
            <option value="">팀을 선택해주세요</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* 차트 */}
      {selectedTeam && chartData.length > 0 && (
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
          <h5 className="text-center mb-3 fw-semibold">{selectedTeam} 클리어 현황 (차트)</h5>

          <div
            style={{
              width: "100%",
              height: Math.max(chartData.length * 60, 300),
              minHeight: "300px",
              maxHeight: "600px",
              overflow: "hidden"
            }}
          >
            <ReactECharts option={option} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}



    </div>
  );
}
