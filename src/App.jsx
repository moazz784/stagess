import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthGuard from "./auth/AuthGuard.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import SiteLayout from "./layouts/SiteLayout.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import CourseDetailsPage from "./pages/CourseDetailsPage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import InstructorPage from "./pages/InstructorPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";

function NotFoundPage() {
	return (
		<main className="container narrow-page">
			<div className="empty-state">
				<span className="eyebrow">404</span>
				<h1>عذرًا، لم نعثر على هذه الصفحة</h1>
				<p>قد يكون الرابط غير صحيح أو أن الصفحة لم تعد متاحة.</p>
				<a className="button button-primary" href="/">
					العودة إلى الرئيسية
				</a>
			</div>
		</main>
	);
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <SiteLayout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "courses", element: <CoursesPage /> },
			{ path: "courses/:courseId", element: <CourseDetailsPage /> },
			{ path: "about", element: <AboutPage /> },
			{ path: "contact", element: <ContactPage /> },
			{ path: "login", element: <LoginPage /> },
			{ path: "register", element: <RegisterPage /> },
			{ path: "instructor", element: <InstructorPage /> },
			{ path: "forgot-password", element: <ForgotPasswordPage /> },
			{ path: "verify-email", element: <VerifyEmailPage /> },
			{ path: "reset-password", element: <ResetPasswordPage /> },
			{ path: "student/dashboard", element: <AuthGuard roles={["Student"]}><DashboardPage /></AuthGuard> },
			{ path: "instructor/dashboard", element: <AuthGuard roles={["Instructor"]}><DashboardPage /></AuthGuard> },
			{ path: "admin/dashboard", element: <AuthGuard roles={["Admin"]}><DashboardPage /></AuthGuard> },
			{ path: "*", element: <NotFoundPage /> },
		],
	},
]);

export default function App() {
	return <AuthProvider><RouterProvider router={router} /></AuthProvider>;
}
