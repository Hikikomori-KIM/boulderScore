import { useState } from "react";
import { loginUser, googleLogin } from "../../firebaseFunctions";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

export default function MemberLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await loginUser(form.email, form.password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("📩 이메일 인증 후 사용해주세요.");
        const auth = getAuth();
        await signOut(auth);
        return;
      }

      alert("🎉 로그인 성공!");
      navigate("/");
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("❌ 로그인 실패: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      alert(`🎉 환영합니다, ${user.displayName || "구글 사용자"}님!`);
      navigate("/");
    } catch (error) {
      alert("❌ Google 로그인 실패: " + error.message);
    }
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* 왼쪽 - 로그인 폼 */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="mb-4 text-center">로그인</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">이메일</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control rounded-pill"
                    placeholder="이메일 입력"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">비밀번호</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control rounded-pill"
                    placeholder="비밀번호 입력"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 rounded-pill mt-2">
                  이메일로 로그인
                </button>
              </form>

              {/* 구분선 */}
              <div className="text-center my-3 text-muted">
                <hr />
                <small>또는</small>
              </div>

              {/* 구글 로그인 버튼 */}
              <button
                onClick={handleGoogleLogin}
                className="btn btn-light border w-100 rounded-pill d-flex align-items-center justify-content-center"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  width="20"
                  className="me-2"
                />
                구글 계정으로 로그인
              </button>

              {/* 회원가입 링크 */}
              <p className="mt-4 text-center">
                아직 계정이 없으신가요?{" "}
                <a href="/join" className="text-primary fw-semibold text-decoration-none">
                  회원가입
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 오른쪽 - Welcoming Message */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
          <div className="text-center px-4">
            <h1 className="display-5 fw-bold">Welcome to</h1>
            <h1 className="display-4 text-primary">Bouldering Party 🎉</h1>
            <p className="mt-3 fs-5">지금 바로 로그인하고 클라이밍 파티에 참여하세요!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
