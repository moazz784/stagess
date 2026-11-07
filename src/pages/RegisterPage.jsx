import { useState } from "react";
import { ArrowLeft, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { getRoleHome, useAuth } from "../auth/useAuth.js";
import { getApiError } from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function RegisterPage() {
	const [notice, setNotice] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");
	const { register, user } = useAuth();

	if (user) return <Navigate to={getRoleHome(user)} replace />;

	async function submitRegistration(event) {
		event.preventDefault();
		setNotice("");
		setError("");
		setLoading(true);
		const formElement = event.currentTarget;
		const form = new FormData(formElement);
		try {
			await register({
				fullName: form.get("fullName"),
				email,
				password: form.get("password"),
			});
			setNotice("تم إنشاء الحساب. تحقّق من بريدك الإلكتروني لتأكيده قبل تسجيل الدخول.");
			formElement.reset();
			setEmail("");
		} catch (requestError) {
			setError(getApiError(requestError, "تعذّر إنشاء الحساب."));
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="auth-page">
			<div className="auth-decor auth-decor-one" /><div className="auth-decor auth-decor-two" />
			<section className="auth-card">
				<BrandLogo className="auth-brand" />
				<span className="eyebrow">أهلاً بطموحك</span><h1>ابدأ رحلتك مع الكلية</h1><p className="auth-intro">أنشئ حساب متعلّم واكتشف مسارات تناسب أهدافك.</p>
				<form className="form-stack" onSubmit={submitRegistration}>
					<label>الاسم الكامل<span className="input-icon"><UserRound size={17} /><input name="fullName" required minLength="2" maxLength="120" autoComplete="name" placeholder="اكتب اسمك الكامل" /></span></label>
					<label>البريد الإلكتروني<span className="input-icon"><Mail size={17} /><input name="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" placeholder="name@example.com" /></span></label>
					<label>كلمة المرور<span className="input-icon"><LockKeyhole size={17} /><input name="password" type="password" required minLength="8" maxLength="128" autoComplete="new-password" placeholder="٨ أحرف، مع حرف كبير ورقم" /></span></label>
					<button className="button button-primary button-wide" type="submit" disabled={loading}>{loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب متعلّم"} {!loading && <ArrowLeft size={17} />}</button>
					{error && <p className="form-notice" role="alert">{error}</p>}
					{notice && <p className="form-notice" role="status">{notice}</p>}
				</form>
				<p className="auth-switch">لديك حساب بالفعل؟ <Link to="/login">سجّل الدخول</Link></p>
				<p className="auth-footnote">سيُنشأ حساب متعلّم، ويتطلب تفعيل البريد الإلكتروني قبل تسجيل الدخول.</p>
			</section>
		</main>
	);
}
