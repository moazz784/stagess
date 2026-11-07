import { Navigate, useLocation } from "react-router-dom";
import { getRoleHome, useAuth } from "./useAuth.js";

export default function AuthGuard({ roles, children }) {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) {
		return <main className="container narrow-page"><div className="empty-state" role="status">جارٍ التحقق من الجلسة...</div></main>;
	}
	if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
	if (roles && !roles.some((role) => user.roles.includes(role))) {
		return <Navigate to={getRoleHome(user)} replace />;
	}
	return children;
}
