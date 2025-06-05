import { db, auth } from "./firebase";
import { increment } from "firebase/firestore"; // 맨 위에 추가
import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  signOut,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { where } from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";

// ✅ 회원가입
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
    agreed: true, // 기본값 false
  });

  await sendEmailVerification(user);
  await signOut(auth);
};

// ✅ 로그인 (이메일)
export const loginUser = async (email, password) => {
  await setPersistence(auth, browserLocalPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
};

// ✅ 비밀번호 재설정
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// ✅ 이메일 인증 다시 보내기
export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error("현재 로그인된 사용자가 없습니다.");
  }
};

// ✅ 역할 조회
export const getUserRole = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data().role : null;
};

// ✅ 구글 로그인
export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();

  try {
    console.log("🌐 GoogleLogin 함수 진입");
    await setPersistence(auth, browserLocalPersistence); // ✅ 세션 유지
    console.log("🔒 setPersistence 완료");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("✅ Google 로그인 성공:", user);

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      console.log("📄 Firestore 사용자 문서 없음 → 새로 생성");
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "이름 없음",
        role: "user",
        agreed: false,
        createdAt: new Date(),
      });
    } else {
      console.log("📄 Firestore 사용자 문서 이미 존재");
    }

    return user;
  } catch (error) {
    console.error("❌ Google 로그인 실패:", error);
    throw error;
  }
};


// ✅ 약관 동의 처리
export const saveUserAfterAgreement = async (user) => {
  const userRef = doc(db, "users", user.uid);
  await updateDoc(userRef, {
    agreed: true,
  });
};

// ✅ 약관 동의 여부 확인
export const checkAgreement = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data().agreed === true : false;
};

// ✅ 참가자 저장
export const saveMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  const memberToSave = {
    id: member.id,
    name: member.name,
    teamId: member.teamId,
    partyId: member.partyId,
    level: member.level,          // ✅ 반드시 포함
    scores: member.scores || {},  // ✅ 반드시 포함
  };
  await setDoc(docRef, memberToSave);
};


