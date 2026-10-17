import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/board.functions-BNNfdaFq.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var STABLE_SYMBOLS = /* @__PURE__ */ new Set([
	"usdt",
	"usdc",
	"dai",
	"fdusd",
	"usde",
	"tusd",
	"usds",
	"pyusd",
	"usdg",
	"usd1",
	"rlusd",
	"usdd",
	"frax",
	"crvusd",
	"gho",
	"usdy",
	"busd",
	"usdf",
	"susd",
	"eurc",
	"usdt0",
	"usdb",
	"usd0",
	"usdp",
	"gusd",
	"lusd",
	"usdn",
	"usdx",
	"eurcv",
	"usdtb"
]);
var EMPTY = {
	side: "wait",
	grade: "none",
	score: 0,
	entryKind: null,
	entry: null,
	stop: null,
	tp1: null,
	tp2: null,
	tp3: null,
	riskPct: null,
	rr: null,
	trend: "range",
	rsi: null,
	atrPct: null,
	ema: null,
	gapPct: null,
	headline: "بدون ستاپ",
	reasons: []
};
function isStableSymbol(symbol, name) {
	const s = symbol.toLowerCase();
	if (STABLE_SYMBOLS.has(s)) return true;
	if (/usd|eur|dai|tether|dollar/.test(s) && /usd|eur|dai|tether|dollar|stable/.test(name.toLowerCase())) return true;
	return false;
}
function buildSignal(input) {
	if (!Number.isFinite(input.price) || input.price <= 0) return say("قیمت معتبر نیست");
	if (isStableSymbol(input.symbol, input.name)) return {
		...EMPTY,
		side: "stable",
		headline: "استیبل‌کوین",
		reasons: ["قیمت باید نزدیک ۱ دلار بماند؛ ورود روندی اینجا بی‌معنی است."]
	};
	const bars = toBars(cleanSeries(input.spark, input.price), 4);
	if (bars.length < 32) return say("داده ۷ روزه برای کندل ۴ساعته کافی نیست");
	const closes = bars.map((b) => b.c);
	const fast = ema(closes, 8);
	const slow = ema(closes, 21);
	const atrSeries = atr(bars, 10);
	const rsiSeries = rsi(closes, 14);
	const i = bars.length - 1;
	const emaFast = fast[i];
	const emaSlow = slow[i];
	const emaPrev = fast[i - 3];
	const atrNow = atrSeries[i];
	const rsiNow = rsiSeries[i];
	if (emaFast == null || emaSlow == null || emaPrev == null || atrNow == null || atrNow <= 0 || rsiNow == null) return say("اندیکاتورها هنوز گرم نشده‌اند");
	const price = input.price;
	const sep = (emaFast - emaSlow) / price;
	const slope = (emaFast - emaPrev) / emaFast;
	let trend = "range";
	if (emaFast > emaSlow && slope > 35e-5 && sep > .001) trend = "up";
	else if (emaFast < emaSlow && slope < -35e-5 && sep < -.001) trend = "down";
	const meta = {
		trend,
		rsi: round(rsiNow, 1),
		atrPct: round(atrNow / price * 100, 2),
		ema: roundPx(emaFast)
	};
	if (trend === "range") return say("بازار ۴ساعته رنج است؛ ورود روندی ممنوع", meta, ["EMA سریع و آهسته هم‌جهت و با فاصله کافی نیستند.", "در رنج، حد سود معمولاً قبل از حد ضرر لمس نمی‌شود."]);
	const side = trend === "up" ? "long" : "short";
	const week = input.change7d;
	if (side === "short" && week != null && week > 5) return say("روند هفتگی هنوز صعودی است؛ فروش خلاف هفته رد شد", meta);
	if (side === "long" && week != null && week < -5) return say("روند هفتگی نزولی است؛ خرید خلاف هفته رد شد", meta);
	const dist = (price - emaFast) / atrNow;
	const located = locate(side, dist, price, emaFast, atrNow);
	if (!located) return say((side === "short" ? dist < -2.15 : dist > 2.15) ? "قیمت بیش از حد از میانگین فاصله گرفته؛ تعقیب ممنوع" : "قیمت در ناحیه پولبک نیست", meta, [`فاصله تا EMA سریع: ${dist.toFixed(2)} برابر ATR چهارساعته.`, side === "short" ? "برای فروش، یا قیمت باید نزدیک میانگین باشد یا فقط کمی پایین‌تر تا اردر لیمیت منطقی شود." : "برای خرید، یا قیمت باید نزدیک میانگین باشد یا فقط کمی بالاتر تا اردر لیمیت منطقی شود."]);
	const hour = input.change1h ?? 0;
	if (located.kind === "market" && side === "long" && hour > 2) return say("جهش یک‌ساعته؛ خرید لحظه‌ای تعقیب است", meta);
	if (located.kind === "market" && side === "short" && hour < -2) return say("ریزش یک‌ساعته؛ فروش لحظه‌ای تعقیب است", meta);
	const rsiQ = rsiQuality(side, rsiNow);
	if (rsiQ === "bad") return say(rsiNow < 35 ? "RSI در اشباع فروش است؛ چاقوی در حال سقوط" : "RSI در اشباع خرید است", meta, [`RSI ۱۴ برابر ${rsiNow.toFixed(1)} است و با ورود امن این مدل جور نیست.`]);
	const stopped = placeStop(side, located.entry, atrNow, bars);
	if ("fail" in stopped) return say(stopped.fail, meta);
	const riskAbs = Math.abs(located.entry - stopped.stop);
	const barrier = nextBarrier(side, located.entry, bars);
	const openRoom = barrier == null ? 4 : Math.abs(barrier - located.entry) / riskAbs;
	if (openRoom < 1.45) return say(side === "short" ? "حمایت نزدیک است؛ فروش به‌صرفه نیست" : "مقاومت نزدیک است؛ خرید به‌صرفه نیست", meta, [`فضای حرکت فقط ${openRoom.toFixed(2)} برابر ریسک است؛ حداقل ۱.۴۵ لازم است.`]);
	const rrCap = Math.min(2.4, openRoom * .98);
	if (rrCap < 1.6) return say("فضای حرکت تا مانع بعدی برای هدف کافی نیست", meta, [`تا مانع بعدی ${openRoom.toFixed(2)} برابر ریسک جا هست.`]);
	const tp1r = Math.min(1.5, rrCap);
	const tp2r = rrCap;
	const tp3r = Math.min(3.6, openRoom * .98);
	const dir = side === "long" ? 1 : -1;
	const rawTp2 = located.entry + dir * tp2r * riskAbs;
	if (located.kind === "limit") {
		if ((side === "short" ? price - rawTp2 : rawTp2 - price) < .35 * riskAbs) return say("هدف لیمیت از قیمت فعلی به‌اندازه کافی رد نمی‌شود", meta);
	}
	const entry = roundPx(located.entry);
	const stop = roundPx(stopped.stop);
	const tp1 = roundPx(entry + dir * tp1r * riskAbs);
	const tp2 = roundPx(entry + dir * tp2r * riskAbs);
	const tp3 = tp3r > tp2r + .25 ? roundPx(entry + dir * tp3r * riskAbs) : null;
	const turnover = input.marketCap > 0 ? input.volume / input.marketCap : 0;
	if (turnover < .002) return say("حجم ۲۴ساعته برای این مارکت‌کپ خیلی کم است", meta);
	let score = 30;
	score += located.kind === "market" ? 25 : 22;
	score += rsiQ === "ideal" ? 20 : 12;
	score += rrCap >= 2.15 ? 15 : rrCap >= 1.8 ? 12 : 8;
	score += turnover >= .03 ? 10 : turnover >= .01 ? 6 : 3;
	const grade = score >= 90 && rsiQ === "ideal" && rrCap >= 2 ? "A" : "B";
	const riskPct = round(riskAbs / entry * 100, 2);
	const gapPct = round((entry - price) / price * 100, 2);
	const reasons = [
		side === "long" ? "روند ۴ساعته صعودی است؛ EMA سریع بالای EMA آهسته و شیب مثبت دارد." : "روند ۴ساعته نزولی است؛ EMA سریع زیر EMA آهسته و شیب منفی دارد.",
		located.kind === "market" ? "قیمت در ناحیه پولبک، نزدیک میانگین سریع است؛ ورود لحظه‌ای مجاز است." : side === "long" ? "قیمت از میانگین بالا کشیده شده؛ به‌جای تعقیب، خرید لیمیت روی EMA گذاشته می‌شود." : "قیمت از میانگین پایین کشیده شده؛ به‌جای تعقیب، فروش لیمیت روی EMA گذاشته می‌شود.",
		`RSI ۱۴ برابر ${rsiNow.toFixed(1)} است و در ناحیه مجاز این جهت قرار دارد.`,
		`حد ضرر ${riskPct.toFixed(2)}٪ با قیمت فاصله دارد و هدف اصلی ${rrCap.toFixed(2)} برابر ریسک است.`
	];
	const verb = side === "long" ? "خرید" : "فروش";
	const how = located.kind === "market" ? "لحظه‌ای" : "لیمیت";
	return {
		side,
		grade,
		score,
		entryKind: located.kind,
		entry,
		stop,
		tp1,
		tp2,
		tp3,
		riskPct,
		rr: round(tp2r, 2),
		trend,
		rsi: round(rsiNow, 1),
		atrPct: round(atrNow / price * 100, 2),
		ema: roundPx(emaFast),
		gapPct,
		headline: `${verb} ${how}`,
		reasons
	};
}
function say(headline, extra, reasons = []) {
	return {
		...EMPTY,
		...extra,
		headline,
		reasons: reasons.length > 0 ? reasons : [headline]
	};
}
function locate(side, dist, price, emaFast, atrNow) {
	if (side === "long") {
		if (dist >= -.4 && dist <= .85) return {
			kind: "market",
			entry: price
		};
		if (dist > .85 && dist <= 2.2 && emaFast < price) {
			const entry = emaFast;
			if ((price - entry) / atrNow > 2.3) return null;
			if (entry >= price) return null;
			return {
				kind: "limit",
				entry
			};
		}
		return null;
	}
	if (dist >= -.85 && dist <= .4) return {
		kind: "market",
		entry: price
	};
	if (dist < -.85 && dist >= -2.2 && emaFast > price) {
		const entry = emaFast;
		if ((entry - price) / atrNow > 2.3) return null;
		if (entry <= price) return null;
		return {
			kind: "limit",
			entry
		};
	}
	return null;
}
function placeStop(side, entry, atrNow, bars) {
	const minDist = Math.max(1.5 * atrNow, entry * .0045);
	const cap = Math.min(Math.max(3.3 * atrNow, entry * .012), entry * .06);
	if (minDist > cap) return { fail: "نوسان با سقف ریسک این مدل جور درنمی‌آید" };
	const swing = side === "long" ? swingLow(bars) : swingHigh(bars);
	let dist = Math.min(Math.max(1.7 * atrNow, minDist), cap);
	if (side === "long" && swing != null && swing < entry) {
		const struct = entry - swing + .2 * atrNow;
		if (struct >= minDist && struct <= cap) dist = struct;
	}
	if (side === "short" && swing != null && swing > entry) {
		const struct = swing - entry + .2 * atrNow;
		if (struct >= minDist && struct <= cap) dist = struct;
	}
	if (dist > entry * .06) return { fail: "حد ضرر بیش از ۶٪ دور می‌شود" };
	const stop = side === "long" ? entry - dist : entry + dist;
	if (side === "long" && stop >= entry) return { fail: "حد ضرر نامعتبر است" };
	if (side === "short" && stop <= entry) return { fail: "حد ضرر نامعتبر است" };
	return { stop };
}
function swingLow(bars) {
	const end = bars.length - 1;
	const from = Math.max(2, end - 14);
	let best = null;
	for (let i = from; i <= end - 2; i++) {
		const v = bars[i].l;
		if (v <= bars[i - 1].l && v <= bars[i - 2].l && v <= bars[i + 1].l && v <= bars[i + 2].l) {
			if (best == null || v < best) best = v;
		}
	}
	return best;
}
function swingHigh(bars) {
	const end = bars.length - 1;
	const from = Math.max(2, end - 14);
	let best = null;
	for (let i = from; i <= end - 2; i++) {
		const v = bars[i].h;
		if (v >= bars[i - 1].h && v >= bars[i - 2].h && v >= bars[i + 1].h && v >= bars[i + 2].h) {
			if (best == null || v > best) best = v;
		}
	}
	return best;
}
function nextBarrier(side, entry, bars) {
	const from = Math.max(2, bars.length - 16);
	let best = null;
	for (let i = from; i < bars.length - 2; i++) if (side === "long") {
		const v = bars[i].h;
		if (v >= bars[i - 1].h && v >= bars[i - 2].h && v >= bars[i + 1].h && v >= bars[i + 2].h && v > entry * 1.004) {
			if (best == null || v < best) best = v;
		}
	} else {
		const v = bars[i].l;
		if (v <= bars[i - 1].l && v <= bars[i - 2].l && v <= bars[i + 1].l && v <= bars[i + 2].l && v < entry * .996) {
			if (best == null || v > best) best = v;
		}
	}
	return best;
}
function rsiQuality(side, value) {
	if (side === "long") {
		if (value >= 46 && value <= 64) return "ideal";
		if (value >= 38 && value <= 70) return "ok";
		return "bad";
	}
	if (value >= 36 && value <= 55) return "ideal";
	if (value >= 30 && value <= 62) return "ok";
	return "bad";
}
function cleanSeries(prices, live) {
	const out = [];
	let last = 0;
	for (const p of prices) {
		if (Number.isFinite(p) && p > 0) last = p;
		if (last > 0) out.push(last);
	}
	if (out.length === 0 && live > 0) return [live];
	if (live > 0 && out.length > 0) {
		const prev = out[out.length - 1];
		if (Math.abs(live - prev) / live > 8e-4) out.push(live);
		else out[out.length - 1] = live;
	}
	return out;
}
function toBars(prices, group) {
	const bars = [];
	for (let i = 0; i < prices.length; i += group) {
		const w = prices.slice(i, i + group);
		if (w.length === 0) continue;
		let h = w[0];
		let l = w[0];
		for (const v of w) {
			if (v > h) h = v;
			if (v < l) l = v;
		}
		bars.push({
			h,
			l,
			c: w[w.length - 1]
		});
	}
	return bars;
}
function ema(values, period) {
	const out = Array(values.length).fill(null);
	if (values.length < period) return out;
	let sum = 0;
	for (let i = 0; i < period; i++) sum += values[i];
	let prev = sum / period;
	out[period - 1] = prev;
	const k = 2 / (period + 1);
	for (let i = period; i < values.length; i++) {
		prev = values[i] * k + prev * (1 - k);
		out[i] = prev;
	}
	return out;
}
function rsi(values, period) {
	const out = Array(values.length).fill(null);
	if (values.length <= period) return out;
	let gain = 0;
	let loss = 0;
	for (let i = 1; i <= period; i++) {
		const ch = values[i] - values[i - 1];
		if (ch >= 0) gain += ch;
		else loss -= ch;
	}
	let avgG = gain / period;
	let avgL = loss / period;
	out[period] = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
	for (let i = period + 1; i < values.length; i++) {
		const ch = values[i] - values[i - 1];
		const g = ch > 0 ? ch : 0;
		const l = ch < 0 ? -ch : 0;
		avgG = (avgG * (period - 1) + g) / period;
		avgL = (avgL * (period - 1) + l) / period;
		out[i] = avgL === 0 ? 100 : 100 - 100 / (1 + avgG / avgL);
	}
	return out;
}
function atr(bars, period) {
	const out = Array(bars.length).fill(null);
	if (bars.length <= period) return out;
	const tr = [];
	for (let i = 0; i < bars.length; i++) {
		const b = bars[i];
		if (i === 0) tr.push(b.h - b.l);
		else {
			const pc = bars[i - 1].c;
			tr.push(Math.max(b.h - b.l, Math.abs(b.h - pc), Math.abs(b.l - pc)));
		}
	}
	let prev = 0;
	for (let i = 1; i <= period; i++) prev += tr[i];
	prev /= period;
	out[period] = prev;
	for (let i = period + 1; i < bars.length; i++) {
		prev = (prev * (period - 1) + tr[i]) / period;
		out[i] = prev;
	}
	return out;
}
function roundPx(n) {
	if (!Number.isFinite(n)) return n;
	const abs = Math.abs(n);
	const f = 10 ** (abs >= 1e3 ? 2 : abs >= 100 ? 3 : abs >= 1 ? 4 : abs >= .01 ? 6 : 8);
	return Math.round(n * f) / f;
}
function round(n, digits) {
	const f = 10 ** digits;
	return Math.round(n * f) / f;
}
function downsample(values, points = 72) {
	if (values.length <= points) return values.slice();
	const out = [];
	const step = (values.length - 1) / (points - 1);
	for (let i = 0; i < points; i++) out.push(values[Math.round(i * step)]);
	return out;
}
var cache = null;
var MARKETS = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h,24h,7d";
var GLOBAL = "https://api.coingecko.com/api/v3/global";
var getBoard_createServerFn_handler = createServerRpc({
	id: "5e94a00dc2f8dd1489ae0ffc3899bca082e690aa91ff75f7c3ca92bbd93551cc",
	name: "getBoard",
	filename: "src/lib/signals/board.functions.ts"
}, (opts) => getBoard.__executeServer(opts));
var getBoard = createServerFn({ method: "GET" }).validator((input) => ({ force: Boolean(input && typeof input === "object" && input.force) })).handler(getBoard_createServerFn_handler, async ({ data }) => {
	const now = Date.now();
	if (cache && now - cache.at < 15e3) return {
		...cache.board,
		cached: true
	};
	if (!data.force && cache && now - cache.at < 9e4) return {
		...cache.board,
		cached: true
	};
	try {
		const board = await loadBoard();
		cache = {
			at: now,
			board
		};
		return board;
	} catch (error) {
		if (cache) return {
			...cache.board,
			cached: true
		};
		return {
			ok: false,
			message: error instanceof Error ? error.message : "دریافت قیمت‌ها ناموفق بود",
			fetchedAt: null
		};
	}
});
async function loadBoard() {
	const headers = {
		accept: "application/json",
		"user-agent": "NabzSignals/1.0"
	};
	const [marketsRes, globalRes] = await Promise.all([fetch(MARKETS, {
		headers,
		signal: AbortSignal.timeout(12e3)
	}), fetch(GLOBAL, {
		headers,
		signal: AbortSignal.timeout(12e3)
	})]);
	if (marketsRes.status === 429) throw new Error("کوین‌گکو محدودیت درخواست داده. چند ثانیه بعد تازه کنید.");
	if (!marketsRes.ok) throw new Error("قیمت‌ها از کوین‌گکو گرفته نشد.");
	const markets = await marketsRes.json();
	if (!Array.isArray(markets)) throw new Error("پاسخ کوین‌گکو قابل خواندن نیست.");
	let btcDominance = null;
	let marketChange24h = null;
	if (globalRes.ok) {
		const data = asRecord(asRecord(await globalRes.json())?.data);
		const pct = asRecord(data?.market_cap_percentage);
		if (typeof pct?.btc === "number") btcDominance = pct.btc;
		if (typeof data?.market_cap_change_percentage_24h_usd === "number") marketChange24h = data.market_cap_change_percentage_24h_usd;
	}
	const coins = [];
	for (const item of markets) {
		const row = asRecord(item);
		if (!row) continue;
		const id = str(row.id);
		const symbol = str(row.symbol);
		const name = (str(row.name) ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
		const price = num(row.current_price);
		if (!id || !symbol || !name || price == null || price <= 0) continue;
		const sparkRaw = asRecord(row.sparkline_in_7d);
		const sparkList = Array.isArray(sparkRaw?.price) ? sparkRaw.price.filter((v) => typeof v === "number") : [];
		const signal = buildSignal({
			symbol,
			name,
			price,
			spark: sparkList,
			volume: num(row.total_volume) ?? 0,
			marketCap: num(row.market_cap) ?? 0,
			change1h: num(row.price_change_percentage_1h_in_currency),
			change7d: num(row.price_change_percentage_7d_in_currency)
		});
		coins.push({
			id,
			symbol: symbol.toUpperCase(),
			name,
			image: str(row.image) ?? "",
			rank: num(row.market_cap_rank) ?? coins.length + 1,
			price,
			change1h: num(row.price_change_percentage_1h_in_currency),
			change24h: num(row.price_change_percentage_24h_in_currency) ?? num(row.price_change_percentage_24h),
			change7d: num(row.price_change_percentage_7d_in_currency),
			volume: num(row.total_volume) ?? 0,
			marketCap: num(row.market_cap) ?? 0,
			spark: downsample(sparkList.length > 0 ? sparkList : [price], 72),
			signal
		});
	}
	if (coins.length < 20) throw new Error("فهرست ۱۰۰ ارز ناقص برگشت. دوباره تلاش کنید.");
	return {
		ok: true,
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		cached: false,
		btcDominance,
		marketChange24h,
		coins
	};
}
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function str(value) {
	return typeof value === "string" && value.length > 0 ? value : null;
}
function num(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}
//#endregion
export { getBoard_createServerFn_handler };
