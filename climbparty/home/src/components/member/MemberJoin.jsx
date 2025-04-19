import { useState } from "react";
import {
  registerUser,
  loginUser,
  sendVerificationEmail,
  googleLogin,
} from "../../firebaseFunctions";
import { useNavigate } from "react-router-dom";

export default function MemberJoin() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.name || !form.password || !form.confirmPassword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await registerUser(form.email, form.password, form.name);
      alert("📧 인증 메일이 전송되었습니다. 이메일을 확인해주세요.");
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        try {
          const userCredential = await loginUser(form.email, form.password);
          const user = userCredential.user;

          if (user.emailVerified) {
            alert("이미 가입된 이메일입니다. 로그인해주세요.");
            navigate("/login");
          } else {
            await sendVerificationEmail();
            alert(
              "이메일 인증이 완료되지 않은 계정입니다. 인증 메일을 다시 보냈습니다."
            );
            navigate("/login");
          }
        } catch (loginError) {
          alert(
            "이미 존재하는 이메일이지만 로그인할 수 없습니다. 비밀번호를 확인해주세요."
          );
        }
      } else {
        console.error("회원가입 오류:", error);
        alert("회원가입 실패: " + error.message);
      }
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
        {/* 왼쪽 - 회원가입 폼 */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="mb-4 text-center">회원가입</h2>
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
                  <label className="form-label">이름</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="form-control rounded-pill"
                    placeholder="이름 입력"
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
                <div className="mb-3">
                  <label className="form-label">비밀번호 확인</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="form-control rounded-pill"
                    placeholder="비밀번호 확인"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-pill mt-2"
                >
                  이메일로 회원가입
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
                구글 계정으로 회원가입
              </button>

              {/* 로그인 페이지 링크 */}
              <p className="mt-4 text-center">
                이미 계정이 있으신가요?{" "}
                <a
                  href="/login"
                  className="text-primary fw-semibold text-decoration-none"
                >
                  로그인
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 오른쪽 - 설명 영역 */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
          <div className="text-center px-4">
            <h1 className="display-5 fw-bold">Welcome to</h1>
            <h1 className="display-4 text-primary">Bouldering Party 🎉</h1>
            <p className="mt-3 fs-5">이메일 인증 후 로그인이 가능합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
