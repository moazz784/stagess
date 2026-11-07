import { useCallback, useEffect, useState } from "react";
import { LogOut, Save, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.js";
import PageIntro from "../components/PageIntro.jsx";
import api, { getApiError } from "../services/api.js";

async function loadDashboardData(dashboardPath, profilePath, role, adminPage) {
	const [dashboardResponse, profileResponse] = await Promise.all([
		api.get(dashboardPath),
		role === "Student" || role === "Instructor" ? api.get(profilePath) : Promise.resolve(null),
	]);
	const adminResponse = role === "Admin"
		? await api.get(`/admin/users?page=${adminPage}&pageSize=25`)
		: null;

	return {
		dashboard: dashboardResponse.data,
		profile: profileResponse?.data || null,
		adminUsers: adminResponse?.data.items || [],
		adminTotal: adminResponse?.data.totalCount || 0,
	};
}

export default function DashboardPage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const role = user.roles[0];
	const dashboardPath = role === "Admin" ? "/admin/dashboard" : role === "Instructor" ? "/instructor/dashboard" : "/student/dashboard";
	const profilePath = role === "Instructor" ? "/instructor/profile" : "/student/profile";
	const [dashboard, setDashboard] = useState(null);
	const [profile, setProfile] = useState(null);
	const [adminUsers, setAdminUsers] = useState([]);
	const [adminPage, setAdminPage] = useState(1);
	const [adminTotal, setAdminTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const applyDashboardData = useCallback((data) => {
		setDashboard(data.dashboard);
		setProfile(data.profile);
		setAdminUsers(data.adminUsers);
		setAdminTotal(data.adminTotal);
	}, []);

	useEffect(() => {
		let active = true;
		loadDashboardData(dashboardPath, profilePath, role, adminPage)
			.then((data) => {
				if (active) applyDashboardData(data);
			})
			.catch((requestError) => {
				if (active) setError(getApiError(requestError));
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => { active = false; };
	}, [adminPage, applyDashboardData, dashboardPath, profilePath, role]);

	async function reloadDashboard() {
		setLoading(true);
		setError("");
		try {
			applyDashboardData(await loadDashboardData(dashboardPath, profilePath, role, adminPage));
		} catch (requestError) {
			setError(getApiError(requestError));
		} finally {
			setLoading(false);
		}
	}

	async function saveProfile(event) {
		event.preventDefault();
		setSaving(true);
		setError("");
		setNotice("");
		const form = new FormData(event.currentTarget);
		const update = {
			displayName: form.get("displayName"),
			bio: form.get("bio") || null,
		};
		if (role === "Instructor") update.expertise = form.get("expertise") || null;
		try {
			const { data } = await api.put(profilePath, update);
			setProfile(data);
			setNotice("تم حفظ ملفك الشخصي.");
		} catch (requestError) {
			setError(getApiError(requestError));
		} finally {
			setSaving(false);
		}
	}

	async function assignRole(targetUserId, roleName) {
		setError("");
		try {
			await api.put(`/admin/users/${targetUserId}/role`, { role: roleName });
			await reloadDashboard();
		} catch (requestError) {
			setError(getApiError(requestError));
		}
	}

	async function setUserActive(targetUserId, isActive) {
		setError("");
		try {
			await api.put(`/admin/users/${targetUserId}/active`, { isActive });
			await reloadDashboard();
		} catch (requestError) {
			setError(getApiError(requestError));
		}
	}

	async function signOut() {
		try {
			await logout();
			navigate("/login", { replace: true });
		} catch (requestError) {
			setError(getApiError(requestError, "تعذّر إكمال تسجيل الخروج من الخادم."));
		}
	}

	return (
		<main>
			<PageIntro eyebrow={`مساحة ${role}`} title={`مرحبًا ${user.fullName}`} description={dashboard?.message || "إدارة حسابك ومساحتك التعليمية."} />
			<section className="section">
				<div className="container dashboard-content">
					{loading && <p role="status">جارٍ تحميل بيانات حسابك...</p>}
					{error && <p className="form-notice" role="alert">{error}</p>}
					{notice && <p className="form-notice" role="status">{notice}</p>}
					<div className="dashboard-toolbar">
						<p><ShieldCheck size={18} /> صلاحيتك الحالية: <strong>{role}</strong></p>
						<button className="button button-outline" type="button" onClick={signOut}>تسجيل الخروج <LogOut size={17} /></button>
					</div>

					{profile && (
						<form className="dashboard-panel form-stack" onSubmit={saveProfile}>
							<h2>ملفي الشخصي</h2>
							<label>الاسم المعروض<input name="displayName" required minLength="2" maxLength="120" defaultValue={profile.displayName} /></label>
							<label>نبذة<textarea name="bio" rows="4" maxLength={role === "Instructor" ? 2000 : 1000} defaultValue={profile.bio || ""} /></label>
							{role === "Instructor" && <label>مجالات الخبرة<input name="expertise" maxLength="500" defaultValue={profile.expertise || ""} /></label>}
							<button className="button button-primary" type="submit" disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ التعديلات"} <Save size={16} /></button>
						</form>
					)}

					{role === "Admin" && (
						<section className="dashboard-panel">
							<h2>إدارة المستخدمين</h2>
							<p>تغيير الدور أو تفعيل الحساب متاح للمسؤولين فقط.</p>
							<div className="admin-users-list">
								{adminUsers.map((adminUser) => (
									<article className="admin-user-row" key={adminUser.id}>
										<div><strong>{adminUser.fullName}</strong><span dir="ltr">{adminUser.email}</span><small>{adminUser.roles.join(", ")} · {adminUser.isActive ? "نشط" : "موقوف"}</small></div>
										<label>الدور<select value={adminUser.roles[0] || "Student"} onChange={(event) => assignRole(adminUser.id, event.target.value)}>
											<option value="Student">Student</option><option value="Instructor">Instructor</option><option value="Admin">Admin</option>
										</select></label>
										<button className="button button-outline button-small" type="button" disabled={adminUser.id === user.id} onClick={() => setUserActive(adminUser.id, !adminUser.isActive)}>{adminUser.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}</button>
									</article>
								))}
								{!adminUsers.length && !loading && <p>لا يوجد مستخدمون لعرضهم.</p>}
							</div>
							<div className="admin-pagination">
								<button className="button button-outline button-small" type="button" disabled={adminPage <= 1} onClick={() => setAdminPage(adminPage - 1)}>السابق</button>
								<span>صفحة {adminPage} من {Math.max(1, Math.ceil(adminTotal / 25))}</span>
								<button className="button button-outline button-small" type="button" disabled={adminPage * 25 >= adminTotal} onClick={() => setAdminPage(adminPage + 1)}>التالي</button>
							</div>
						</section>
					)}

					{role === "Student" && <Link className="text-link" to="/courses">متابعة استكشاف الدورات ←</Link>}
				</div>
			</section>
		</main>
	);
}
