import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5195/api",
	headers: { "Content-Type": "application/json" },
	timeout: 15000,
	withCredentials: true,
});

let accessToken = null;
let onSessionExpired = () => {};
let onSessionRefreshed = () => {};
let refreshRequest = null;

export function setAccessToken(token) {
	accessToken = token;
}

export function setSessionExpiredHandler(handler) {
	onSessionExpired = handler;
}

export function setSessionRefreshedHandler(handler) {
	onSessionRefreshed = handler;
}

export function refreshAuthSession() {
	refreshRequest ??= api.post("/auth/refresh")
		.then(({ data }) => {
			setAccessToken(data.accessToken);
			onSessionRefreshed(data);
			return data;
		})
		.catch((error) => {
			if (error.response?.status === 401) {
				setAccessToken(null);
				onSessionExpired();
			}
			return Promise.reject(error);
		})
		.finally(() => {
			refreshRequest = null;
		});
	return refreshRequest;
}

api.interceptors.request.use((config) => {
	if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const request = error.config;
		const isAuthRequest = request?.url?.includes("/auth/");
		if (error.response?.status !== 401 || !request || request._retry || isAuthRequest) {
			return Promise.reject(error);
		}

		request._retry = true;
		try {
			const data = await refreshAuthSession();
			request.headers.Authorization = `Bearer ${data.accessToken}`;
			return api(request);
		} catch (refreshError) {
			return Promise.reject(refreshError);
		}
	},
);

export function getApiError(error, fallback = "تعذّر إكمال الطلب. حاول مرة أخرى.") {
	const data = error?.response?.data;
	if (data?.errors) {
		const validationMessages = Object.values(data.errors).flat().filter(Boolean);
		if (validationMessages.length) return validationMessages.join(" ");
	}
	return data?.detail || data?.title || error?.message || fallback;
}

export default api;
