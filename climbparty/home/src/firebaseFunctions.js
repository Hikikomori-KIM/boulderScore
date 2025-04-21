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
import {arrayUnion,arrayRemove } from "firebase/firestore";

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
  if (!snapshot.exists()) throw new Error("게시글이 존재하지 않습니다.");
  return { id: snapshot.id, ...snapshot.data() };
};
// ✅ 조회수 증가 + 중복 방지
export const increaseViewCount = async (postId, uid) => {
  const postRef = doc(db, "posts", postId);
  const snapshot = await getDoc(postRef);

  if (!snapshot.exists()) return;

  const post = snapshot.data();
  const alreadyViewed = post.viewedBy?.includes(uid);

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
};
// ✅ 댓글 불러오기 (최신순)
import { query, orderBy } from "firebase/firestore";

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
};