import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/CourseCard.jsx";
import PageIntro from "../components/PageIntro.jsx";
import { categories, courses } from "../data/courses.js";

const PAGE_SIZE = 6;

export default function CoursesPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [query, setQuery] = useState(searchParams.get("q") || "");
	const [category, setCategory] = useState(searchParams.get("category") || "");
	const [price, setPrice] = useState("all");
	const [sort, setSort] = useState("featured");
	const [page, setPage] = useState(1);

	const filteredCourses = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase("ar");
		const result = courses.filter((course) => {
			const matchesQuery = !normalizedQuery || `${course.title} ${course.category} ${course.instructor}`.toLocaleLowerCase("ar").includes(normalizedQuery);
			const matchesCategory = !category || course.category === category;
			const matchesPrice = price === "all" || (price === "low" ? course.price < 300 : course.price >= 300);
			return matchesQuery && matchesCategory && matchesPrice;
		});
		if (sort === "price-low") result.sort((first, second) => first.price - second.price);
		if (sort === "price-high") result.sort((first, second) => second.price - first.price);
		if (sort === "rating") result.sort((first, second) => Number(second.rating) - Number(first.rating));
		return result;
	}, [category, price, query, sort]);

	const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
	const currentPage = Math.min(page, pageCount);
	const visibleCourses = filteredCourses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

	function updateQuery(event) {
		event.preventDefault();
		setPage(1);
		const nextParams = new URLSearchParams(searchParams);
		if (query.trim()) nextParams.set("q", query.trim());
		else nextParams.delete("q");
		if (category) nextParams.set("category", category);
		else nextParams.delete("category");
		setSearchParams(nextParams);
	}

	function clearFilters() {
		setQuery("");
		setCategory("");
		setPrice("all");
		setSort("featured");
		setPage(1);
		setSearchParams({});
	}

	return (
		<main>
			<PageIntro eyebrow="دورات الكلية" title="تعلّم مهارة تفتح لك طريقًا" description="اكتشف دورات صُممت لتقرّبك من أهدافك، واختر المسار الذي يناسب خطوتك القادمة." />
			<section className="section courses-page-section">
				<div className="container">
					<form className="catalog-search" onSubmit={updateQuery}>
						<Search size={20} />
						<input aria-label="ابحث في الدورات" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن دورة أو مهارة أو مدرّب..." />
						<button className="button button-primary" type="submit">بحث <Search size={16} /></button>
					</form>
					<div className="catalog-toolbar">
						<div className="catalog-count"><SlidersHorizontal size={17} /><span>تصفّح حسب اهتمامك</span></div>
						<label className="sort-control">ترتيب حسب
							<select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
								<option value="featured">الأكثر صلة</option>
								<option value="rating">الأعلى تقييمًا</option>
								<option value="price-low">السعر: الأقل أولًا</option>
								<option value="price-high">السعر: الأعلى أولًا</option>
							</select>
						</label>
					</div>
					<div className="catalog-layout">
						<aside className="filter-panel">
							<div className="filter-heading"><h2>التصنيفات</h2><button type="button" onClick={clearFilters}>مسح الكل</button></div>
							<label className="filter-option"><input type="radio" name="category" checked={!category} onChange={() => { setCategory(""); setPage(1); }} /> جميع المجالات</label>
							{categories.map((item) => <label className="filter-option" key={item.name}><input type="radio" name="category" checked={category === item.name} onChange={() => { setCategory(item.name); setPage(1); }} /> {item.name}</label>)}
							<hr />
							<h2>نطاق السعر</h2>
							<label className="filter-option"><input type="radio" name="price" checked={price === "all"} onChange={() => { setPrice("all"); setPage(1); }} /> جميع الأسعار</label>
							<label className="filter-option"><input type="radio" name="price" checked={price === "low"} onChange={() => { setPrice("low"); setPage(1); }} /> أقل من ٣٠٠ ر.س</label>
							<label className="filter-option"><input type="radio" name="price" checked={price === "high"} onChange={() => { setPrice("high"); setPage(1); }} /> ٣٠٠ ر.س فأكثر</label>
						</aside>
						<div className="catalog-results">
							<p className="results-caption">نعرض <b>{visibleCourses.length}</b> من <b>{filteredCourses.length}</b> دورات</p>
							{visibleCourses.length ? (
								<div className="course-grid">
									{visibleCourses.map((course) => <CourseCard key={course.id} course={course} />)}
								</div>
							) : (
								<div className="empty-state"><span className="empty-icon"><Search size={25} /></span><h2>لم نعثر على دورة مطابقة</h2><p>جرّب كلمة بحث أخرى أو غيّر خيارات التصفية.</p><button className="button button-outline" type="button" onClick={clearFilters}>عرض جميع الدورات</button></div>
							)}
							{filteredCourses.length > PAGE_SIZE && (
								<nav className="pagination" aria-label="التنقل بين صفحات الدورات">
									<button type="button" aria-label="الصفحة السابقة" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}><ChevronRight size={18} /></button>
									{Array.from({ length: pageCount }, (_, index) => <button key={index + 1} type="button" aria-current={currentPage === index + 1 ? "page" : undefined} className={currentPage === index + 1 ? "current" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}
									<button type="button" aria-label="الصفحة التالية" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}><ChevronLeft size={18} /></button>
								</nav>
							)}
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
