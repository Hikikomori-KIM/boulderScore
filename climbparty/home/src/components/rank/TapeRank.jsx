import { useEffect, useState, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { loadMembers, loadParties } from "../../firebaseFunctions";

const colors = ["초록", "파랑", "남색", "보라", "갈색", "검정"];
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
  const [selectedColor, setSelectedColor] = useState("파랑");
  const chartRef = useRef();

  useEffect(() => {
    loadMembers().then(setMembers);
    loadParties().then(setParties);
  }, []);

  // 1. 파티 + 테이프 필터링 (1순위만)
  const filtered = members
    .filter((m) => m.partyId === selectedPartyId)
    .filter((m) => m.level?.split(",")[0]?.trim() === selectedColor) // ✅ 1순위만 필터링
    .map((m) => {
      const allScores = colors.map((color) => m.scores?.[color] || 0);
      const total = allScores.reduce((a, b) => a + b, 0);
      return {
        name: m.name,
        scores: allScores,
        total
      };
    })
    .sort((a, b) => b.total - a.total); // 총점으로 정렬

  // 2. ECharts 옵션 구성
  const option = {
    grid: {
      left: 20,
      right: 20,
      top: 30,
      bottom: 30,
      containLabel: true
    },
    xAxis: {
      type: "value",
      max: (value) => value.max * 1.1,
      axisLabel: { show: true, interval: 0 }
    },
    yAxis: {
      type: "category",
      data: filtered.map((m) => m.name),
      inverse: true,
      axisLabel: { show: true, interval: 0 }
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const data = params[0].data;
        return colors
          .map((c, i) => `${c}: ${data.scores[i] || 0}개`)
          .join("<br/>");
      }
    },
    series: [
      {
        type: "bar",
        barWidth: 35,
        animationDuration: 800,
        animationEasing: "cubicOut",
        animationDelay: (index) => index * 50,
        data: filtered.map((m) => {
          const total = m.total;
          let offset = 0;
          const colorStops = [];

          m.scores.forEach((count, i) => {
            if (count > 0) {
              const ratio = count / total;
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
                colorStops
              },
              borderRadius: [10, 10, 10, 10]
            }
          };
        })
      }
    ]
  };

  // 3. 차트 리사이징 처리
  useEffect(() => {
    if (filtered.length > 0 && chartRef.current) {
      const resizeChart = () => {
        chartRef.current.getEchartsInstance().resize();
      };
      setTimeout(resizeChart, 150); // 지연 후 resize
      window.addEventListener("resize", resizeChart);
      return () => window.removeEventListener("resize", resizeChart);
    }
  }, [selectedPartyId, selectedColor, filtered.length]);

  return (
    <div className="container-fluid py-4 mt-5">
      <h1 className="h3 fw-bold text-center mb-4">🎯 테이프별 랭킹</h1>
      <div className="d-flex justify-content-center flex-wrap gap-3 mb-4">
        {/* 파티 선택 */}
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

        {/* 테이프 선택 */}
        <div className="d-flex align-items-center gap-2">
          <label className="fw-semibold mb-0">테이프:</label>
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

      {/* 차트 출력 */}
      {filtered.length > 0 ? (
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
          <h5 className="text-center mb-3 fw-semibold">{selectedColor} 클리어 랭킹</h5>

          <div
            style={{
              width: "100%",
              height: `${Math.max(filtered.length * 60, 300)}px`,
              minHeight: "300px",
              maxHeight: "600px",
              overflow: "hidden"
            }}
          >
            <ReactECharts
              ref={chartRef}
              option={option}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      ) : (
        selectedPartyId && (
          <div className="text-center text-muted mt-5">
            해당 조건의 참가자가 없습니다.
          </div>
        )
      )}
    </div>
  );
}
