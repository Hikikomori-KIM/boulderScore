import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore"; // 추가 필요

export default function AdminPartyPage() {
    const [partyName, setPartyName] = useState("");
    const [gyms, setGyms] = useState([]);
    const [selectedGymId, setSelectedGymId] = useState("");
    // 테이프 점수 상태
    const [tapeScores, setTapeScores] = useState({});

    // 암장 목록 불러오기
    useEffect(() => {
        const fetchGyms = async () => {
            const snapshot = await getDocs(collection(db, "gyms"));
            const list = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setGyms(list);
        };
        fetchGyms();
    }, []);
    // 암장 선택 시 → 해당 암장의 테이프 불러오기
    useEffect(() => {
        const fetchTapes = async () => {
            if (!selectedGymId) return;

            const gymRef = doc(db, "gyms", selectedGymId);
            const snapshot = await getDoc(gymRef);
            if (snapshot.exists()) {
                const data = snapshot.data();
                const defaultScores = {};
                (data.tapes || []).forEach((tape) => {
                    defaultScores[tape] = tapeScores[tape] || ""; // 기존 값 유지 or 빈칸
                });
                setTapeScores(defaultScores);
            }
        };
        fetchTapes();
    }, [selectedGymId]);

    // 점수 입력 핸들러
    const handleScoreChange = (tape, value) => {
        setTapeScores((prev) => ({
            ...prev,
            [tape]: value,
        }));
    };
    return (
        <div className="container mt-5">
            <h2>🎉 볼더링 파티 생성</h2>

            {/* 파티 이름 입력 */}
            <div className="mb-3">
                <label className="form-label">🧾 파티 이름</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="예: 2주년 볼파, 여름 클라임"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                />
            </div>

            {/* 암장 선택 */}
            <div className="mb-3">
                <label className="form-label">🏟 암장 선택</label>
                <select
                    className="form-select"
                    value={selectedGymId}
                    onChange={(e) => setSelectedGymId(e.target.value)}
                >
                    <option value="">-- 암장을 선택하세요 --</option>
                    {gyms.map((gym) => (
                        <option key={gym.id} value={gym.id}>
                            {gym.name}
                        </option>
                    ))}
                </select>
            </div>
            {/* 테이프별 점수 입력 */}
            {selectedGymId && Object.keys(tapeScores).length > 0 && (
                <div className="mt-4">
                    <h5>🎨 테이프별 점수 설정</h5>
                    {Object.keys(tapeScores).map((tape) => (
                        <div key={tape} className="d-flex align-items-center gap-3 mb-2">
                            <span className="fw-semibold" style={{ minWidth: 60 }}>{tape}</span>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="점수 입력"
                                value={tapeScores[tape]}
                                onChange={(e) => handleScoreChange(tape, e.target.value)}
                                style={{ maxWidth: "150px" }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
