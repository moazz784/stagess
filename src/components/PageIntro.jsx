export default function PageIntro({ eyebrow, title, description, compact = false }) {
	return (
		<section className={`page-intro${compact ? " page-intro-compact" : ""}`}>
			<div className="container page-intro-content">
				<span className="eyebrow eyebrow-gold">{eyebrow}</span>
				<h1>{title}</h1>
				<p>{description}</p>
			</div>
		</section>
	);
}
