export const site = {
	name: "株式会社ATOM",
	nameEn: "ATOM",
	tel: "08025542115",
	telLabel: "080-2554-2115",
	address: "東京都豊島区東池袋1丁目34番5号",
	building: "いちご東池袋ビル6階",
	station: "池袋駅",
	walk: "徒歩5分",
	hours: "9:00〜19:00",
	hoursNote: "平日・土日祝",
	closed: "なし",
	listing: "非公開",
	recruitUrl: "https://saiyo.page/605267",
	mapQuery: "東京都豊島区東池袋1丁目34番5号 いちご東池袋ビル",
} as const;

export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`;
