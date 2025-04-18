import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import { loadMembers, loadParties } from "../../firebaseFunctions";

const colors = ["초록", "파랑", "남색", "보라", "갈색", "검정"];
const colorOrder = { "초록": 0, "파랑": 1, "남색": 2, "보라": 3, "갈색": 4, "검정": 5 };

const colorMap = {
  "초록": "#22C55E",
  "파랑": "#3B82F6",
  "남색": "#1E40AF",
  "보라": "#8B5CF6",
  "갈색": "#92400E",
  "검정": "#111827"
};

export default function TapeRank() {
  const [members, setMembers] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [selectedColor, setSelectedColor] = useState("초록");

  useEffect(() => {
    loadMembers().then(setMembers);
    loadParties().then(setParties);
  }, []);

  const getPrimaryGrade = (levelString) => {
    const levels = levelString?.split(',').map(l => l.trim()) || [];
    return levels.reduce((lowest, current) => {
      if (!lowest || (colorOrder[current] < colorOrder[lowest])) {
        return current;
      }
      return lowest;
    }, null);
  };

  const filteredMembers = members
    .filter((m) =>
      m.partyId === selectedPartyId &&
      getPrimaryGrade(m.level) === selectedColor
    )
    .map((m) => {
      const scores = colors.map((color) => m.scores?.[color] || 0);
      const total = scores.reduce((a, b) => a + b, 0);
      return {
        name: m.name,
        scores,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

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
      data: filteredMembers.map((m) => m.name),
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
        data: filteredMembers.map((m) => {
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
    <div className="container py-5 mt-5">
      <h2 className="text-center fw-bold mb-4">🎯 테이프별 랭킹</h2>

      {/* 파티 + 테이프 선택 */}
      <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold mb-0" style={{ whiteSpace: "nowrap" }}>파티:</label>
          <select
            value={selectedPartyId}
            onChange={(e) => setSelectedPartyId(e.target.value)}
            className="form-select form-select-sm rounded-pill shadow-sm border-primary"
            style={{ width: "auto", minWidth: "120px" }}
          >
            <option value="">파티 선택</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>{party.name}</option>
            ))}
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold mb-0" style={{ whiteSpace: "nowrap" }}>테이프:</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="form-select form-select-sm rounded-pill shadow-sm border-primary"
            style={{ width: "auto", minWidth: "120px" }}
          >
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredMembers.length > 0 && (
        <div className="card shadow">
          <div className="card-body px-0 py-3">
            <div className="w-100 text-start" style={{ height: Math.max(filteredMembers.length * 60, 300) }}>
              <ReactECharts option={option} style={{ height: "100%" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
