export function toPercent(input: number, precision = 1) {
	const percentage = input > 0 && input <= 1;
	if (!percentage) {
		return input;
	}
	return `${Math.round(input * 100)}%`;
}

export function getColorFromPercent(percent: number) {
	return `hsl(${percent * 120},100%,50%)`;
}
