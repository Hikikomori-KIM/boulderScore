// components/BoardList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// 더미 데이터
const dummyPosts = [
  {
    id: "1",
    category: "후기",
    title: "2주년 볼파 같이 가실 분~",
    author: "아이유",
    createdAt: "2025.04.20",
    views: 132,
    likes: 12,
  },
  {
    id: "2",
    category: "자유",
    title: "김성범 잘생겼다!!",
    author: "츄",
    createdAt: "2025.04.19",
    views: 87,
    likes: 4,
  },
  {
    id: "3",
    category: "홍보",
    title: "6월 6일 SSS 볼파 초대해요!",
    author: "성현",
    createdAt: "2025.04.18",
    views: 210,
    likes: 23,
  },
  // 더 추가 가능
];

export default function BoardList() {
  const [posts, setPosts] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPosts(dummyPosts);
  }, []);

  const totalPages = Math.ceil(posts.length / itemsPerPage);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChangeItemsPerPage = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // reset page
  };

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      {/* 상단 헤더 + 옵션 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">📋 자유게시판</h4>

        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            style={{ width: "90px" }}
            value={itemsPerPage}
            onChange={handleChangeItemsPerPage}
          >
            <option value="10">10개씩</option>
            <option value="20">20개씩</option>
            <option value="50">50개씩</option>
          </select>

          <Link to="/board/new" className="btn btn-primary btn-sm">
            + 글쓰기
          </Link>
        </div>
      </div>

      {/* 게시글 리스트 */}
      <ul className="list-group">
        {paginatedPosts.map((post) => (
          <li
            key={post.id}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <Link
              to={`/board/${post.id}`}
              className="text-decoration-none text-dark flex-grow-1"
            >
              [ {post.category} ] {post.title}
            </Link>
            <div
              className="text-muted text-end"
              style={{ fontSize: "0.85rem", minWidth: "130px" }}
            >
              <span className="text-danger fw-bold">♥</span> {post.likes} | 🐾{" "}
              {post.views}
              <br />
              {post.author} | {post.createdAt}
            </div>
          </li>
        ))}
      </ul>

      {/* 페이지네이터 */}
      <nav className="mt-4 d-flex justify-content-center">
        <ul className="pagination pagination-sm mb-0">
          {Array.from({ length: totalPages }, (_, i) => (
            <li
              key={i}
              className={`page-item ${
                currentPage === i + 1 ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
