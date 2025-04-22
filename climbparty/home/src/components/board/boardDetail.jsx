import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // 상단에 import
import {
  loadPostById,
  toggleLikePost,
  increaseViewCount,
  deletePost,
  addComment,
  getComments,
  deleteComment,
} from "../../firebaseFunctions";
import { useAuth } from "../AuthContext";

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    const data = await getComments(post.id);
    setComments(data);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!newComment.trim()) return;

    await addComment(post.id, {
      content: newComment,
      author: user.displayName || "익명",
      authorId: user.uid,
    });

    setNewComment("");
    fetchComments();
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await loadPostById(id);
        console.log("✅ 게시글 로딩 성공", data);
        setPost(data);

        if (user && data) {
          try {
            // 🔐 방어적으로 uid 체크
            if (user.uid) {
              await increaseViewCount(id, user.uid);
            }

            // 🛡️ likedBy가 undefined일 수 있으므로 []로 기본값 처리
            const likedByList = Array.isArray(data.likedBy) ? data.likedBy : [];
            setLiked(likedByList.includes(user.uid));
          } catch (innerErr) {
            console.warn("⚠️ 조회수 증가 또는 좋아요 여부 확인 실패", innerErr);
          }
        }
      } catch (error) {
        console.error("❌ 게시글 로딩 실패", error);
        alert("존재하지 않는 게시글입니다.");
        navigate("/board/list");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, navigate]);


  useEffect(() => {
    if (post) fetchComments();
  }, [post]);

  const handleDelete = async () => {
    const confirm = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      await deletePost(post.id);
      alert("삭제가 완료되었습니다.");
      navigate("/board/list");
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const result = await toggleLikePost(post.id, user.uid);
      if (result?.liked) {
        setPost({ ...post, likes: post.likes + 1 });
        setLiked(true);
      } else {
        setPost({ ...post, likes: post.likes - 1 });
        setLiked(false);
      }
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  if (loading) return <div className="container py-5">로딩 중...</div>;
  if (!post) return null;

  return (
    <div className="container py-5" style={{ maxWidth: "720px" }}>
      <h5 className="mb-1">[ {post.category} ] {post.title}</h5>
      <div className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
        {post.author} | {post.createdAt?.toDate?.().toLocaleDateString?.()} |
        <span className="ms-2 text-danger fw-bold">♥</span> {post.likes} |
        🐾 {post.views}
      </div>

      <div className="mb-4" style={{ whiteSpace: "pre-line" }}>
        {post.content}
      </div>

      {post.category === "홍보" && post.linkedProjectId && (
        <button className="btn btn-outline-success btn-sm mb-4" disabled>
          🎉 이 프로젝트에 초대받았습니다 (현재 비활성화)
        </button>
      )}

      <div className="d-flex justify-content-end gap-2">
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={handleLike}
          style={{ backgroundColor: "white", boxShadow: "none" }}
        >
          {liked ? "♥ 좋아요" : "♡ 좋아요"} ({post.likes})
        </button>

        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => navigate(`/board/${post.id}/edit`)}
        >
          수정
        </button>

        <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
          삭제
        </button>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/board/list")}
        >
          목록
        </button>
      </div>

      <hr className="my-4" />
      <h6 className="fw-bold mb-3">💬 댓글</h6>

      {/* 댓글 입력 */}
      <form onSubmit={handleCommentSubmit} className="mb-4 d-flex flex-column gap-2">
        <textarea
          className="form-control"
          rows={3}
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button className="btn btn-outline-primary btn-sm align-self-end" type="submit">
          등록
        </button>
      </form>

      {/* 댓글 목록 */}
      <ul className="list-group">
        {comments.length === 0 && (
          <li className="list-group-item text-muted">아직 댓글이 없습니다.</li>
        )}

        {comments.map((c) => (
          <li
            key={c.id}
            className="list-group-item d-flex justify-content-between align-items-start"
          >
            <div className="flex-grow-1">
              <div className="fw-semibold">{c.author}</div>
              <div style={{ whiteSpace: "pre-line" }}>{c.content}</div>
              <small className="text-muted">
                {c.createdAt?.toDate?.().toLocaleDateString?.()}
              </small>
            </div>

            {/* ✅ 본인 댓글일 경우 삭제 버튼 표시 */}
            {user?.uid === c.authorId && (
              <button
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={async () => {
                  const ok = window.confirm("댓글을 삭제할까요?");
                  if (ok) {
                    await deleteComment(post.id, c.id);
                    fetchComments();
                    toast.success("댓글이 삭제되었습니다 🗑️");
                  }
                }}
              >
                삭제
              </button>
            )}
          </li>
        ))}
      </ul>

    </div>
  );
}
