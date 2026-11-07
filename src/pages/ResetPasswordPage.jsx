import { useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { getApiError } from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function ResetPasswordPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function resetPassword(event) {
		event.preventDefault();
		setNotice("");
		setError("");
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		const newPassword = form.get("newPassword");
		if (newPassword !== form.get("confirmPassword")) {
			setError("كلمتا المرور غير متطابقتين.");
			return;
		}

		setLoading(true);
		try {
			await api.post("/auth/reset-password", {
				email: searchParams.get("email"),
				token: searchParams.get("token"),
				newPassword,
			});
			navigate("/login", {
				replace: true,
				state: { authNotice: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول بكلمة المرور الجديدة." },
			});
		} catch (requestError) {
			setError(getApiError(requestError, "تعذّر تغيير كلمة المرور."));
		} finally {
			setLoading(false);
		}
	}

	const hasResetToken = searchParams.has("email") && searchParams.has("token");

	return (
		<main className="auth-page">
			<section className="auth-card">
				<BrandLogo className="auth-brand" />
				<span className="eyebrow">استعادة الحساب</span><h1>اختر كلمة مرور جديدة</h1>
				<p className="auth-intro">أدخل كلمة مرور جديدة لحسابك.</p>
				<form className="form-stack" onSubmit={resetPassword}>
					<label>كلمة المرور الجديدة<span className="input-icon"><LockKeyhole size={17} /><input type="password" name="newPassword" required minLength="8" maxLength="128" autoComplete="new-password" placeholder="٨ أحرف مع حرف كبير ورقم" /></span></label>
					<label>تأكيد كلمة المرور<span className="input-icon"><LockKeyhole size={17} /><input type="password" name="confirmPassword" required minLength="8" maxLength="128" autoComplete="new-password" placeholder="أعد كتابة كلمة المرور" /></span></label>
					<button className="button button-primary button-wide" type="submit" disabled={loading || !hasResetToken}>{loading ? "جارٍ الحفظ..." : "تغيير كلمة المرور"} {!loading && <ArrowLeft size={17} />}</button>
					{!hasResetToken && <p className="form-notice" role="alert">رابط الاستعادة غير مكتمل. اطلب رابطًا جديدًا.</p>}
					{error && <p className="form-notice" role="alert">{error}</p>}
					{notice && <p className="form-notice" role="status">{notice}</p>}
				</form>
				<Link className="auth-back" to="/login">العودة إلى تسجيل الدخول</Link>
			</section>
		</main>
	);
}
