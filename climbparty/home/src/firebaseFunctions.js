import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  getDoc,
  addDoc,
  updateDoc,
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
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

/**
 * ✅ 회원가입: 사용자 등록 + Firestore 저장 + 인증 메일 발송 후 로그아웃
 */
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
  });

  await sendEmailVerification(user);
  await signOut(auth);
};

/**
 * ✅ 로그인: 자동 로그인 유지 + Firebase Auth 객체 반환
 */
export const loginUser = async (email, password) => {
  await setPersistence(auth, browserLocalPersistence);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
};

/**
 * ✅ 비밀번호 재설정
 */
export const resetPassword = (email) => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * ✅ 인증 메일 재발송
 */
export const sendVerificationEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error("현재 로그인된 사용자가 없습니다.");
  }
};

/**
 * ✅ 로그인 후 역할 불러오기
 */
export const getUserRole = async (uid) => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data().role : null;
};

/**
 * ✅ 구글 로그인 + Firestore 사용자 등록
 */
export const googleLogin = async () => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    // Firestore에 유저 정보가 없을 때만 저장
    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "이름 없음",
        role: "user",
        createdAt: new Date(),
      });
    }

    console.log("✅ Google 로그인 성공:", user);
    return user;
  } catch (error) {
    console.error("❌ Google 로그인 실패:", error);
    throw error;
  }
};

/**
 * ✅ 참가자 관련 Firestore 함수들
 */
export const saveMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  await setDoc(docRef, member);
};

export const loadMembers = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const deleteMember = async (memberId) => {
  const docRef = doc(db, "members", String(memberId));
  await deleteDoc(docRef);
};

export const updateMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  await setDoc(docRef, member);
};

/**
 * ✅ 암장 관련
 */

// 암장 목록 불러오기
export const loadGyms = async () => {
  const snapshot = await getDocs(collection(db, "gyms"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// 특정 암장의 테이프만 불러오기
export const loadGymTapes = async (gymId) => {
  const gymRef = doc(db, "gyms", gymId);
  const snapshot = await getDoc(gymRef);
  if (!snapshot.exists()) return [];
  return snapshot.data().tapes || [];
};

// 테이프 추가
export const addTapeToGym = async (gymId, tapeName) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  if (!snapshot.exists()) return;

  const gymData = snapshot.data();
  const updatedTapes = [...(gymData.tapes || []), tapeName];
  await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
};

// 테이프 삭제
export const deleteTapeFromGym = async (gymId, tapeToDelete) => {
  const snapshot = await getDoc(doc(db, "gyms", gymId));
  if (!snapshot.exists()) return;

  const gymData = snapshot.data();
  const updatedTapes = gymData.tapes.filter((t) => t !== tapeToDelete);
  await updateDoc(doc(db, "gyms", gymId), { tapes: updatedTapes });
};

/**
 * ✅ 파티 관련
 */

// 파티 저장
export const saveParty = async ({ name, gymId, scores }) => {
  return await addDoc(collection(db, "parties"), {
    name,
    gymId,
    scores,
  });
};

// 파티 목록 불러오기 (팀 점수 셀렉트 박스용)
export const loadParties = async () => {
  const snapshot = await getDocs(collection(db, "parties"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
