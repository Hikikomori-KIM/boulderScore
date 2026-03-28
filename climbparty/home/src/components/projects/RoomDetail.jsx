// 📁 src/components/projects/RoomDetail.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";
import { db } from "../../firebase";
import {
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { joinRoom, leaveRoom } from "../../firebaseFunctions";

// 방 기능 컴포넌트
import RoomChat from "./RoomChat";
import RoomMembers from "./RoomMembers";
import RoomSettings from "./RoomSettings";

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 디버그용 상태
  const [debugProjectId, setDebugProjectId] = useState("");
  const [debugUserDoc, setDebugUserDoc] = useState(null);
  const [debugRoomDoc, setDebugRoomDoc] = useState(null);

  // “셀프 조인” 1회만 시도하기 위한 플래그
  const selfJoinTriedRef = useRef(false);

  const uid = auth.currentUser?.uid || null;

  // ───────────────────────────────────────────────────────────
  // 1) 구독 이전에 "셀프 입장" 먼저 시도 → 그 다음 onSnapshot 구독
  //    (rules: rooms/{roomId} update changedOnly(["members"]) && addedSelfToMembers())
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    let unsub = null;

    const start = async () => {
      try {
        if (!roomId) return;
        if (!auth.currentUser) {
          setErrMsg("로그인이 필요합니다. (상단 메뉴에서 로그인해주세요)");
          setLoading(false);
          return;
        }

        // 1-A) 셀프조인: onSnapshot 이전에 1회만 시도
        if (!selfJoinTriedRef.current) {
          selfJoinTriedRef.current = true;
          try {
            // joinRoom 내부가 members 배열만 변경하는 구현이면 그대로 사용해도 됨
            // await joinRoom(roomId);

            // 혹시 내부 구현이 복잡하다면 안전하게 'members'만 업데이트:
            await updateDoc(doc(db, "rooms", roomId), {
              members: arrayUnion(auth.currentUser.uid),
            });
          } catch (e) {
            // 공개방이 아니거나, 이미 멤버인 경우 등 다양한 사유로 실패할 수 있음 → 경고만
            console.warn("[self-join] skipped or failed:", e?.message || e);
          }
        }

        // 1-B) 이제 구독 시작 (공개방/멤버/오너/역할/관리자면 read 허용됨)
        const ref = doc(db, "rooms", roomId);
        unsub = onSnapshot(
          ref,
          (snap) => {
            if (!snap.exists()) {
              setRoom(null);
              setErrMsg(`방을 찾을 수 없습니다. (roomId=${roomId})`);
              setLoading(false);
              setDebugRoomDoc("(not found)");
              return;
            }
            const data = { id: snap.id, ...snap.data() };
            setRoom(data);
            setErrMsg("");
            setLoading(false);
            setDebugRoomDoc(data);
          },
          (err) => {
            console.error("방 구독 실패:", err);
            setErrMsg("방 구독 실패: " + (err?.message || err));
            setLoading(false);
          }
        );
      } catch (e) {
        console.error("초기화 오류:", e);
        setErrMsg("초기화 오류: " + (e?.message || e));
        setLoading(false);
      }
    };

    start();
    return () => {
      if (unsub) unsub();
    };
    // auth.currentUser는 객체참조 변경이 잦아서 uid만 의존성으로 둠
  }, [roomId, uid]);

  const isMember = useMemo(() => {
    if (!room || !Array.isArray(room?.members) || !uid) return false;
    return room.members.includes(uid);
  }, [room, uid]);

  // ───────────────────────────────────────────────────────────
  // 2) 오너 자동 승격: roles/{uid}.role = "admin"
  //    (오너만 실행, 방/uid 준비 후 1회성으로)
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    const autoPromoteOwner = async () => {
      try {
        if (!uid || !room?.createdBy || !roomId) return;
        if (uid !== room.createdBy) return; // 오너만
        const roleDoc = doc(db, "rooms", roomId, "roles", uid);
        const roleSnap = await getDoc(roleDoc);
        const roleVal = roleSnap.exists() ? roleSnap.data()?.role : null;
        if (!roleVal) {
          await setDoc(roleDoc, { role: "admin", promotedAt: serverTimestamp() }, { merge: true });
          console.log("[roles] owner auto-promoted to admin");
        }
      } catch (e) {
        console.error("owner auto-promote failed:", e);
        setErrMsg("권한 자동 복구 실패(오너): " + (e?.message || e));
      }
    };
    autoPromoteOwner();
  }, [roomId, room?.createdBy, uid]);

  // 권한/셀프채점 표시용
  const [roomRole, setRoomRole] = useState(null);
  const [platformRole, setPlatformRole] = useState(null);
  const [selfScoring, setSelfScoring] = useState(null);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setDebugProjectId(getApp().options.projectId || "");
      } catch {}
      try {
        if (uid && roomId) {
          const roleSnap = await getDoc(doc(db, "rooms", roomId, "roles", uid));
          setRoomRole(roleSnap.exists() ? roleSnap.data()?.role ?? null : null);
        } else {
          setRoomRole(null);
        }
      } catch {}
      try {
        if (uid) {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : null;
          setPlatformRole(userData?.role ?? null);
          setDebugUserDoc(userData || "(not found)");
        } else {
          setPlatformRole(null);
          setDebugUserDoc(null);
        }
      } catch (e) {
        console.error("users/{uid} read 실패:", e);
        setPlatformRole(null);
      }
      try {
        if (roomId) {
          const cfg = await getDoc(doc(db, "rooms", roomId, "config", "scoring"));
          setSelfScoring(cfg.exists() ? !!cfg.data()?.selfScoringEnabled : null);
        }
      } catch {}
    };
    fetchMeta();
  }, [roomId, uid]);

  // ----- 수동 복구 핸들러들 -----
  // 0) 내 계정 superadmin 설정 (users/{uid}.role)
  const ensurePlatformSuperAdmin = async () => {
    try {
      if (!uid) return setErrMsg("로그인이 필요합니다.");
      await setDoc(
        doc(db, "users", uid),
        { role: "superadmin", updatedAt: serverTimestamp() },
        { merge: true }
      );
      alert("내 계정에 superadmin 권한을 부여했습니다.");
      // 즉시 반영
      setPlatformRole("superadmin");
      setDebugUserDoc((prev) => ({ ...(prev || {}), role: "superadmin" }));
    } catch (e) {
      console.error("superadmin 부여 실패:", e);
      setErrMsg("superadmin 부여 실패: " + (e?.message || e));
    }
  };

  // 1) 방 멤버십 복구 (rooms/{roomId}.members += uid)
  const ensureMembership = async () => {
    try {
      if (!uid) return setErrMsg("로그인이 필요합니다.");
      const roomRef = doc(db, "rooms", roomId);
      await updateDoc(roomRef, { members: arrayUnion(uid) });
      alert("멤버십 복구 완료!");
    } catch (e) {
      console.error("멤버십 복구 실패:", e);
      setErrMsg("멤버십 복구 실패: " + (e?.message || e));
    }
  };

  // 2) 룸 관리자 권한 부여 (roles/{uid}.role = admin)
  const ensureRoomAdmin = async () => {
    try {
      if (!uid) return setErrMsg("로그인이 필요합니다.");
      await setDoc(
        doc(db, "rooms", roomId, "roles", uid),
        { role: "admin", grantedAt: serverTimestamp() },
        { merge: true }
      );
      alert("룸 관리자 권한 부여 완료!");
      setRoomRole("admin");
    } catch (e) {
      console.error("권한 부여 실패:", e);
      setErrMsg("권한 부여 실패: " + (e?.message || e));
    }
  };

  // 테스트용 메시지 전송
  const sendTestMessage = async () => {
    try {
      if (!uid) return setErrMsg("로그인이 필요합니다.");
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: "테스트 메시지",
        authorId: uid,
        createdAt: serverTimestamp(),
      });
      alert("메시지 전송 성공!");
    } catch (e) {
      console.error("메시지 전송 실패:", e);
      setErrMsg("메시지 전송 실패: " + (e?.message || e));
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoom(roomId);
      navigate("/projects/list");
    } catch (e) {
      console.error("나가기 실패:", e);
      setErrMsg("나가기 실패: " + (e?.message || e));
    }
  };

  // 렌더
  return (
    <div className="container py-4">
      {/* 에러/알림 배너 */}
      {errMsg && (
        <div className="alert alert-danger" role="alert">
          {errMsg}
        </div>
      )}

      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">{room?.name || "(방 정보 없음)"}</h3>
        <div className="d-flex flex-wrap gap-2">
          <Link
            to={`/rooms/${roomId}/team-scores`}
            className="btn btn-sm btn-primary"
          >
            채점지
          </Link>
          <span className="text-muted d-flex align-items-center">
            상태: {room?.status || "unknown"}
          </span>
          {/* 0단계: 내 계정 superadmin 세팅 */}
          <button
            className="btn btn-sm btn-outline-dark"
            onClick={ensurePlatformSuperAdmin}
            title="users/{내 uid}.role = superadmin"
          >
            내 계정 superadmin 세팅
          </button>
          {/* 1~2단계: superadmin이 된 뒤 실행 */}
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={ensureMembership}
            title="rooms/{roomId}.members 에 내 uid 추가"
          >
            멤버십 복구
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={ensureRoomAdmin}
            title="rooms/{roomId}/roles/{내 uid} = admin"
          >
            룸 관리자 부여
          </button>
          <button
            className="btn btn-sm btn-outline-success"
            onClick={sendTestMessage}
            title="rooms/{roomId}/messages 로 규칙 호환 메시지 전송"
          >
            테스트 메시지
          </button>
        </div>
      </div>

      {/* 권한 진단 + 원시 디버그 패널 */}
      <div className="mb-3 p-2 border rounded bg-light small">
        <div><b>projectId</b>: {debugProjectId || "—"}</div>
        <div><b>myUid</b>: {uid || "—"}</div>
        <div className="d-flex flex-wrap gap-3">
          <div><b>ownerUid</b>: {room?.createdBy || "—"}</div>
          <div><b>isMember</b>: {String(isMember)}</div>
          <div><b>roomRole</b>: {roomRole || "—"}</div>
          <div><b>platformRole</b>: {platformRole || "—"}</div>
          <div><b>selfScoring</b>: {String(selfScoring)}</div>
        </div>
        <details className="mt-2">
          <summary>users/{uid} 원시 데이터</summary>
          <pre className="mb-0">{JSON.stringify(debugUserDoc, null, 2)}</pre>
        </details>
        <details className="mt-2">
          <summary>rooms/{roomId} 원시 데이터</summary>
          <pre className="mb-0">{JSON.stringify(debugRoomDoc, null, 2)}</pre>
        </details>
      </div>

      {/* 로딩 표시 */}
      {loading && <div className="text-muted">로딩 중…</div>}

      {/* 간단 메타 */}
      <div className="mb-3 text-muted">
        참여 인원: {room?.members?.length || 0}명
      </div>

      {/* 입장/나가기 버튼 */}
      <div className="d-flex gap-2 mb-4">
        {!isMember ? (
          <button className="btn btn-primary" onClick={() => joinRoom(roomId)}>
            입장하기
          </button>
        ) : (
          <button className="btn btn-outline-danger" onClick={handleLeave}>
            나가기
          </button>
        )}
      </div>

      {/* 방 기능들 */}
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <RoomChat roomId={roomId} isMember={isMember} />
        </div>
        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          <RoomMembers
            roomId={roomId}
            members={room?.members || []}
            ownerUid={room?.createdBy}
          />
          <RoomSettings
            roomId={roomId}
            ownerUid={room?.createdBy}
            status={room?.status}
          />
        </div>
      </div>
    </div>
  );
}
