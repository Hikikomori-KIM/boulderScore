import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function AdminGymPage() {
  const [gyms, setGyms] = useState([]);
  const [newGymName, setNewGymName] = useState("");
  const [tapeInputs, setTapeInputs] = useState({});

  const fetchGyms = async () => {
    const snapshot = await getDocs(collection(db, "gyms"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setGyms(list);
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleAddGym = async () => {
    if (!newGymName.trim()) return alert("암장 이름을 입력하세요!");
    await addDoc(collection(db, "gyms"), {
      name: newGymName.trim(),
      tapes: [],
    });
    setNewGymName("");
    fetchGyms();
  };

  const handleDeleteGym = async (gymId) => {
    const confirm = window.confirm("정말 삭제하시겠습니까?");
    if (!confirm) return;
    await deleteDoc(doc(db, "gyms", gymId));
    fetchGyms();
  };

  const handleAddTape = async (gymId) => {
    const newTape = (tapeInputs[gymId] || "").trim();
    if (!newTape) return alert("테이프 색상을 입력하세요!");

    const gym = gyms.find((g) => g.id === gymId);
    const updatedTapes = [...(gym.tapes || []), newTape];

    await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
    setTapeInputs((prev) => ({ ...prev, [gymId]: "" }));
    fetchGyms();
  };

  const handleDeleteTape = async (gymId, tapeToDelete) => {
    const gym = gyms.find((g) => g.id === gymId);
    const updatedTapes = gym.tapes.filter((t) => t !== tapeToDelete);

    await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
    fetchGyms();
  };

  return (
    <div className="container mt-5">
      <h2>🏟 암장 관리</h2>

      {/* 암장 추가 입력 */}
      <div className="d-flex gap-2 my-3 align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="새 암장 이름 입력"
          value={newGymName}
          onChange={(e) => setNewGymName(e.target.value)}
        />
        <button
          className="btn btn-primary px-4 py-2"
          style={{ whiteSpace: "nowrap" }}
          onClick={handleAddGym}
        >
          ➕ 추가
        </button>
      </div>

      {/* 암장 목록 */}
      <ul className="list-group">
        {gyms.map((gym) => (
          <li key={gym.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
              <strong>{gym.name}</strong>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteGym(gym.id)}>
                🗑 삭제
              </button>
            </div>

            {/* 테이프 목록 */}
            <div className="mt-3 d-flex flex-wrap gap-2">
              {gym.tapes?.map((tape, idx) => (
                <span key={idx} className="badge bg-secondary d-flex align-items-center">
                  <span className="px-2">{tape}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-close me-1"
                    style={{ filter: "invert(1)", width: "0.8rem", height: "0.8rem" }}
                    onClick={() => handleDeleteTape(gym.id, tape)}
                  ></button>
                </span>
              ))}
            </div>

            {/* 테이프 추가 입력 */}
            <div className="d-flex mt-3 gap-2 align-items-center">
              <input
                type="text"
                className="form-control"
                placeholder="테이프 색상"
                value={tapeInputs[gym.id] || ""}
                onChange={(e) => setTapeInputs({ ...tapeInputs, [gym.id]: e.target.value })}
              />
              <button
                className="btn btn-outline-primary px-4 py-2"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => handleAddTape(gym.id)}
              >
                ➕ 추가
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
