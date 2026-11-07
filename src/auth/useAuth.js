import { useContext } from "react";
import AuthContext from "./authState.js";

export function getRoleHome(user) {
	if (user?.roles?.includes("Admin")) return "/admin/dashboard";
	if (user?.roles?.includes("Instructor")) return "/instructor/dashboard";
	return "/student/dashboard";
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider.");
	return context;
}
