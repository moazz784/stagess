import { Link } from "react-router-dom";

export default function BrandLogo({ className = "" }) {
	return (
		<Link
			className={`brand ${className}`.trim()}
			to="/"
			aria-label="منصة كلية كمبيرج الدولية للدراسات المهنية، الصفحة الرئيسية"
		>
			<img className="brand-logo" src="/cambridge-college-logo.jpg" alt="" />
			<span className="brand-name">
				<span>منصة كلية كمبيرج الدولية</span>
				<span>للدراسات المهنية</span>
			</span>
		</Link>
	);
}