// ✅ 참가자 불러오기
export const loadMembers = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchActiveAnnouncement = async () => {
  const q = query(
    collection(db, "announcements"),
    where("active", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};



// ✅ 특정 파티의 참가자만 불러오기
export const loadMembersByParty = async (partyId) => {
  const q = query(
    collection(db, "members"),
    where("partyId", "==", partyId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchAllAnnouncements = async () => {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
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
export const updateAnnouncement = async (id, updatedData) => {
  const ref = doc(db, "announcements", id);
  await updateDoc(ref, updatedData);
};
export const deleteAnnouncement = async (id) => {
  const ref = doc(db, "announcements", id);
  await deleteDoc(ref);
};


// ✅ 참가자 삭제
export const deleteMember = async (memberId) => {
  const docRef = doc(db, "members", String(memberId));
  await deleteDoc(docRef);
};

// ✅ 참가자 수정
export const updateMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  const memberToUpdate = {
    ...member,
    teamId: member.teamId, // teamId 저장
  };
  delete memberToUpdate.team; // 혹시 남아있을 team 필드는 지운다
  await setDoc(docRef, memberToUpdate);
};


// ✅ 암장 목록 불러오기
export const loadGyms = async () => {
  const snapshot = await getDocs(collection(db, "gyms"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// ✅ 특정 암장의 테이프 불러오기
export const loadGymTapes = async (gymId) => {
  const gymRef = doc(db, "gyms", gymId);
  const snapshot = await getDoc(gymRef);
  if (!snapshot.exists()) return [];
  return snapshot.data().tapes || [];
};

// ✅ 암장에 테이프 추가
export const addTapeToGym = async (gymId, tapeName) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  if (!snapshot.exists()) return;

  const gymData = snapshot.data();
  const updatedTapes = [...(gymData.tapes || []), tapeName];
  await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
};

// ✅ 암장에서 테이프 삭제
export const deleteTapeFromGym = async (gymId, tapeToDelete) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  if (!snapshot.exists()) return;

  const gymData = snapshot.data();
  const updatedTapes = gymData.tapes.filter((t) => t !== tapeToDelete);
  await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
};

// ✅ 파티 저장
export const saveParty = async ({ name, gymId, scores }) => {
  return await addDoc(collection(db, "parties"), {
    name,
    gymId,
    scores,
  });
};

// ✅ 파티 목록 불러오기
export const loadParties = async () => {
  const snapshot = await getDocs(collection(db, "parties"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
// ✅ 게시글 저장
export const savePost = async (post) => {
  return await addDoc(collection(db, "posts"), {
    ...post,
    createdAt: serverTimestamp(),  // ✅ 꼭 Timestamp로 저장
    views: 0,
    likes: 0,
    likedBy: [],
  });
};
// ✅ 게시글 목록 불러오기 (최신순)
export const loadPosts = async () => {
  const snapshot = await getDocs(collection(db, "posts"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
// ✅ 특정 게시글 불러오기
export const loadPostById = async (id) => {
  const ref = doc(db, "posts", id);
  const snapshot = await getDoc(ref);
  return { id: snapshot.id, ...snapshot.data() };
};
// ✅ 조회수 증가 + 중복 방지
export const increaseViewCount = async (postId, uid) => {
  if (!uid) return; // ✅ uid가 없으면 아무 작업도 안 함

  const postRef = doc(db, "posts", postId);
  const snapshot = await getDoc(postRef);

  if (!snapshot.exists()) return;

  const post = snapshot.data();
  const alreadyViewed = (post.viewedBy || []).includes(uid); // ✅ 방어 처리

  if (!alreadyViewed) {
    await updateDoc(postRef, {
      views: (post.views || 0) + 1,
      viewedBy: arrayUnion(uid),
    });
  }
};
// ✅ 좋아요 토글 함수 (있으면 취소, 없으면 추가)
export const toggleLikePost = async (postId, uid) => {
  const postRef = doc(db, "posts", postId);
  const snapshot = await getDoc(postRef);
  if (!snapshot.exists()) return null;

  const post = snapshot.data();
  const alreadyLiked = post.likedBy?.includes(uid);

  if (alreadyLiked) {
    // 좋아요 취소
    await updateDoc(postRef, {
      likes: (post.likes || 1) - 1,
      likedBy: arrayRemove(uid),
    });
    return { liked: false };
  } else {
    // 좋아요 추가
    await updateDoc(postRef, {
      likes: (post.likes || 0) + 1,
      likedBy: arrayUnion(uid),
    });
    return { liked: true };
  }
};
// ✅ 게시글 삭제
export const deletePost = async (postId) => {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
};
// ✅ 댓글 저장
export const addComment = async (postId, { content, author, authorId }) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  await addDoc(commentsRef, {
    content,
    author,
    authorId,
    createdAt: serverTimestamp(),
  });

  // 🔥 댓글 수 증가
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    commentCount: increment(1),
  });
};

export const getComments = async (postId) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const updatePost = async (id, updatedData) => {
  const postRef = doc(db, "posts", id);
  await updateDoc(postRef, updatedData);
};
// ✅ 댓글 삭제 함수
export const deleteComment = async (postId, commentId) => {
  const commentRef = doc(db, "posts", postId, "comments", commentId);
  await deleteDoc(commentRef);

  // 🔥 댓글 수 감소
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    commentCount: increment(-1),
  });
};

//기록 저장함수

export async function saveOneToFiftyRecord(userId, name, time) {
  const recordRef = doc(db, "oneToFiftyRecords", userId);
  const snapshot = await getDoc(recordRef);

  if (!snapshot.exists() || snapshot.data().bestTime > parseFloat(time)) {
    await setDoc(recordRef, {
      name,
      bestTime: parseFloat(time),
      createdAt: serverTimestamp(), // ✅ 변경
    });
    return true; // 기록 갱신됨
  } else {
    return false; // 기존 기록이 더 좋음
  }
}
//✅ 크루 생성
export const createCrew = async (crewName, ownerId, ownerName) => {
  const crewRef = doc(collection(db, "crews"));
  await setDoc(crewRef, {
    crewName,
    ownerId,
    ownerName,
    createdAt: serverTimestamp(),
    members: [ownerId],
  });
  return crewRef.id; // 생성된 크루 ID 반환
};
//✅ 내가 속한 크루 목록 조회
export const loadMyCrews = async (userId) => {
  const q = query(collection(db, "crews"), where("members", "array-contains", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
//✅ 크루 초대(가입) 함수
export const joinCrew = async (crewId, userId) => {
  const crewRef = doc(db, "crews", crewId);
  await updateDoc(crewRef, {
    members: arrayUnion(userId),
  });
};
//✅ 크루 상세 정보 불러오기
export const getCrewDetail = async (crewId) => {
  const docRef = doc(db, "crews", crewId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  } else {
    return null;
  }
};
//❌ 크루 나가기
export const leaveCrew = async (crewId, userId) => {
  const crewRef = doc(db, "crews", crewId);
  await updateDoc(crewRef, {
    members: arrayRemove(userId),
  });
};
//🗑️ 크루 삭제 (ownerId 확인 후 삭제)
export const deleteCrew = async (crewId, currentUserId) => {
  const crewRef = doc(db, "crews", crewId);
  const crewSnap = await getDoc(crewRef);
  if (!crewSnap.exists()) return false;

  const crewData = crewSnap.data();
  if (crewData.ownerId !== currentUserId) {
    throw new Error("크루 삭제 권한이 없습니다.");
  }

  await deleteDoc(crewRef);
  return true;
};
//👥 크루 멤버 정보 조회 (users 컬렉션 참조)
export const getCrewMembers = async (memberIds) => {
  const usersRef = collection(db, "users");
  const results = [];

  // Firestore는 in 쿼리에 최대 10개까지만 허용
  const chunks = [];
  for (let i = 0; i < memberIds.length; i += 10) {
    chunks.push(memberIds.slice(i, i + 10));
  }

  for (const chunk of chunks) {
    const q = query(usersRef, where("uid", "in", chunk));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
  }

  return results;
};
//🆕 방 생성
export const createRoom = async (crewId, roomName, creatorId, creatorName) => {
  const roomRef = doc(collection(db, "crews", crewId, "rooms"));
  await setDoc(roomRef, {
    roomName,
    creatorId,
    creatorName,
    createdAt: serverTimestamp(),
    isOpen: true, // 공개 여부
    participants: [creatorId],
  });
  return roomRef.id;
};
//📋 특정 크루의 방 목록 불러오기
export const loadRoomsByCrew = async (crewId) => {
  const q = query(collection(db, "crews", crewId, "rooms"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
//👀 방 상세 정보 불러오기
export const getRoomDetail = async (crewId, roomId) => {
  const roomRef = doc(db, "crews", crewId, "rooms", roomId);
  const snapshot = await getDoc(roomRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  } else {
    return null;
  }
};
//🙋 방 입장 (참가자 추가)
export const joinRoom = async (crewId, roomId, userId) => {
  const roomRef = doc(db, "crews", crewId, "rooms", roomId);
  await updateDoc(roomRef, {
    participants: arrayUnion(userId),
  });
};
//🚪 방 나가기
export const leaveRoom = async (crewId, roomId, userId) => {
  const roomRef = doc(db, "crews", crewId, "rooms", roomId);
  await updateDoc(roomRef, {
    participants: arrayRemove(userId),
  });
};
//❌ 방 삭제 (생성자만 삭제 가능)
export const deleteRoom = async (crewId, roomId, currentUserId) => {
  const roomRef = doc(db, "crews", crewId, "rooms", roomId);
  const snapshot = await getDoc(roomRef);
  if (!snapshot.exists()) return false;

  const data = snapshot.data();
  if (data.creatorId !== currentUserId) {
    throw new Error("방 삭제 권한이 없습니다.");
  }

  await deleteDoc(roomRef);
  return true;
};
