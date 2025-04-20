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
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

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
    agreed: false, // 기본값 false
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
  await setDoc(docRef, member);
};

// ✅ 참가자 불러오기
export const loadMembers = async () => {
  const snapshot = await getDocs(collection(db, "members"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// ✅ 참가자 삭제
export const deleteMember = async (memberId) => {
  const docRef = doc(db, "members", String(memberId));
  await deleteDoc(docRef);
};

// ✅ 참가자 수정
export const updateMember = async (member) => {
  const docRef = doc(db, "members", String(member.id));
  await setDoc(docRef, member);
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
