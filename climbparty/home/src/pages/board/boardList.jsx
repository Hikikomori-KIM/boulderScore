// 📁 src/components/board/BoardList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadPosts } from "../../firebaseFunctions";

export default function BoardList() {
  const [posts, setPosts] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await loadPosts();
      const sorted = data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(sorted);
    };
    fetchPosts();
  }, []);

  const handleChangeItemsPerPage = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(search.toLowerCase()) ||
      post.content?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="container py-4" style={{ maxWidth: "800px" }}>
      {/* 상단 영역 */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="mb-0">📋 자유게시판</h4>

        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="제목 또는 내용을 검색하세요"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "200px", borderRadius: "20px" }}
          />

          <select
            className="form-select form-select-sm"
            style={{ width: "120px" }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">전체</option>
            <option value="자유">자유</option>
            <option value="후기">후기</option>
            <option value="홍보">홍보</option>
          </select>

          <Link to="/board/new" className="btn btn-outline-primary btn-sm">
            + 글쓰기
          </Link>
        </div>
      </div>

      {/* 게시글 리스트 */}
      <ul className="list-group mb-2">
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
              {typeof post.commentCount === "number" && (
                <span className="text-muted ms-2" style={{ fontSize: "0.85rem" }}>
                  💬 {post.commentCount}
                </span>
              )}
            </Link>
            <div
              className="text-muted text-end"
              style={{ fontSize: "0.85rem", minWidth: "130px" }}
            >
              <span className="text-danger fw-bold">♥</span> {post.likes} | 🐾 {post.views}
              <br />
              {post.author} | {post.createdAt?.toDate?.().toLocaleDateString?.()}
            </div>
          </li>
        ))}
      </ul>

      {/* 리스트 수 + 페이지네이터 */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <select
          className="form-select form-select-sm"
          style={{ width: "90px" }}
          value={itemsPerPage}
          onChange={handleChangeItemsPerPage}
        >
          <option value="10">10개</option>
          <option value="20">20개</option>
          <option value="50">50개</option>
        </select>

        <nav>
          <ul className="pagination pagination-sm mb-0">
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
