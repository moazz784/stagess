import { useCallback, useEffect, useMemo, useState } from "react";
import AuthContext from "./authState.js";
import api, { refreshAuthSession, setAccessToken, setSessionExpiredHandler, setSessionRefreshedHandler } from "../services/api.js";

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [authError, setAuthError] = useState("");

	const applySession = useCallback((session) => {
		setAccessToken(session.accessToken);
		setUser(session.user);
		setAuthError("");
	}, []);

	useEffect(() => {
		setSessionExpiredHandler(() => setUser(null));
		setSessionRefreshedHandler((session) => setUser(session.user));
		let active = true;

		refreshAuthSession()
			.then((session) => {
				if (active) applySession(session);
			})
			.catch((error) => {
				if (active && error.response?.status !== 401) {
					setAuthError("تعذّر الاتصال بخدمة الحسابات. تحقق من تشغيل الخادم ثم أعد المحاولة.");
				}
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});

		return () => {
			active = false;
			setSessionExpiredHandler(() => {});
			setSessionRefreshedHandler(() => {});
		};
	}, [applySession]);

	const login = useCallback(async (credentials) => {
		const { data } = await api.post("/auth/login", credentials);
		applySession(data);
		return data.user;
	}, [applySession]);

	const register = useCallback(async (details) => {
		const { data } = await api.post("/auth/register", details);
		return data;
	}, []);

	const logout = useCallback(async () => {
		try {
			await api.post("/auth/logout");
		} finally {
			setAccessToken(null);
			setUser(null);
		}
	}, []);

	const value = useMemo(() => ({
		user,
		isLoading,
		authError,
		login,
		register,
		logout,
	}), [user, isLoading, authError, login, register, logout]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
