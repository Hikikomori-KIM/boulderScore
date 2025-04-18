import { useCallback, useState } from "react";

// 팀 목록과 난이도 목록
const teamList = ["1조", "2조", "3조", "4조", "5조", "6조", "7조", "8조", "9조", "10조"];
const levelList = ["초록", "파랑", "남색", "보라", "갈색", "검정"];

export default function AdminMemberAdd() {
  // state: 새로운 참가자
  const [newMember, setNewMember] = useState({
    name: "",
    team: "",
    level: ""
  });

  // 모든 input 처리하는 공통 change 함수
  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  }, []);

  // 등록 버튼 클릭 시 처리
  const handleAdd = () => {
    console.log("추가할 참가자:", newMember);
    // TODO: 여기에 저장 로직 추가 (예: 서버로 전송, 상위 컴포넌트에 전달 등)
    alert(`${newMember.name} 님이 ${newMember.team}에 등록되었습니다.`);
    // 입력 초기화
    setNewMember({ name: "", team: "", level: "" });
  };

  return (
    <div className="container py-5 mt-5">
      <h2 className="mb-4">📋 참가자 등록</h2>

      <div className="mb-3">
        <label className="form-label">이름</label>
        <input
          type="text"
          name="name"
          className="form-control"
          value={newMember.name}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">팀 선택</label>
        <select
          name="team"
          className="form-select"
          value={newMember.team}
          onChange={handleChange}
        >
          <option value="">-- 팀 선택 --</option>
          {teamList.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">난이도 선택</label>
        <select
          name="level"
          className="form-select"
          value={newMember.level}
          onChange={handleChange}
        >
          <option value="">-- 난이도 선택 --</option>
          {levelList.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" onClick={handleAdd}>
        참가자 등록
      </button>
    </div>
  );
}
