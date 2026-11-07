import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { getApiError } from "../services/api.js";
import BrandLogo from "../components/BrandLogo.jsx";

export default function VerifyEmailPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function verify(event) {
		event.preventDefault();
		setLoading(true);
		setError("");
		try {
			await api.post("/auth/confirm-email", {
				userId: searchParams.get("userId"),
				token: searchParams.get("token"),
			});
			navigate("/login", {
				replace: true,
				state: { authNotice: "تم تأكيد بريدك الإلكتروني. يمكنك الآن تسجيل الدخول." },
			});
		} catch (requestError) {
			setError(getApiError(requestError, "تعذّر تأكيد البريد الإلكتروني."));
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="auth-page">
			<section className="auth-card">
				<BrandLogo className="auth-brand" />
				<span className="eyebrow">تأكيد الحساب</span><h1>تحقّق من بريدك الإلكتروني</h1>
				<p className="auth-intro">استخدم الرابط الذي وصلك عبر البريد لتفعيل حسابك.</p>
				<form className="form-stack" onSubmit={verify}>
					<button className="button button-primary button-wide" type="submit" disabled={loading || !searchParams.get("userId") || !searchParams.get("token")}>{loading ? "جارٍ التأكيد..." : "تأكيد البريد"} {!loading && <ArrowLeft size={17} />}</button>
					{error && <p className="form-notice" role="alert">{error}</p>}
				</form>
				<Link className="auth-back" to="/login">الانتقال إلى تسجيل الدخول</Link>
			</section>
		</main>
	);
}
