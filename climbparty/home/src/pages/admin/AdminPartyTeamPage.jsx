import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  deleteDoc
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function AdminPartyTeamPage() {
  const [partyName, setPartyName] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamInput, setTeamInput] = useState("");

  const [existingParties, setExistingParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [selectedPartyTeams, setSelectedPartyTeams] = useState([]);

  const [editTeamId, setEditTeamId] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");

  // 전체 파티 불러오기
  const fetchParties = async () => {
    const snapshot = await getDocs(collection(db, "parties"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setExistingParties(list);
  };

  useEffect(() => {
    fetchParties();
  }, []);

  // 기존 파티 선택 시 해당 조 로딩
  useEffect(() => {
    if (!selectedPartyId) {
      setSelectedPartyTeams([]);
      return;
    }
    const party = existingParties.find(p => p.id === selectedPartyId);
    setSelectedPartyTeams(party?.teams || []);
  }, [selectedPartyId, existingParties]);

  const handleAddTeam = () => {
    const name = teamInput.trim();
    if (!name || teams.some(t => t.name === name)) return;
    const newTeam = { id: uuidv4(), name };
    setTeams([...teams, newTeam]);
    setTeamInput("");
  };

  const handleDeleteTeamFromNew = (id) => {
    setTeams(teams.filter((t) => t.id !== id));
  };

  const handleSaveNewParty = async () => {
    if (!partyName.trim()) return alert("파티명을 입력해주세요!");
    if (teams.length === 0) return alert("최소 하나 이상의 조를 추가해주세요!");

    await addDoc(collection(db, "parties"), {
      name: partyName.trim(),
      teams, // [{id, name}]
    });

    alert("✅ 파티가 저장되었습니다!");
    setPartyName("");
    setTeams([]);
    fetchParties();
  };

  const handleDeleteExistingTeam = async (teamId) => {
    const partyRef = doc(db, "parties", selectedPartyId);
    const snapshot = await getDoc(partyRef);
    if (!snapshot.exists()) return;

    const currentData = snapshot.data();
    const updatedTeams = (currentData.teams || []).filter((t) => t.id !== teamId);

    await updateDoc(partyRef, { teams: updatedTeams });
    alert(`🗑 조가 삭제되었습니다!`);

    setSelectedPartyTeams(updatedTeams);
    fetchParties();
  };

  const handleDeleteParty = async (partyId) => {
    const confirmed = window.confirm("정말 이 파티를 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "parties", partyId));
      alert("파티가 삭제되었습니다.");
      if (selectedPartyId === partyId) setSelectedPartyId("");
      fetchParties();
    } catch (err) {
      console.error("파티 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const startEditTeam = (team) => {
    setEditTeamId(team.id);
    setEditTeamName(team.name);
  };

  const cancelEditTeam = () => {
    setEditTeamId(null);
    setEditTeamName("");
  };

  const saveEditedTeam = async () => {
    const partyRef = doc(db, "parties", selectedPartyId);
    const snapshot = await getDoc(partyRef);
    if (!snapshot.exists()) return;

    const currentData = snapshot.data();
    const updatedTeams = (currentData.teams || []).map((t) =>
      t.id === editTeamId ? { ...t, name: editTeamName.trim() } : t
    );

    await updateDoc(partyRef, { teams: updatedTeams });
    alert("✏️ 조 이름이 수정되었습니다!");

    setSelectedPartyTeams(updatedTeams);
    setEditTeamId(null);
    setEditTeamName("");
    fetchParties();
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4">🎉 파티 + 조 구성 관리</h2>

      {/* 🔹 새 파티 등록 */}
      <div className="mb-5">
        <h4>📝 새 파티 등록</h4>
        <div className="mb-3">
          <label className="form-label">파티명</label>
          <input
            type="text"
            className="form-control"
            placeholder="예: 2주년 볼파"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2 mb-3 align-items-center">
          <input
            type="text"
            className="form-control"
            placeholder="조 이름 입력 (예: 1조)"
            value={teamInput}
            onChange={(e) => setTeamInput(e.target.value)}
          />
          <button
            className="btn btn-outline-primary"
            style={{ whiteSpace: "nowrap", height: "100%" }}
            onClick={handleAddTeam}
          >
            ➕ 추가
          </button>
        </div>

        <ul className="list-group mb-3">
          {teams.map((team) => (
            <li key={team.id} className="list-group-item d-flex justify-content-between align-items-center">
              {team.name}
              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTeamFromNew(team.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>

        <button className="btn btn-success" onClick={handleSaveNewParty}>
          💾 파티 저장
        </button>
      </div>

      <hr />

      {/* 🔸 기존 파티 리스트 & 조 관리 */}
      <div className="mt-4">
        <h4>🗂 기존 파티 조 관리</h4>

        <ul className="list-group mb-4">
          {existingParties.map((p) => (
            <li
              key={p.id}
              className={`list-group-item d-flex justify-content-between align-items-center ${selectedPartyId === p.id ? "active text-white" : ""}`}
              onClick={() => setSelectedPartyId(p.id)}
              style={{ cursor: "pointer" }}
            >
              <span>{p.name}</span>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteParty(p.id);
                }}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>

        {selectedPartyTeams.length > 0 && (
          <ul className="list-group">
            {selectedPartyTeams.map((team) => (
              <li key={team.id} className="list-group-item d-flex justify-content-between align-items-center">
                {editTeamId === team.id ? (
                  <>
                    <input
                      className="form-control me-2"
                      value={editTeamName}
                      onChange={(e) => setEditTeamName(e.target.value)}
                      style={{ width: "50%" }}
                    />
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-success" onClick={saveEditedTeam}>저장</button>
                      <button className="btn btn-sm btn-secondary" onClick={cancelEditTeam}>취소</button>
                    </div>
                  </>
                ) : (
                  <>
                    {team.name}
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEditTeam(team)}>
                        수정
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteExistingTeam(team.id)}>
                        삭제
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
