import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const tapeColors = ["초록", "파랑", "남색", "보라", "갈색", "검정"];

export default function AdminPartyTape() {
  const [parties, setParties] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState("");
  const [tapeScores, setTapeScores] = useState({});

  // 파티 목록 불러오기
  useEffect(() => {
    const fetchParties = async () => {
      const snap = await getDocs(collection(db, "parties"));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setParties(list);
    };
    fetchParties();
  }, []);

  // 파티 선택 시 기존 테이프 점수 불러오기
  useEffect(() => {
    const fetchTapeScores = async () => {
      if (!selectedPartyId) return;
      const partyDoc = await getDoc(doc(db, "parties", selectedPartyId));
      const data = partyDoc.exists() ? partyDoc.data() : {};
      setTapeScores(data.tapeScores || {});
    };
    fetchTapeScores();
  }, [selectedPartyId]);

  const handleScoreChange = (color, value) => {
    setTapeScores((prev) => ({
      ...prev,
      [color]: Number(value),
    }));
  };

  const handleSave = async () => {
    if (!selectedPartyId) return alert("파티를 선택해주세요.");
    await updateDoc(doc(db, "parties", selectedPartyId), {
      tapeScores,
    });
    alert("테이프 점수가 저장되었습니다!");
  };

  return (
    <div className="container mt-5">
      <h2 className="fw-bold text-center mb-4">🎯 파티별 테이프 점수 설정</h2>

      <div className="mb-4">
        <label className="form-label fw-semibold">📌 파티 선택</label>
        <select
          className="form-select"
          value={selectedPartyId}
          onChange={(e) => setSelectedPartyId(e.target.value)}
        >
          <option value="">-- 파티를 선택해주세요 --</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {selectedPartyId && (
        <div className="card p-4 shadow-sm">
          <h5 className="fw-semibold mb-3">🎨 테이프별 점수 입력</h5>
          {tapeColors.map((color) => (
            <div className="mb-3" key={color}>
              <label className="form-label">{color} 테이프 점수</label>
              <input
                type="number"
                className="form-control"
                value={tapeScores[color] || ""}
                onChange={(e) => handleScoreChange(color, e.target.value)}
                placeholder="예: 50"
              />
            </div>
          ))}

          <button className="btn btn-primary mt-3" onClick={handleSave}>
            저장하기
          </button>
        </div>
      )}
    </div>
  );
}
