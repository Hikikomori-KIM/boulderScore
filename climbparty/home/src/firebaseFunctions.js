// firebaseFunctions.js
import { db, auth } from "./firebase";
export { db, auth };

import {
  increment, collection, getDocs, setDoc, deleteDoc, doc, getDoc,
  addDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove,
  where, query, orderBy
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile,
  sendPasswordResetEmail, setPersistence, browserLocalPersistence, signOut,
  sendEmailVerification, GoogleAuthProvider, signInWithPopup, getAuth
} from "firebase/auth";

/* ─────────────────────────────────────────────────────────────
 * 기본 회원/게시판/게임 등 기존 기능
 * ───────────────────────────────────────────────────────────── */
export const registerUser = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    name,
    createdAt: new Date(),
    role: "user",
    agreed: true,
  });

  await sendEmailVerification(user);
  await signOut(auth);
};

export const loginUser = async (email, password) => {
  await setPersistence(auth, browserLocalPersistence);
  return await signInWithEmailAndPassword(auth, email, password);
};

export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

export const sendVerificationEmail = async () => {
  if (!auth.currentUser) throw new Error("현재 로그인된 사용자가 없습니다.");
  await sendEmailVerification(auth.currentUser);
};

export const getUserRole = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data().role : null;
};

export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  await setPersistence(auth, browserLocalPersistence);
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "이름 없음",
      role: "user",
      agreed: false,
      createdAt: new Date(),
    });
  }
  return user;
};

export const saveUserAfterAgreement = async (user) => {
  await updateDoc(doc(db, "users", user.uid), { agreed: true });
};

export const checkAgreement = async (uid) => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data().agreed === true : false;
};

/* 참가자 (기존 전역 members) */
export const saveMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  await setDoc(docRef, {
    id: member.id,
    name: member.name,
    teamId: member.teamId,
    partyId: member.partyId,
    level: member.level,
    scores: member.scores || {},
  });
};

