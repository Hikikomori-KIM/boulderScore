import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  deleteDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { getTapeScoreConfig } from "../../../firebaseFunctions";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";

// 정렬 및 색상 정의 (예전 UI 스타일)
const COLORS_ORDER = ["검정", "갈색", "보라", "남색", "파랑", "초록"];
const COLOR_HEX = {
  초록: "#22C55E",
  파랑: "#3B82F6",
  남색: "#1E40AF",
  보라: "#8B5CF6",
  갈색: "#92400E",
  검정: "#111827",
};

export default function RoomScorerSheetPage() {
  const { roomId } = useParams();

  // ────────────────────────────────────────────────────────────
  // 인증/권한 상태
  // ────────────────────────────────────────────────────────────
  const [authLoading, setAuthLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [myUid, setMyUid] = useState(null);

  const [ownerUid, setOwnerUid] = useState(null);
  const [myRoomRole, setMyRoomRole] = useState(null);
  const [platformRole, setPlatformRole] = useState(null);
  const [selfScoring, setSelfScoring] = useState(false);
  const [canRead, setCanRead] = useState(false);
  const [err, setErr] = useState(null);

  // ────────────────────────────────────────────────────────────
  // 데이터 상태
  // ────────────────────────────────────────────────────────────
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [members, setMembers] = useState([]);
  const [scores, setScores] = useState([]);

  const [colors, setColors] = useState(COLORS_ORDER);
  const [tapeScoreCfg, setTapeScoreCfg] = useState({});

  // 신규 참가자 입력
  const [newInput, setNewInput] = useState(null);

  // ────────────────────────────────────────────────────────────
  // Auth 구독
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthed(!!u);
      setAuthLoading(false);
      setMyUid(u?.uid || null);
    });
    return () => unsub();
  }, []);

  // ────────────────────────────────────────────────────────────
  // 방 프리플라이트 (존재/멤버십 등)
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !authed) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "rooms", roomId));
        if (!snap.exists()) {
          setErr("rooms:not-found");
          setCanRead(false);
          return;
        }
        const data = snap.data() || {};
        setOwnerUid(data?.createdBy ?? null);
        setCanRead(true);
        setErr(null);
      } catch (e) {
        const code = e?.code || e?.message || "";
        if (String(code).includes("permission-denied")) {
          setErr("permission-denied");
        } else {
          setErr(String(code));
        }
        setCanRead(false);
      }
    })();
  }, [roomId, authed, authLoading]);

  // ────────────────────────────────────────────────────────────
  // 권한/역할 설정 + 셀프채점 토글
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canRead) return;

    // 셀프 채점 설정
    getDoc(doc(db, "rooms", roomId, "config", "scoring"))
      .then((s) => setSelfScoring(!!(s.exists() && s.data()?.selfScoringEnabled === true)))
      .catch(() => {});

    if (myUid) {
      // 룸 역할
      getDoc(doc(db, "rooms", roomId, "roles", myUid))
        .then((s) => setMyRoomRole(s.exists() ? (s.data()?.role ?? null) : null))
        .catch(() => {});

      // 플랫폼 역할
      getDoc(doc(db, "users", myUid))
        .then((s) => setPlatformRole(s.exists() ? (s.data()?.role ?? null) : null))
        .catch(() => {});
    }
  }, [canRead, roomId, myUid]);

  // 방장이면 자동 승격 (owner → admin)
  useEffect(() => {
    const promote = async () => {
      try {
        if (!authed || authLoading) return;
        if (!myUid || !ownerUid || myUid !== ownerUid) return;
        if (myRoomRole === "admin" || myRoomRole === "scorer") return;
        await setDoc(doc(db, "rooms", roomId, "roles", myUid), { role: "admin" }, { merge: true });
        setMyRoomRole("admin");
      } catch {
        // noop
      }
    };
    promote();
  }, [authed, authLoading, myUid, ownerUid, myRoomRole, roomId]);

  // ────────────────────────────────────────────────────────────
  // 팀 목록 구독 (없으면 scores에서 fallback)
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canRead) return;
    const col = collection(db, "rooms", roomId, "teams");
    const unsub = onSnapshot(
      col,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        setTeams(list);
      },
      () => {}
    );
    return () => unsub();
  }, [roomId, canRead]);

  useEffect(() => {
    if (!canRead) return;
    if (teams.length > 0) return;
    const unsub = onSnapshot(collection(db, "rooms", roomId, "scores"), (snap) => {
      const uniq = new Set();
      snap.forEach((d) => {
        const t = (d.data() || {})?.teamId;
        if (t) uniq.add(t);
      });
      if (uniq.size > 0) {
        setTeams(Array.from(uniq).map((id) => ({ id, name: id })));
      }
    });
    return () => unsub();
  }, [roomId, canRead, teams.length]);

  // 첫 팀 자동 선택
  const teamOptions = useMemo(() => teams, [teams]);
  useEffect(() => {
    if (!teamId && teamOptions.length > 0) setTeamId(teamOptions[0].id);
  }, [teamOptions, teamId]);

  // ────────────────────────────────────────────────────────────
  // 팀 선택 → 멤버 & 점수 실시간 구독
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canRead || !authed) return;
    if (!teamId) {
      setMembers([]);
      setScores([]);
      return;
    }

    const qMem = query(
      collection(db, "rooms", roomId, "members"),
      where("teamId", "==", teamId)
    );
    const unsubMembers = onSnapshot(
      qMem,
      (snap) => {
        const list = snap.docs.map((d) => {
          const m = d.data() || {};
          return {
            id: m.uid || d.id,
            name: m.name || m.displayName || m.uid || d.id,
            teamId: m.teamId || "",
            level: m.level || "",
          };
        });
        setMembers(list);
      },
      () => {}
    );

    const qScore = query(
      collection(db, "rooms", roomId, "scores"),
      where("teamId", "==", teamId)
    );
    const unsubScores = onSnapshot(
      qScore,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        setScores(list);
      },
      () => {}
    );

    return () => {
      unsubMembers();
      unsubScores();
    };
  }, [roomId, teamId, authed, canRead]);

  // ────────────────────────────────────────────────────────────
  // 테이프 점수/색상 설정
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canRead) return;
    (async () => {
      try {
        const cfg = await getTapeScoreConfig(roomId);
        if (cfg && Object.keys(cfg).length) {
          const ks = Object.keys(cfg).filter((k) => COLORS_ORDER.includes(k));
          setColors(ks.length ? COLORS_ORDER.filter((k) => ks.includes(k)) : COLORS_ORDER);
          setTapeScoreCfg(cfg);
        } else {
          setColors(COLORS_ORDER);
          setTapeScoreCfg({});
        }
      } catch {
        setColors(COLORS_ORDER);
        setTapeScoreCfg({});
      }
    })();
  }, [roomId, canRead]);

  // ────────────────────────────────────────────────────────────
  // 계산값
  // ────────────────────────────────────────────────────────────
  const sortedMembers = useMemo(() => {
    const arr = [...members];
    arr.sort((a, b) => {
      const a1 = a.level?.split(",")[0]?.trim();
      const b1 = b.level?.split(",")[0]?.trim();
      return COLORS_ORDER.indexOf(a1) - COLORS_ORDER.indexOf(b1);
    });
    return arr;
  }, [members]);

  const memberCountMap = useMemo(() => {
    const map = {};
    for (const m of members) {
      map[m.id] = {};
      colors.forEach((c) => (map[m.id][c] = 0));
    }
    for (const s of scores) {
      const uid = s.uid || "UNKNOWN";
      const c = s.color || "";
      if (!map[uid] || !colors.includes(c)) continue;
      const d = typeof s.delta === "number" ? s.delta : 1;
      map[uid][c] += d;
    }
    return map;
  }, [members, scores, colors]);

  const chartData = useMemo(() => {
    const rows = sortedMembers.map((m) => {
      const arr = colors.map((c) => Math.max(0, memberCountMap[m.id]?.[c] ?? 0));
      const total = arr.reduce((a, b) => a + b, 0);
      return { name: m.name, scores: arr, total };
    });
    rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "ko"));
    return rows;
  }, [sortedMembers, memberCountMap, colors]);

  const chartOption = useMemo(() => {
    const yLabels = chartData.map((r) => r.name);
    return {
      grid: { left: 120, right: 60, top: 30, bottom: 30 },
      xAxis: { type: "value", max: (v) => ((v?.max ?? 0) * 1.1) },
      yAxis: { type: "category", data: yLabels, inverse: true },
      legend: { show: false },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params) => {
          const d = params?.[0]?.data;
          if (!d) return "";
          const lines = [`<b>${d.name}</b>`];
          colors.forEach((c, i) => lines.push(`${c}: ${d.scores?.[i] ?? 0}개`));
          lines.push(`<hr style="margin:4px 0;border:none;border-top:1px solid #eee" />총: ${d.value}개`);
          return lines.join("<br/>");
        },
      },
      series: [
        {
          type: "bar",
          barWidth: 25,
          data: chartData.map((r) => {
            if (r.total <= 0) {
              return {
                value: 0,
                name: r.name,
                scores: r.scores,
                itemStyle: { color: "#e5e7eb", borderRadius: [0, 10, 10, 0] },
              };
            }
            let offset = 0;
            const stops = [];
            r.scores.forEach((cnt, i) => {
              if (cnt <= 0) return;
              const ratio = cnt / r.total;
              stops.push(
                { offset, color: COLOR_HEX[colors[i]] },
                { offset: offset + ratio, color: COLOR_HEX[colors[i]] }
              );
              offset += ratio;
            });
            return {
              value: r.total,
              name: r.name,
              scores: r.scores,
              itemStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: stops,
                },
                borderRadius: [0, 10, 10, 0],
              },
            };
          }),
        },
      ],
    };
  }, [chartData, colors]);

  // ────────────────────────────────────────────────────────────
  // 권한 계산
  // ────────────────────────────────────────────────────────────
  const canWriteScore = useMemo(() => {
    const platformAdmin = platformRole === "admin" || platformRole === "superadmin";
    const roomAdminOrScorer = myRoomRole === "admin" || myRoomRole === "scorer";
    const owner = !!myUid && !!ownerUid && myUid === ownerUid;
    return platformAdmin || roomAdminOrScorer || owner;
  }, [platformRole, myRoomRole, myUid, ownerUid]);

  const canClickScoreFor = (uid) => {
    return canWriteScore || (selfScoring && myUid && myUid === uid);
  };

  // ────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────
  const addScoreDelta = async (uid, color, delta) => {
    if (!teamId) {
      alert("먼저 조를 선택하세요.");
      return;
    }
    if (!color) {
      alert("색상을 선택하세요.");
      return;
    }
    try {
      await addDoc(collection(db, "rooms", roomId, "scores"), {
        uid,
        teamId,
        color,
        delta,
        points: tapeScoreCfg?.[color] ?? 0,
        createdAt: serverTimestamp(),
        byUid: myUid || null,
        byRole: myRoomRole || platformRole,
        tapeId: null,
      });
    } catch (e) {
      const code = e?.code || e?.message || "";
      alert(
        String(code).includes("permission-denied")
          ? "권한이 없어 점수를 기록할 수 없습니다.\n(방장/운영진/스코어러 또는 셀프채점 본인만 가능)"
          : `점수 기록 중 오류: ${code}`
      );
    }
  };

  const handleScoreChange = (uid, color, diff) => {
    if (!canClickScoreFor(uid)) {
      alert("운영진만 채점할 수 있습니다. (셀프채점은 본인만 가능)");
      return;
    }
    const delta = diff > 0 ? +1 : -1;
    addScoreDelta(uid, color, delta);
  };

  const handleRegisterNewMember = async () => {
    const { name, level1, level2 } = newInput || {};
    if (!name || !level1 || !teamId) return alert("조, 이름, 난이도를 입력해주세요.");
    const levels = [level1, level2].filter((v, i, a) => !!v && a.indexOf(v) === i);
    try {
      const uid = uuidv4();
      await addDoc(collection(db, "rooms", roomId, "members"), {
        uid,
        teamId,
        name,
        level: levels.join(", "),
        createdAt: serverTimestamp(),
      });
      setNewInput(null);
      alert("참가자가 등록되었습니다!");
    } catch {
      alert("등록 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveMember = async (uid) => {
    if (!window.confirm("정말 이 참가자를 삭제하시겠습니까? (기록은 남습니다)")) return;
    try {
      const qMem = query(
        collection(db, "rooms", roomId, "members"),
        where("uid", "==", uid),
        where("teamId", "==", teamId)
      );
      const snap = await getDocs(qMem);
      if (!snap.empty) await deleteDoc(snap.docs[0].ref);
      alert("참가자가 삭제되었습니다.");
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // ────────────────────────────────────────────────────────────
  // 렌더링
  // ────────────────────────────────────────────────────────────
  if (authLoading) return <div className="container py-4">로그인 상태 확인 중…</div>;
  if (!authed) return <div className="container py-4">로그인 후 이용해주세요.</div>;
  if (err && String(err).startsWith("permission-denied")) {
    return (
      <div className="container py-4">
        이 방을 볼 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">채점자 전용 기록지 (예전 UI 스타일)</h4>
        <Link to={`/rooms/${roomId}`} className="btn btn-outline-secondary">
          ← 방으로
        </Link>
      </div>

      {/* 조 선택 */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <label className="fw-semibold mb-0">조:</label>
        <select
          className="form-select form-select-sm rounded-pill shadow-sm border-primary"
          style={{ width: "auto", minWidth: 160 }}
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">조 선택</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name || t.id}
            </option>
          ))}
        </select>
      </div>

      {/* 참가자 카드 */}
      {teamId && (
        <div className="row g-4">
          {sortedMembers.map((m) => {
            const primary = m.level?.split(",")[0]?.trim();
            const emoji = { 초록: "🟢", 파랑: "🔵", 남색: "🔷", 보라: "🟣", 갈색: "🟤", 검정: "⚫" }[primary || ""] || "🎯";
            const levels = m.level?.split(",").map((l) => l.trim()) || [];
            const rest = colors.filter((c) => !levels.includes(c));
            const displayOrder = [...levels, ...rest];
            return (
              <div key={m.id} className="col-md-6">
                <div className="p-3 border rounded shadow-sm bg-white h-100 position-relative">
                  <button
                    type="button"
                    className="btn-close position-absolute"
                    style={{ top: 10, right: 10 }}
                    aria-label="삭제"
                    onClick={() => handleRemoveMember(m.id)}
                  />
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    {m.name}
                    {primary && (
                      <span
                        className="badge rounded-pill d-flex align-items-center"
                        title={`1순위: ${primary}`}
                        style={{
                          backgroundColor: `${COLOR_HEX[primary]}20`,
                          color: COLOR_HEX[primary],
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      >
                        {emoji}&nbsp;{primary}
                      </span>
                    )}
                  </h5>
                  <div className="d-flex flex-wrap gap-3">
                    {displayOrder.map((color) => (
                      <div key={color} className="d-flex align-items-center gap-2">
                        <span
                          className="badge rounded-pill text-white"
                          style={{ backgroundColor: COLOR_HEX[color] }}
                        >
                          {color}
                        </span>
                        <button
                          onClick={() => handleScoreChange(m.id, color, -1)}
                          className="btn btn-outline-secondary btn-sm"
                          disabled={!canClickScoreFor(m.id)}
                          title={!canClickScoreFor(m.id) ? "권한 없음: (방장/운영진/스코어러) 또는 셀프채점(본인)만 가능" : ""}
                        >
                          –
                        </button>
                        <span className="px-2 fw-bold">
                          {Math.max(0, memberCountMap[m.id]?.[color] ?? 0)}
                        </span>
                        <button
                          onClick={() => handleScoreChange(m.id, color, +1)}
                          className="btn btn-outline-primary btn-sm"
                          disabled={!canClickScoreFor(m.id)}
                          title={!canClickScoreFor(m.id) ? "권한 없음: (방장/운영진/스코어러) 또는 셀프채점(본인)만 가능" : ""}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 참가자 추가 */}
      {teamId && (
        <div className="text-end mt-4 mb-3">
          {!newInput && (
            <button
              className="btn btn-success"
              onClick={() => setNewInput({ name: "", level1: "", level2: "" })}
            >
              + 참가자 추가
            </button>
          )}
        </div>
      )}

      {newInput && (
        <div className="mb-4 p-3 border rounded bg-light">
          <div className="row g-2">
            <div className="col-md-3">
              <input
                className="form-control"
                placeholder="이름"
                value={newInput.name}
                onChange={(e) => setNewInput((p) => ({ ...(p || {}), name: e.target.value }))}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={newInput.level1}
                onChange={(e) => setNewInput((p) => ({ ...(p || {}), level1: e.target.value }))}
              >
                <option value="">1순위 난이도</option>
                {colors.map((c) => (
                  <option key={c} value={c} disabled={c === newInput.level2}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={newInput.level2}
                onChange={(e) => setNewInput((p) => ({ ...(p || {}), level2: e.target.value }))}
              >
                <option value="">2순위 난이도(선택)</option>
                {colors.map((c) => (
                  <option key={c} value={c} disabled={c === newInput.level1}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <button className="btn btn-primary w-50" onClick={handleRegisterNewMember}>
                등록
              </button>
              <button className="btn btn-secondary w-50" onClick={() => setNewInput(null)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 차트 */}
      {teamId && chartData.length > 0 && (
        <div
          style={{
            width: "95vw",
            maxWidth: 1200,
            margin: "0 auto",
            background: "#fff",
            borderRadius: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: "1rem",
          }}
        >
          <h5 className="text-center mb-3 fw-semibold">
            {teams.find((t) => t.id === teamId)?.name || "팀"} 클리어 현황 (차트)
          </h5>
          <div
            style={{
              width: "100%",
              height: Math.max(chartData.length * 60, 300),
              minHeight: 300,
              maxHeight: 600,
              overflow: "hidden",
            }}
          >
            <ReactECharts option={chartOption} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
}
