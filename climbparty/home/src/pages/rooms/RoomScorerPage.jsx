// 📁 src/components/projects/pages/RoomScorerPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  ensureParticipant,
  getRoomRole,
  getScoringMode,
  setScoringMode,
  getTapeScoreConfig,
  setTapeScoreConfig,
  setMyGrade,
  submitScore,
} from "../../firebaseFunctions";
import { db } from "../../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

// 색상(난이도) 정의
const COLORS = ["검정", "갈색", "보라", "남색", "파랑", "초록"];
const COLOR_MAP = {
  초록: "#22C55E",
  파랑: "#3B82F6",
  남색: "#1E40AF",
  보라: "#8B5CF6",
  갈색: "#92400E",
  검정: "#111827",
};

export default function RoomScorerPage() {
  const { roomId } = useParams();
  const auth = getAuth();
  const me = auth.currentUser;

  const [loading, setLoading] = useState(true);

  // 방 설정/권한
  const [myRole, setMyRole] = useState("member"); // member | scorer | admin
  const [mode, setMode] = useState("admin"); // admin(운영진만) | self(본인만)
  const [scoresCfg, setScoresCfg] = useState({}); // { 초록: 5, ... }

  // 참가자 (rooms/{roomId}/participants)
  const [participants, setParticipants] = useState([]);
  const [targetUid, setTargetUid] = useState(""); // admin모드에서 대상 선택

  // 내 등급
  const [myGrade1, setMyGrade1] = useState("");
  const [myGrade2, setMyGrade2] = useState("");

  // 채점 선택값
  const [selectedColor, setSelectedColor] = useState("");

  const isAdminLike = useMemo(() => myRole === "admin" || myRole === "scorer", [myRole]);
  const canEditSettings = useMemo(() => myRole === "admin", [myRole]); // 모드/점수표는 admin만

  // 초기 로딩: 참가자 보장 + 권한/설정/점수표 구독
  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        if (!me) throw new Error("로그인이 필요합니다.");

        // rooms/{roomId}/participants/{uid} 생성 보장
        await ensureParticipant(roomId);

        // 내 역할
        const role = await getRoomRole(roomId, me.uid);
        setMyRole(role);

        // 채점 모드
        const m = await getScoringMode(roomId);
        setMode(m);

        // 테이프 점수표
        const cfg = await getTapeScoreConfig(roomId);
        setScoresCfg(cfg || {});

        // 참가자 실시간 구독
        const qy = query(
          collection(db, "rooms", roomId, "participants"),
          orderBy("createdAt", "asc")
        );
        unsub = onSnapshot(qy, (snap) => {
          const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setParticipants(rows);
          // 내 등급 기본 세팅
          const mine = rows.find((p) => p.uid === me.uid);
          if (mine) {
            setMyGrade1(mine.grade1 || "");
            setMyGrade2(mine.grade2 || "");
          }
          // admin 모드일 때 기본 타겟 지정
          if (m === "admin" && rows.length > 0 && !targetUid) {
            setTargetUid(rows[0].uid);
          }
        });
      } catch (e) {
        console.error(e);
        alert(e.message || "초기 로딩 실패");
      } finally {
        setLoading(false);
      }
    })();
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, me?.uid]);

  // 채점 모드 변경 (admin만)
  const handleToggleMode = async () => {
    try {
      if (!canEditSettings) return;
      const next = mode === "admin" ? "self" : "admin";
      await setScoringMode(roomId, next);
      setMode(next);
    } catch (e) {
      console.error(e);
      alert("채점 모드 변경 실패");
    }
  };

  // 점수표 저장 (admin만)
  const handleSaveScoreCfg = async () => {
    try {
      if (!canEditSettings) return;
      // 숫자 정규화
      const normalized = {};
      for (const c of COLORS) {
        const v = Number(scoresCfg?.[c] ?? 0);
        normalized[c] = isNaN(v) ? 0 : v;
      }
      await setTapeScoreConfig(roomId, normalized);
      setScoresCfg(normalized);
      alert("테이프 점수표 저장 완료");
    } catch (e) {
      console.error(e);
      alert("점수표 저장 실패");
    }
  };

  // 내 등급 저장
  const handleSaveMyGrade = async () => {
    try {
      await setMyGrade(roomId, { grade1: myGrade1, grade2: myGrade2 });
      alert("내 등급이 저장되었습니다.");
    } catch (e) {
      console.error(e);
      alert("내 등급 저장 실패");
    }
  };

  // 점수 기록(채점)
  const handleSubmitScore = async () => {
    try {
      if (!selectedColor) {
        alert("색상을 선택해주세요.");
        return;
      }

      if (mode === "self") {
        // 본인만 가능
        await submitScore(roomId, {
          uid: me.uid,
          teamId: null, // 팀 기능 붙이면 전달
          color: selectedColor,
          tapeId: null, // 테이프 ID 붙이면 전달
          // points 생략 → 점수표 따라 자동
        });
        alert(`본인 채점 완료: ${selectedColor}`);
        return;
      }

      // admin 모드
      if (!isAdminLike) {
        alert("운영진만 채점할 수 있습니다.");
        return;
      }
      if (!targetUid) {
        alert("대상 참가자를 선택하세요.");
        return;
      }

      await submitScore(roomId, {
        uid: targetUid,
        teamId: null,
        color: selectedColor,
        tapeId: null,
      });
      alert(`채점 완료: 대상(${targetUid}) / ${selectedColor}`);
    } catch (e) {
      console.error(e);
      alert(e.message || "채점 실패");
    }
  };

  if (loading) return <div className="container py-4">로딩 중…</div>;

  return (
    <div className="container py-4">
      {/* 상단 네비 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">채점지</h3>
        <div className="d-flex gap-2">
          <Link to={`/rooms/${roomId}`} className="btn btn-outline-secondary btn-sm">방 홈</Link>
          <Link to={`/rooms/${roomId}/team-scores`} className="btn btn-outline-secondary btn-sm">조별 점수</Link>
          <Link to={`/rooms/${roomId}/rankings`} className="btn btn-outline-secondary btn-sm">전체 랭킹</Link>
        </div>
      </div>

      {/* 권한/모드 표시 */}
      <div className="alert alert-light border d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-semibold">내 권한: <span className="badge bg-primary">{myRole}</span></div>
          <div className="mt-1">채점 모드: <span className="badge bg-info text-dark">{mode}</span></div>
        </div>
        {canEditSettings && (
          <button className="btn btn-sm btn-outline-primary" onClick={handleToggleMode}>
            채점 모드 전환 (admin/self)
          </button>
        )}
      </div>

      <div className="row g-3">
        {/* 왼쪽: 내 등급 + 채점 */}
        <div className="col-12 col-lg-7">
          {/* 내 등급 */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="fw-bold mb-3">내 등급 설정</h5>
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <label className="form-label mb-1">1순위</label>
                  <select
                    className="form-select"
                    value={myGrade1}
                    onChange={(e) => setMyGrade1(e.target.value)}
                  >
                    <option value="">선택</option>
                    {COLORS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label mb-1">2순위 (선택)</label>
                  <select
                    className="form-select"
                    value={myGrade2}
                    onChange={(e) => setMyGrade2(e.target.value)}
                  >
                    <option value="">선택</option>
                    {COLORS.map((c) => (
                      <option key={c} value={c} disabled={c === myGrade1}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2 d-grid">
                  <button className="btn btn-primary mt-4" onClick={handleSaveMyGrade}>
                    저장
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 채점 입력 */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">채점</h5>

              {mode === "admin" && isAdminLike && (
                <div className="mb-3">
                  <label className="form-label">대상 참가자</label>
                  <select
                    className="form-select"
                    value={targetUid}
                    onChange={(e) => setTargetUid(e.target.value)}
                  >
                    <option value="">선택</option>
                    {participants.map((p) => (
                      <option key={p.uid} value={p.uid}>
                        {p.name || p.uid}
                        {p.grade1 ? ` · ${p.grade1}${p.grade2 ? `, ${p.grade2}` : ""}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">색상(난이도) 선택</label>
                <div className="d-flex flex-wrap gap-2">
                  {COLORS.map((c) => {
                    const active = selectedColor === c;
                    return (
                      <button
                        key={c}
                        className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setSelectedColor(c)}
                        style={{
                          borderColor: COLOR_MAP[c],
                          color: active ? "#fff" : COLOR_MAP[c],
                          backgroundColor: active ? COLOR_MAP[c] : "transparent",
                        }}
                      >
                        {c}
                        {typeof scoresCfg?.[c] === "number" ? ` (${scoresCfg[c]}점)` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="d-grid">
                <button className="btn btn-success" onClick={handleSubmitScore}>
                  {mode === "self" ? "본인 채점 기록" : "채점 기록"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 점수표 설정 + 참가자 리스트 */}
        <div className="col-12 col-lg-5">
          {/* 점수표 (admin만 수정) */}
          <div className="card shadow-sm mb-3">
            <div className="card-body">
              <h5 className="fw-bold mb-3">테이프 점수표</h5>
              <div className="row g-2">
                {COLORS.map((c) => (
                  <div className="col-6" key={c}>
                    <label className="form-label mb-1">{c}</label>
                    <input
                      type="number"
                      className="form-control"
                      value={Number(scoresCfg?.[c] ?? 0)}
                      onChange={(e) =>
                        setScoresCfg((prev) => ({
                          ...prev,
                          [c]: Number(e.target.value || 0),
                        }))
                      }
                      disabled={!canEditSettings}
                      min={0}
                    />
                  </div>
                ))}
              </div>
              {canEditSettings && (
                <div className="text-end mt-3">
                  <button className="btn btn-outline-primary btn-sm" onClick={handleSaveScoreCfg}>
                    점수표 저장
                  </button>
                </div>
              )}
              {!canEditSettings && (
                <div className="text-muted small mt-2">
                  점수표는 방장만 수정할 수 있어요.
                </div>
              )}
            </div>
          </div>

          {/* 참가자 */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">참가자</h5>
              {participants.length === 0 ? (
                <div className="text-muted">아직 참가자가 없어요.</div>
              ) : (
                <ul className="list-group list-group-flush">
                  {participants.map((p) => (
                    <li key={p.uid} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{p.name || p.uid}</div>
                        <div className="text-muted small">
                          {p.grade1 ? `${p.grade1}${p.grade2 ? `, ${p.grade2}` : ""}` : "등급 미설정"}
                        </div>
                      </div>
                      {mode === "admin" && isAdminLike && (
                        <button
                          className={`btn btn-sm ${targetUid === p.uid ? "btn-primary" : "btn-outline-secondary"}`}
                          onClick={() => setTargetUid(p.uid)}
                        >
                          대상 지정
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
}