export const loadMembers = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const loadMembersByParty = async (partyId) => {
  const q = query(collection(db, "members"), where("partyId", "==", partyId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteMember = async (memberId) => {
  await deleteDoc(doc(db, "members", String(memberId)));
};

export const updateMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  const memberToUpdate = { ...member, teamId: member.teamId };
  delete memberToUpdate.team;
  await setDoc(docRef, memberToUpdate);
};

/* 암장 */
export const loadGyms = async () => {
  const snapshot = await getDocs(collection(db, "gyms"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const loadGymTapes = async (gymId) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  return snapshot.exists() ? snapshot.data().tapes || [] : [];
};

export const addTapeToGym = async (gymId, tapeName) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  if (!snapshot.exists()) return;
  const updatedTapes = [...(snapshot.data().tapes || []), tapeName];
  await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
};

export const deleteTapeFromGym = async (gymId, tapeToDelete) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  if (!snapshot.exists()) return;
  const updatedTapes = snapshot.data().tapes.filter((t) => t !== tapeToDelete);
  await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
};

/* 파티 */
export const saveParty = async ({ name, gymId, scores }) => {
  return await addDoc(collection(db, "parties"), { name, gymId, scores });
};

export const loadParties = async () => {
  const snapshot = await getDocs(collection(db, "parties"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/* 게시판 */
export const savePost = async (post) => {
  return await addDoc(collection(db, "posts"), {
    ...post,
    createdAt: serverTimestamp(),
    views: 0,
    likes: 0,
    likedBy: [],
  });
};

export const loadPosts = async () => {
  const snapshot = await getDocs(collection(db, "posts"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const loadPostById = async (id) => {
  const snapshot = await getDoc(doc(db, "posts", id));
  return { id: snapshot.id, ...snapshot.data() };
};

export const increaseViewCount = async (postId, uid) => {
  if (!uid) return;
  const postRef = doc(db, "posts", postId);
  const snapshot = await getDoc(postRef);
  if (!snapshot.exists()) return;
  if (!(snapshot.data().viewedBy || []).includes(uid)) {
    await updateDoc(postRef, {
      views: (snapshot.data().views || 0) + 1,
      viewedBy: arrayUnion(uid),
    });
  }
};

export const toggleLikePost = async (postId, uid) => {
  const postRef = doc(db, "posts", postId);
  const snapshot = await getDoc(postRef);
  if (!snapshot.exists()) return null;
  const alreadyLiked = snapshot.data().likedBy?.includes(uid);
  if (alreadyLiked) {
    await updateDoc(postRef, { likes: (snapshot.data().likes || 1) - 1, likedBy: arrayRemove(uid) });
    return { liked: false };
  } else {
    await updateDoc(postRef, { likes: (snapshot.data().likes || 0) + 1, likedBy: arrayUnion(uid) });
    return { liked: true };
  }
};

export const deletePost = async (postId) => {
  await deleteDoc(doc(db, "posts", postId));
};

export const addComment = async (postId, { content, author, authorId }) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  await addDoc(commentsRef, { content, author, authorId, createdAt: serverTimestamp() });
  await updateDoc(doc(db, "posts", postId), { commentCount: increment(1) });
};

export const getComments = async (postId) => {
  const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteComment = async (postId, commentId) => {
  await deleteDoc(doc(db, "posts", postId, "comments", commentId));
  await updateDoc(doc(db, "posts", postId), { commentCount: increment(-1) });
};

/* 1to50 */
export const saveOneToFiftyRecord = async (userId, name, time) => {
  const recordRef = doc(db, "oneToFiftyRecords", userId);
  const snapshot = await getDoc(recordRef);
  if (!snapshot.exists() || snapshot.data().bestTime > parseFloat(time)) {
    await setDoc(recordRef, { name, bestTime: parseFloat(time), createdAt: serverTimestamp() });
    return true;
  }
  return false;
};

/* 프로젝트(기존) */
export const createProjectRoom = async (name, creator) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const projectRef = doc(collection(db, "projects"));
  await setDoc(projectRef, {
    name,
    code,
    createdAt: serverTimestamp(),
    createdBy: {
      uid: creator.uid,
      name: creator.name || creator.displayName || "이름 없음",
      email: creator.email || "",
    },
    tapeScores: {},
    teams: [],
  });
  await setDoc(doc(db, "projects", projectRef.id, "members", creator.uid), {
    uid: creator.uid,
    name: creator.name || creator.displayName || "이름 없음",
    role: "owner",
    joinedAt: serverTimestamp(),
  });
  return { id: projectRef.id, code };
};

export const joinProjectByCode = async (code, user) => {
  const q = query(collection(db, "projects"), where("code", "==", code));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("유효하지 않은 초대코드입니다.");
  const projectDoc = snapshot.docs[0];
  const projectId = projectDoc.id;
  const memberRef = doc(db, "projects", projectId, "members", user.uid);
  const memberSnap = await getDoc(memberRef);
  if (!memberSnap.exists()) {
    await setDoc(memberRef, {
      uid: user.uid,
      name: user.name || user.displayName || "이름 없음",
      role: "user",
      joinedAt: serverTimestamp(),
    });
  }
  return { projectId };
};

export const updatePost = async (id, updatedData) => {
  const postRef = doc(db, "posts", id);
  await updateDoc(postRef, updatedData);
};

export const addAnnouncement = async ({ title, content, active }) => {
  const createdAt = new Date();
  await addDoc(collection(db, "announcements"), {
    title,
    content,
    active,
    createdAt,
  });
};

export const deleteAnnouncement = async (id) => {
  const ref = doc(db, "announcements", id);
  await deleteDoc(ref);
};

export const fetchAllAnnouncements = async () => {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateAnnouncement = async (id, updatedData) => {
  const ref = doc(db, "announcements", id);
  await updateDoc(ref, updatedData);
};

/* ─────────────────────────────────────────────────────────────
 * Rooms (방) - 생성/입장/나가기/채팅/권한/설정/채점
 * ───────────────────────────────────────────────────────────── */
const clean = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

export const createRoom = async (name, status, createdBy) => {
  const authI = getAuth();
  const user = authI.currentUser;
  const uid = createdBy || user?.uid;
  if (!uid) throw new Error("로그인 상태에서만 방을 만들 수 있습니다.");

  const data = clean({
    name: name?.trim(),
    status: status || "open",
    createdAt: serverTimestamp(),
    createdBy: uid,
    members: [uid],
  });

  const docRef = await addDoc(collection(db, "rooms"), data);
  return docRef.id;
};

export const joinRoom = async (roomId) => {
  const authI = getAuth();
  const user = authI.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const ref = doc(db, "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("방을 찾을 수 없습니다.");

  await updateDoc(ref, {
    members: arrayUnion(user.uid),
    lastJoinedAt: serverTimestamp(),
  });
};

export const leaveRoom = async (roomId) => {
  const authI = getAuth();
  const user = authI.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    members: arrayRemove(user.uid),
  });
};

export const sendRoomMessage = async (roomId, text) => {
  const authI = getAuth();
  const user = authI.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const cleanText = (text || "").trim();
  if (!cleanText) return;

  const ref = collection(db, "rooms", roomId, "messages");
  await addDoc(ref, {
    text: cleanText,
    authorId: user.uid,           // ✅ 규칙 요구 필드
    createdAt: serverTimestamp()  // ✅ 규칙 요구 필드
    // ⚠️ authorName 제거 → 규칙에 없으면 권한 에러 발생함
  });
};


export const removeRoomMember = async (roomId, targetUid) => {
  if (!targetUid) throw new Error("대상 UID가 필요합니다.");
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    members: arrayRemove(targetUid),
  });
};

export const setRoomStatus = async (roomId, status) => {
  const next = (status || "").trim();
  if (!next) throw new Error("유효한 상태가 필요합니다.");
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, { status: next });
};

export const fetchRooms = async (uid) => {
  if (!uid) throw new Error("로그인이 필요합니다.");
  const qy = query(
    collection(db, "rooms"),
    where("createdBy", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(qy);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/* ── 방 내부 역할(권한) ──────────────────────────────
   role: "member" | "scorer" | "admin"
*/
export const setRoomRole = async (roomId, targetUid, role) => {
  if (!targetUid) throw new Error("대상 UID 필요");
  await setDoc(doc(db, "rooms", roomId, "roles", targetUid), { role });
};

// 방장(createdBy)도 admin으로 인식되도록 보강
export const getRoomRole = async (roomId, uid) => {
  if (!uid) return "member";
  const room = await getDoc(doc(db, "rooms", roomId));
  if (room.exists() && room.data()?.createdBy === uid) return "admin";
  const snap = await getDoc(doc(db, "rooms", roomId, "roles", uid));
  return snap.exists() ? (snap.data().role || "member") : "member";
};

/* ── 방 설정 (테이프 점수표/채점 모드) ───────────────── */
export const setTapeScoreConfig = async (roomId, scoresByColor) => {
  // 예: { "초록": 5, "파랑": 7, ... }
  await setDoc(
    doc(db, "rooms", roomId, "config", "tapeScores"),
    scoresByColor || {},
    { merge: true }
  );
};

export const getTapeScoreConfig = async (roomId) => {
  const snap = await getDoc(doc(db, "rooms", roomId, "config", "tapeScores"));
  return snap.exists() ? snap.data() : {};
};

// 채점 모드: "admin"(운영진만) | "self"(본인도 가능)
export const getScoringMode = async (roomId) => {
  const snap = await getDoc(doc(db, "rooms", roomId, "config", "settings"));
  if (!snap.exists()) return "admin";
  return snap.data()?.scoringMode || "admin";
};

export const setScoringMode = async (roomId, mode) => {
  await setDoc(
    doc(db, "rooms", roomId, "config", "settings"),
    { scoringMode: mode, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

/* ── 참가자(방 단위) ─────────────────────────────────
   rooms/{roomId}/participants/{uid}
*/
export const ensureParticipant = async (roomId) => {
  const authI = getAuth();
  const user = authI.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const ref = doc(db, "rooms", roomId, "participants", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || user.email || "익명",
      grade1: "",
      grade2: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
};

export const setMyGrade = async (roomId, { grade1, grade2 }) => {
  const authI = getAuth();
  const user = authI.currentUser;
  if (!user) throw new Error("로그인이 필요합니다.");

  const ref = doc(db, "rooms", roomId, "participants", user.uid);
  await setDoc(
    ref,
    {
      uid: user.uid,
      name: user.displayName || user.email || "익명",
      grade1: grade1 || "",
      grade2: grade2 || "",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/* ── 채점(점수 기록) ─────────────────────────────────
   rooms/{roomId}/scores
   - mode가 self면 uid는 본인으로 강제
   - points가 생략되면 tapeScoreConfig에서 색상 점수 사용
*/
export const submitScore = async (
  roomId,
  { uid, teamId = null, color, tapeId = null, points = null }
) => {
  const authI = getAuth();
  const me = authI.currentUser;
  if (!me) throw new Error("로그인이 필요합니다.");

  const mode = await getScoringMode(roomId);
  const myRole = await getRoomRole(roomId, me.uid);

  let targetUid = uid;
  if (mode === "self") {
    // 본인만 채점 가능
    targetUid = me.uid;
  } else {
    // 운영진 모드
    if (!(myRole === "admin" || myRole === "scorer")) {
      throw new Error("운영진만 채점할 수 있습니다.");
    }
    if (!targetUid) throw new Error("대상 참가자를 선택하세요.");
  }

  const cfg = await getTapeScoreConfig(roomId);
  const colorKey = (color || "").trim();
  const finalPoints = points != null ? Number(points) : Number(cfg?.[colorKey] ?? 0);

  await addDoc(collection(db, "rooms", roomId, "scores"), {
    uid: targetUid,
    teamId,
    color: colorKey,
    tapeId: tapeId || "",
    points: finalPoints,
    createdAt: serverTimestamp(),
    by: me.uid,
  });
};

/* ── 랭킹/집계 (클라이언트 합산) ────────────────────── */
export const fetchColorRanking = async (roomId, color) => {
  const qy = query(
    collection(db, "rooms", roomId, "scores"),
    where("color", "==", (color || "").trim()),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  const rows = snap.docs.map((d) => d.data());

  const map = {};
  rows.forEach((r) => {
    map[r.uid] = (map[r.uid] || 0) + (r.points || 0);
  });
  return Object.entries(map)
    .map(([uidX, total]) => ({ uid: uidX, total }))
    .sort((a, b) => b.total - a.total);
};

export const fetchOverallRanking = async (roomId) => {
  const qy = query(
    collection(db, "rooms", roomId, "scores"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(qy);
  const rows = snap.docs.map((d) => d.data());

  const map = {};
  rows.forEach((r) => {
    map[r.uid] = (map[r.uid] || 0) + (r.points || 0);
  });
  return Object.entries(map)
    .map(([uidX, total]) => ({ uid: uidX, total }))
    .sort((a, b) => b.total - a.total);
};

export const fetchTeamScores = async (roomId) => {
  const snap = await getDocs(collection(db, "rooms", roomId, "scores"));
  const rows = snap.docs.map((d) => d.data());

  const map = {};
  rows.forEach((r) => {
    const key = r.teamId || "_NO_TEAM_";
    map[key] = (map[key] || 0) + (r.points || 0);
  });
  return Object.entries(map)
    .map(([teamId, total]) => ({ teamId, total }))
    .sort((a, b) => b.total - a.total);
};
