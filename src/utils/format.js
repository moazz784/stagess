export function formatPrice(price) {
	return new Intl.NumberFormat("ar-SA").format(price);
}
