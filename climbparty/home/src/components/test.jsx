import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const gyms = ["더락클라이밍", "피커클라이밍", "볼더풀"];
const teams = ["A조", "B조", "C조"];
const colors = ["빨강", "파랑", "초록", "노랑"];

const sampleData = [
  {
    name: "홍길동",
    빨강: 3,
    파랑: 2,
    초록: 1,
    노랑: 0,
  },
  {
    name: "김민지",
    빨강: 1,
    파랑: 4,
    초록: 2,
    노랑: 1,
  },
];

export default function ClimbCountUI() {
  const [selectedGym, setSelectedGym] = useState(gyms[0]);
  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const handleClear = () => {
    alert(`${selectedTeam} - ${selectedColor} 클리어!`);
    // 여기에 실제 데이터 업데이트 로직 연결
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center">CLIMB COUNT</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select onValueChange={setSelectedGym} defaultValue={selectedGym}>
          {gyms.map((gym) => (
            <SelectItem key={gym} value={gym}>{gym}</SelectItem>
          ))}
        </Select>

        <Select onValueChange={setSelectedTeam} defaultValue={selectedTeam}>
          {teams.map((team) => (
            <SelectItem key={team} value={team}>{team}</SelectItem>
          ))}
        </Select>

        <Select onValueChange={setSelectedColor} defaultValue={selectedColor}>
          {colors.map((color) => (
            <SelectItem key={color} value={color}>{color}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="text-center">
        <Button onClick={handleClear} className="px-6 py-2 text-lg">
          클리어!
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">{selectedTeam} 인원별 클리어 현황</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sampleData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {colors.map((color) => (
                <Bar key={color} dataKey={color} stackId="a" fill={getColorCode(color)} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function getColorCode(color) {
  switch (color) {
    case "빨강": return "#EF4444";
    case "파랑": return "#3B82F6";
    case "초록": return "#22C55E";
    case "노랑": return "#FACC15";
    default: return "#D1D5DB";
  }
}
