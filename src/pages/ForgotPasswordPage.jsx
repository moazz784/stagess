import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import api, { getApiError } from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function ForgotPasswordPage() {
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function requestReset(event) {
		event.preventDefault();
		setError("");
		setNotice("");
		setLoading(true);
		const email = new FormData(event.currentTarget).get("email");
		try {
			const { data } = await api.post("/auth/forgot-password", { email });
			setNotice(data.message);
		} catch (requestError) {
			setError(getApiError(requestError));
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="auth-page">
			<div className="auth-decor auth-decor-one" /><div className="auth-decor auth-decor-two" />
			<section className="auth-card">
				<BrandLogo className="auth-brand" />
				<span className="eyebrow">استعادة الحساب</span><h1>نسيت كلمة المرور؟</h1><p className="auth-intro">أدخل البريد الإلكتروني المرتبط بحسابك. سنساعدك على استعادة الوصول عند تفعيل الخدمة.</p>
				<form className="form-stack" onSubmit={requestReset}>
					<label>البريد الإلكتروني<span className="input-icon"><Mail size={17} /><input type="email" name="email" required dir="ltr" autoComplete="email" placeholder="name@example.com" /></span></label>
					<button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? "جارٍ الإرسال..." : "إرسال تعليمات الاستعادة"} {!loading && <ArrowLeft size={17} />}</button>
					{error && <p className="form-notice" role="alert">{error}</p>}
					{notice && <p className="form-notice" role="status">{notice}</p>}
				</form>
				<Link className="auth-back" to="/login"><ArrowRight size={16} /> العودة إلى تسجيل الدخول</Link>
				<p className="auth-footnote">إذا كان البريد مسجّلًا ومفعّلًا، فستصلك تعليمات الاستعادة.</p>
			</section>
		</main>
	);
}
