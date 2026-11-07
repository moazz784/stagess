import { useCallback, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import useEscapeKey from "../hooks/useEscapeKey.js";
import { getRoleHome, useAuth } from "../auth/useAuth.js";
import BrandLogo from "./BrandLogo.jsx";

const links = [
	{ to: "/", label: "الرئيسية", end: true },
	{ to: "/courses", label: "الدورات" },
	{ to: "/instructor", label: "للمدرّبين" },
	{ to: "/about", label: "من نحن" },
	{ to: "/contact", label: "تواصل معنا" },
];

export default function Navbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [logoutError, setLogoutError] = useState("");
	const { user, logout } = useAuth();
	const closeMenu = useCallback(() => setMenuOpen(false), []);
	useEscapeKey(closeMenu, menuOpen);

	async function handleLogout() {
		setLogoutError("");
		try {
			await logout();
			closeMenu();
		} catch {
			setLogoutError("تعذّر إكمال تسجيل الخروج من الخادم.");
		}
	}

	return (
		<header className="site-header">
			<div className="container nav-container">
				<BrandLogo />

				<button
					className="icon-button menu-toggle"
					type="button"
					aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen(!menuOpen)}
				>
					{menuOpen ? <X size={21} /> : <Menu size={21} />}
				</button>

				<nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="القائمة الرئيسية">
					{links.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							end={link.end}
							onClick={closeMenu}
							className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
						>
							{link.label}
						</NavLink>
					))}
					<div className="nav-actions">
						{user ? (
							<>
								<Link className="nav-login" to={getRoleHome(user)} onClick={closeMenu}>لوحة التحكم</Link>
								<button className="nav-logout" type="button" onClick={handleLogout}>تسجيل الخروج</button>
							</>
						) : (
							<>
								<Link className="nav-login" to="/login" onClick={closeMenu}>تسجيل الدخول</Link>
								<Link className="button button-primary button-small" to="/register" onClick={closeMenu}>ابدأ التعلّم</Link>
							</>
						)}
					</div>
					{logoutError && <p className="nav-error" role="alert">{logoutError}</p>}
				</nav>
			</div>
		</header>
	);
}
