import { Outlet, ScrollRestoration } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

export default function SiteLayout() {
	return (
		<>
			<ScrollRestoration />
			<Navbar />
			<Outlet />
			<Footer />
		</>
	);
}
