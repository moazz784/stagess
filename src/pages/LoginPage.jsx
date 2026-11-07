import { useState } from "react";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getRoleHome, useAuth } from "../auth/useAuth.js";
import api, { getApiError } from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function LoginPage() {
	const location = useLocation();
	const [notice, setNotice] = useState(() => location.state?.authNotice || "");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const { login, user, authError } = useAuth();
	const navigate = useNavigate();

	if (user) return <Navigate to={getRoleHome(user)} replace />;

	async function submitLogin(event) {
		event.preventDefault();
		setLoading(true);
		setError("");
		setNotice("");
		try {
			const form = new FormData(event.currentTarget);
			const authenticatedUser = await login({
				email,
				password: form.get("password"),
			});
			navigate(getRoleHome(authenticatedUser), { replace: true });
		} catch (requestError) {
			setError(getApiError(requestError, "تعذّر تسجيل الدخول."));
		} finally {
			setLoading(false);
		}
	}

	async function resendVerification() {
		setError("");
		setNotice("");
		try {
			await api.post("/auth/resend-confirmation", { email });
			setNotice("إذا كان الحساب بحاجة إلى التفعيل، فستصل تعليمات التأكيد إلى بريدك.");
		} catch (requestError) {
			setError(getApiError(requestError));
		}
	}

	return (
		<main className="auth-page">
			<div className="auth-decor auth-decor-one" /><div className="auth-decor auth-decor-two" />
			<section className="auth-card">
				<BrandLogo className="auth-brand" />
				<span className="eyebrow">مرحبًا بعودتك</span><h1>سجّل الدخول إلى حسابك</h1><p className="auth-intro">تابع رحلتك التعليمية واكتشف ما ينتظرك.</p>
				<form className="form-stack" onSubmit={submitLogin}>
					<label>البريد الإلكتروني<span className="input-icon"><Mail size={17} /><input type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" placeholder="name@example.com" /></span></label>
					<label>كلمة المرور<span className="input-icon"><LockKeyhole size={17} /><input type="password" name="password" autoComplete="current-password" required placeholder="أدخل كلمة المرور" /></span></label>
					<div className="form-inline"><span /> <Link to="/forgot-password">نسيت كلمة المرور؟</Link></div>
					<button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"} {!loading && <ArrowLeft size={17} />}</button>
					{authError && <p className="form-notice" role="alert">{authError}</p>}
					{error && <p className="form-notice" role="alert">{error}</p>}
					{notice && <p className="form-notice" role="status">{notice}</p>}
				</form>
				<button className="auth-inline-button" type="button" disabled={!email || loading} onClick={resendVerification}>إعادة إرسال تأكيد البريد</button>
				<p className="auth-switch">ليس لديك حساب؟ <Link to="/register">أنشئ حسابًا جديدًا</Link></p>
				<p className="auth-footnote">تسجيل الدخول يتطلب تأكيد البريد الإلكتروني.</p>
			</section>
		</main>
	);
}
