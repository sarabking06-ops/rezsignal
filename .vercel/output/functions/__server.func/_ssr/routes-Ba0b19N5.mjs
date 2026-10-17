import { i as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, Y as require_react, b as useNavigate, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ChevronRight, i as Copy, n as Search, r as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-BoP32nTN.mjs";
import { a as ReferenceLine, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as Line, s as Tooltip, t as LineChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ba0b19N5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatPrice(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	if (abs >= 1e3) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
	if (abs >= 1) return n.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4
	});
	if (abs >= .01) return n.toLocaleString("en-US", {
		minimumFractionDigits: 4,
		maximumFractionDigits: 6
	});
	return n.toPrecision(4);
}
function formatPct(n, digits = 2) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function formatCompact(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	const abs = Math.abs(n);
	const sign = n < 0 ? "-" : "";
	if (abs >= 0xe8d4a51000) return `${sign}${(abs / 0xe8d4a51000).toFixed(2)}T`;
	if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)}B`;
	if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
	if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
	return `${sign}${abs.toFixed(0)}`;
}
function formatWhen(iso) {
	const shifted = new Date(new Date(iso).getTime() + 126e5);
	const p = (n) => String(n).padStart(2, "0");
	return `${p(shifted.getUTCMonth() + 1)}/${p(shifted.getUTCDate())} ${p(shifted.getUTCHours())}:${p(shifted.getUTCMinutes())} تهران`;
}
function Desk({ board, loading, onRefresh }) {
	if (!board.ok) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xl font-semibold",
				children: "قیمت‌ها نرسید"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: board.message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onRefresh,
				className: "h-11 rounded-md bg-up px-4 font-medium text-up-ink",
				children: "تلاش دوباره"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardView, {
		board,
		loading,
		onRefresh
	});
}
function BoardView({ board, loading, onRefresh }) {
	const [filter, setFilter] = (0, import_react.useState)("active");
	const [sort, setSort] = (0, import_react.useState)("score");
	const [query, setQuery] = (0, import_react.useState)("");
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const active = board.coins.filter((c) => c.signal.side === "long" || c.signal.side === "short");
	const longs = active.filter((c) => c.signal.side === "long").length;
	const shorts = active.filter((c) => c.signal.side === "short").length;
	const searched = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return board.coins;
		return board.coins.filter((c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
	}, [board.coins, query]);
	const rows = (0, import_react.useMemo)(() => {
		let list = searched;
		if (filter === "active") list = list.filter((c) => c.signal.side === "long" || c.signal.side === "short");
		else if (filter === "long") list = list.filter((c) => c.signal.side === "long");
		else if (filter === "short") list = list.filter((c) => c.signal.side === "short");
		const next = list.slice();
		next.sort((a, b) => compare(a, b, sort));
		return next;
	}, [
		searched,
		filter,
		sort
	]);
	const selected = board.coins.find((c) => c.id === selectedId) ?? null;
	(0, import_react.useEffect)(() => {
		if (!selectedId) return;
		if (window.matchMedia("(max-width: 1023px)").matches) window.scrollTo({ top: 0 });
	}, [selectedId]);
	const regime = regimeOf(board.coins);
	const crowded = active.length >= 5 && shorts / active.length >= .8 ? "short" : active.length >= 5 && longs / active.length >= .8 ? "long" : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1 bg-up" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "border-b border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "grid size-10 shrink-0 grid-cols-3 items-end gap-0.5 rounded-md bg-up px-1.5 pb-1.5",
							"aria-hidden": "true",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 rounded-sm bg-up-ink" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 rounded-sm bg-up-ink" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-3 rounded-sm bg-up-ink" })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-semibold leading-tight",
							children: "نبض"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "ورود، حد ضرر و حد سود — ۱۰۰ ارز برتر"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onRefresh,
						disabled: loading,
						className: "inline-flex h-11 items-center gap-2 rounded-md bg-up px-4 font-medium text-up-ink disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: loading ? "size-4 animate-spin" : "size-4" }), "تازه‌سازی"]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-6xl px-4 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-3xl text-sm text-muted",
						children: "داده زنده کوین‌گکو. سیگنال فقط وقتی صادر می‌شود که روند ۴ساعته، ناحیه پولبک و نسبت سود به ضرر با هم جور باشند. سود هیچ معامله‌ای تضمین نیست."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "ستاپ فعال",
								value: String(active.length)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "خرید",
								value: String(longs),
								tone: "up"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "فروش",
								value: String(shorts),
								tone: "down"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "دامیننس بیت‌کوین",
								value: board.btcDominance == null ? "—" : `${board.btcDominance.toFixed(1)}%`,
								hint: board.marketChange24h == null ? void 0 : `بازار ${formatPct(board.marketChange24h)}`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-sm text-muted",
						children: [
							regime === "down" ? "رژیم ۴ساعته بازار نزولی است. خرید خلاف روند ساخته نمی‌شود." : regime === "up" ? "رژیم ۴ساعته بازار صعودی است. فروش خلاف روند ساخته نمی‌شود." : "روند کل بازار یکدست نیست؛ فقط ارزهایی که روند تمیز دارند سیگنال می‌گیرند.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								dir: "ltr",
								className: "font-mono",
								children: formatWhen(board.fetchedAt)
							}),
							board.cached ? " · ذخیره موقت" : ""
						]
					}),
					crowded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 rounded-md border border-line bg-surface px-3 py-3 text-sm",
						children: crowded === "short" ? "فروش‌ها هم‌جهت و هم‌بسته‌اند. چند ستاپ اول را انتخاب کنید، نه همه را با هم." : "خریدها هم‌جهت و هم‌بسته‌اند. چند ستاپ اول را انتخاب کنید، نه همه را با هم."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-lg border border-line bg-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "cursor-pointer px-4 py-3 font-medium",
							children: "این عددها از کجا می‌آیند؟"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 border-t border-line px-4 py-4 text-sm text-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "قیمت ساعتی هفت روز گذشته به کندل ۴ساعته تبدیل می‌شود. جهت معامله فقط جهت EMA ۸ نسبت به EMA ۲۱ است." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "ورود لحظه‌ای فقط نزدیک همان میانگین مجاز است. اگر قیمت کشیده باشد، به‌جای تعقیب یک اردر لیمیت روی میانگین گذاشته می‌شود." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "حد ضرر پشت آخرین سویینگ است؛ نه تنگ‌تر از ۱.۵ برابر ATR و نه بازتر از حدود ۶٪." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "هدف اصلی حداکثر ۲.۴ برابر ریسک است و اگر حمایت یا مقاومت زودتر برسد، یا هدف کوتاه می‌شود یا سیگنال حذف می‌شود." }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "اگر از هر ده معامله چهار تا به هدف ۲.۴ برابر ریسک برسد و شش تا روی حد ضرر بسته شود، نتیجه هنوز مثبت است. این ویژگی ساختار است، نه وعده برد." })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: selected ? "mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-4" : "mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: selected ? "hidden lg:block" : "",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
												pressed: filter === "active",
												onClick: () => setFilter("active"),
												children: ["فعال‌ها ", countSide(searched, "active")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
												pressed: filter === "long",
												onClick: () => setFilter("long"),
												children: ["خرید ", countSide(searched, "long")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
												pressed: filter === "short",
												onClick: () => setFilter("short"),
												children: ["فروش ", countSide(searched, "short")]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
												pressed: filter === "all",
												onClick: () => setFilter("all"),
												children: ["همه ", searched.length]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "flex items-center gap-2 text-sm text-muted",
										children: ["مرتب‌سازی", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: sort,
											onChange: (e) => setSort(e.target.value),
											className: "h-11 rounded-md border border-line bg-surface px-3 text-fg",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "score",
													children: "قدرت سیگنال"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "rank",
													children: "رتبه بازار"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "change",
													children: "تغییر ۲۴س"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "risk",
													children: "کمترین ریسک"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-3 flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										className: "size-4 shrink-0 text-muted",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: query,
										onChange: (e) => setQuery(e.target.value),
										placeholder: "نماد یا نام، مثل BTC",
										className: "h-full w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: loading ? "mt-3 space-y-2 opacity-60" : "mt-3 space-y-2",
									children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-dashed border-line px-4 py-8",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: filter === "all" ? "ارزی با این نام پیدا نشد." : "با این فیلتر ستاپی نیست."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-muted",
												children: filter === "active" ? "یعنی مدل، ورود به‌صرفه پیدا نکرده. تعقیب حرکت کشیده یا معامله داخل رنج عمداً حذف شده است." : "فیلتر را روی همه بگذارید تا دلیل رد شدن هر ارز را ببینید."
											}),
											filter !== "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => setFilter("all"),
												className: "mt-4 h-11 rounded-md border border-line px-4 text-sm",
												children: "نمایش هر ۱۰۰ ارز"
											}) : null
										]
									}) : rows.map((coin, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinCard, {
										coin,
										index,
										selected: coin.id === selectedId,
										onSelect: () => setSelectedId(coin.id)
									}, coin.id))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
							className: selected ? "lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto lg:py-4" : "hidden lg:block",
							children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
								coin: selected,
								onClose: () => setSelectedId(null)
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-dashed border-line p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "یک ارز را باز کنید"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: "نمودار هفت‌روزه، سه هدف، و اندازه پوزیشن بر اساس مبلغی که حاضرید از دست بدهید."
								})]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
						className: "mt-8 border-t border-line py-6 text-sm text-muted",
						children: "نبض ابزار تحلیلی است، نه توصیه مالی. حد ضرر را بعد از ورود جابه‌جا نکنید مگر به نقطه ورود، آن هم بعد از هدف اول. فروش‌ها برای فیوچرز یا مارجین است؛ در اسپات فقط خریدها قابل اجرا هستند."
					})
				]
			})
		]
	});
}
function CoinCard({ coin, index, selected, onSelect }) {
	const trade = coin.signal.side === "long" || coin.signal.side === "short";
	const badge = badgeOf(coin.signal);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onSelect,
		"aria-current": selected ? "true" : void 0,
		className: "w-full rounded-lg border p-3 text-right transition-colors " + (selected ? coin.signal.side === "short" ? "border-down bg-surface-2" : "border-up bg-surface-2" : "border-line bg-surface"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {
				coin,
				eager: index < 6
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-sm",
									children: coin.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm text-muted",
									children: coin.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: ["رتبه ", coin.rank]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `shrink-0 rounded-md px-2 py-1 text-xs font-medium ${badge.className}`,
							children: badge.label
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							dir: "ltr",
							className: "font-mono text-lg",
							children: formatPrice(coin.price)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							dir: "ltr",
							className: `font-mono text-sm ${pctClass(coin.change24h)}`,
							children: [formatPct(coin.change24h), " ۲۴س"]
						})]
					}),
					trade ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid grid-cols-3 gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "ورود",
								value: formatPrice(coin.signal.entry)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "حد ضرر",
								value: formatPrice(coin.signal.stop)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
								label: "هدف",
								value: formatPrice(coin.signal.tp2)
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: coin.signal.headline
					})
				]
			})]
		})
	});
}
function Detail({ coin, onClose }) {
	const s = coin.signal;
	const trade = s.side === "long" || s.side === "short";
	const [copied, setCopied] = (0, import_react.useState)(null);
	async function copy(id, text) {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(id);
			window.setTimeout(() => setCopied((cur) => cur === id ? null : cur), 1400);
		} catch {
			setCopied(null);
		}
	}
	const plan = trade ? [
		`${coin.symbol} ${s.headline}`,
		`ورود: ${formatPrice(s.entry)} (${s.entryKind === "limit" ? "limit" : "market"})`,
		`حد ضرر: ${formatPrice(s.stop)}`,
		`هدف ۱: ${formatPrice(s.tp1)}`,
		`هدف ۲: ${formatPrice(s.tp2)}`,
		s.tp3 != null ? `هدف ۳: ${formatPrice(s.tp3)}` : null,
		`ریسک: ${s.riskPct?.toFixed(2)}%`,
		`R:R هدف ۲: ${s.rr?.toFixed(2)}`,
		"نبض — داده کوین‌گکو، پولبک روند ۴ساعته"
	].filter(Boolean).join("\n") : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg border border-line bg-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onClose,
				className: "mb-3 inline-flex h-11 items-center gap-1 text-sm text-muted lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" }), "بازگشت به فهرست"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoinMark, {
					coin,
					eager: true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: coin.symbol
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ms-2 text-base font-normal text-muted",
							children: coin.name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["رتبه ", coin.rank]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				dir: "ltr",
				className: "mt-3 font-mono text-3xl",
				children: formatPrice(coin.price)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						dir: "ltr",
						className: pctClass(coin.change1h),
						children: ["۱س ", formatPct(coin.change1h)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: " · "
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						dir: "ltr",
						className: pctClass(coin.change24h),
						children: ["۲۴س ", formatPct(coin.change24h)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted",
						children: " · "
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						dir: "ltr",
						className: pctClass(coin.change7d),
						children: ["۷ر ", formatPct(coin.change7d)]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceChart, { coin }),
			trade ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-medium",
						children: [
							s.grade === "A" ? "ستاپ عالی" : "ستاپ معتبر",
							" · ",
							s.headline
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-sm text-muted",
						children: ["امتیاز ", s.score]
					})]
				}),
				s.entryKind === "limit" && s.gapPct != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						"ورود ",
						formatPct(Math.abs(s.gapPct)),
						" ",
						s.side === "short" ? "بالاتر" : "پایین‌تر",
						" از قیمت فعلی است. تا رسیدنش به ورود، معامله باز نیست."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "قیمت در ناحیه ورود است. می‌شود لحظه‌ای وارد شد."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelButton, {
							id: "entry",
							label: s.entryKind === "limit" ? "ورود لیمیت" : "ورود لحظه‌ای",
							value: s.entry,
							copied,
							onCopy: copy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelButton, {
							id: "stop",
							label: "حد ضرر",
							value: s.stop,
							copied,
							onCopy: copy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelButton, {
							id: "tp1",
							label: "هدف ۱ · بستن ۴۰٪",
							value: s.tp1,
							copied,
							onCopy: copy
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelButton, {
							id: "tp2",
							label: "هدف ۲ · بستن ۴۰٪",
							value: s.tp2,
							copied,
							onCopy: copy
						}),
						s.tp3 != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LevelButton, {
							id: "tp3",
							label: "هدف ۳ · باقی‌مانده",
							value: s.tp3,
							copied,
							onCopy: copy
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "ریسک",
							value: s.riskPct == null ? "—" : `${s.riskPct.toFixed(2)}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "R:R",
							value: s.rr == null ? "—" : s.rr.toFixed(2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							label: "RSI",
							value: s.rsi == null ? "—" : s.rsi.toFixed(1)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "بعد از هدف ۱، حد ضرر را به قیمت ورود بیاورید. اگر به هدف ۲ نرسید، همین کار بخش زیادی از باخت‌ها را کوچک می‌کند."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sizer, {
					entry: s.entry ?? coin.price,
					stop: s.stop ?? coin.price
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void copy("plan", plan),
					className: "mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied === "plan" ? "کپی شد" : "کپی پلن معامله"]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 font-medium",
				children: s.headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2 text-sm text-muted",
				children: s.reasons.map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "border-s-2 border-line ps-3",
					children: reason
				}, reason))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 font-mono text-xs text-muted",
				children: [
					"حجم ۲۴س ",
					formatCompact(coin.volume),
					" · مارکت‌کپ ",
					formatCompact(coin.marketCap),
					s.atrPct != null ? ` · ATR ${s.atrPct.toFixed(2)}%` : ""
				]
			})
		]
	});
}
function Sizer({ entry, stop }) {
	const [capital, setCapital] = (0, import_react.useState)("1000");
	const [risk, setRisk] = (0, import_react.useState)("1");
	const cap = Number(capital);
	const riskPct = Number(risk);
	const riskAbs = Math.abs(entry - stop);
	const valid = Number.isFinite(cap) && cap > 0 && Number.isFinite(riskPct) && riskPct > 0 && riskPct < 50 && riskAbs > 0;
	const riskUsd = valid ? cap * riskPct / 100 : 0;
	const qty = valid ? riskUsd / riskAbs : 0;
	const notion = qty * entry;
	const lev = cap > 0 ? notion / cap : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-md border border-line p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: "اندازه پوزیشن"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-muted",
					children: ["سرمایه دلاری", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "decimal",
						value: capital,
						onChange: (e) => setCapital(e.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 font-mono text-sm text-fg",
						dir: "ltr"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-xs text-muted",
					children: ["ریسک هر معامله ٪", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						inputMode: "decimal",
						value: risk,
						onChange: (e) => setRisk(e.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 font-mono text-sm text-fg",
						dir: "ltr"
					})]
				})]
			}),
			valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-3 grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "مبلغ ریسک",
						value: `$${formatPrice(riskUsd)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "مقدار",
						value: formatPrice(qty)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						label: "ارزش پوزیشن",
						value: notion >= 1e4 ? `$${formatCompact(notion)}` : `$${formatPrice(notion)}`
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "سرمایه و درصد ریسک را عددی وارد کنید."
			}),
			valid && riskPct > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-down",
				children: "ریسک بالای ۲٪ برای این مدل تهاجمی است."
			}) : null,
			valid && lev > 1.05 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: [
					"ارزش پوزیشن حدود ",
					lev.toFixed(1),
					" برابر سرمایه است. در اسپات این حجم جا نمی‌شود؛ در فیوچرز یعنی اهرم."
				]
			}) : null
		]
	});
}
function LevelButton({ id, label, value, copied, onCopy }) {
	const text = value == null ? "" : String(value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => value != null && onCopy(id, text),
		className: "flex h-12 items-center justify-between gap-3 rounded-md border border-line bg-bg px-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted",
			children: copied === id ? "کپی شد" : label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			dir: "ltr",
			className: "inline-flex items-center gap-2 font-mono text-sm",
			children: [formatPrice(value), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
				className: "size-3.5 text-muted",
				"aria-hidden": "true"
			})]
		})]
	});
}
function PriceChart({ coin }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	const data = coin.spark.map((v, t) => ({
		t,
		v
	}));
	const s = coin.signal;
	const marks = [
		coin.price,
		s.entry,
		s.stop,
		s.tp2
	].filter((n) => n != null && Number.isFinite(n));
	const min = Math.min(...coin.spark, ...marks);
	const max = Math.max(...coin.spark, ...marks);
	const pad = (max - min) * .12 || coin.price * .02;
	const stroke = s.side === "short" ? "var(--color-down)" : s.side === "long" ? "var(--color-up)" : "var(--color-fg)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 h-52 w-full",
		dir: "ltr",
		children: ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(LineChart, {
				data,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "var(--color-line)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						domain: [min - pad, max + pad],
						orientation: "right",
						tickFormatter: (v) => formatPrice(v),
						tick: {
							fill: "var(--color-muted)",
							fontSize: 12
						},
						width: 72,
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload }) => {
						if (!active || !payload?.length) return null;
						const raw = payload[0]?.value;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-md border border-line bg-bg px-2 py-1 font-mono text-xs",
							children: formatPrice(typeof raw === "number" ? raw : null)
						});
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "v",
						stroke,
						dot: false,
						strokeWidth: 2,
						isAnimationActive: false
					}),
					s.entry != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: s.entry,
						stroke: "var(--color-fg)",
						strokeDasharray: "4 4"
					}) : null,
					s.stop != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: s.stop,
						stroke: "var(--color-down)",
						strokeDasharray: "3 3"
					}) : null,
					s.tp2 != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						y: s.tp2,
						stroke: "var(--color-up)",
						strokeDasharray: "3 3"
					}) : null
				]
			})
		}) : null
	});
}
function CoinMark({ coin, eager }) {
	const [broken, setBroken] = (0, import_react.useState)(false);
	if (!coin.image || broken) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-sm",
		children: coin.symbol.slice(0, 1)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: coin.image,
		alt: "",
		width: 40,
		height: 40,
		loading: eager ? "eager" : "lazy",
		className: "size-10 shrink-0 rounded-md bg-surface-2",
		onError: () => setBroken(true)
	});
}
function Stat({ label, value, hint, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-surface px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: `mt-1 font-mono text-xl ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-fg"}`,
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function Mini({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-surface-2 px-2 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			dir: "ltr",
			className: "mt-1 text-left font-mono text-sm text-fg",
			children: value
		})]
	});
}
function Chip({ pressed, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": pressed,
		onClick,
		className: "h-11 rounded-md px-3 text-sm " + (pressed ? "bg-up font-medium text-up-ink" : "border border-line bg-surface text-fg"),
		children
	});
}
function badgeOf(signal) {
	if (signal.side === "long" || signal.side === "short") {
		const grade = signal.grade === "A" ? "عالی" : "معتبر";
		const tone = signal.side === "long" ? "bg-up text-up-ink" : "bg-down text-down-ink";
		return {
			label: `${grade} · ${signal.headline}`,
			className: tone
		};
	}
	if (signal.side === "stable") return {
		label: "استیبل",
		className: "bg-surface-2 text-muted"
	};
	return {
		label: "بدون ورود",
		className: "bg-surface-2 text-muted"
	};
}
function pctClass(n) {
	if (n == null || n === 0) return "text-muted";
	return n > 0 ? "text-up" : "text-down";
}
function countSide(coins, filter) {
	if (filter === "long") return coins.filter((c) => c.signal.side === "long").length;
	if (filter === "short") return coins.filter((c) => c.signal.side === "short").length;
	if (filter === "active") return coins.filter((c) => c.signal.side === "long" || c.signal.side === "short").length;
	return coins.length;
}
function compare(a, b, sort) {
	if (sort === "rank") return a.rank - b.rank;
	if (sort === "change") return (b.change24h ?? -1e9) - (a.change24h ?? -1e9);
	if (sort === "risk") return (a.signal.riskPct ?? 1e9) - (b.signal.riskPct ?? 1e9);
	const as = a.signal.side === "long" || a.signal.side === "short" ? a.signal.score : -1;
	const bs = b.signal.side === "long" || b.signal.side === "short" ? b.signal.score : -1;
	if (bs !== as) return bs - as;
	return a.rank - b.rank;
}
function regimeOf(coins) {
	const set = coins.filter((c) => c.signal.side !== "stable");
	const up = set.filter((c) => c.signal.trend === "up").length;
	const down = set.filter((c) => c.signal.trend === "down").length;
	if (down > up * 1.35 && down > set.length * .28) return "down";
	if (up > down * 1.35 && up > set.length * .28) return "up";
	return "mixed";
}
function Home() {
	const board = Route.useLoaderData();
	const navigate = useNavigate({ from: "/" });
	const loading = useRouterState({ select: (s) => s.isLoading });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {
		board,
		loading,
		onRefresh: () => {
			navigate({
				to: "/",
				search: { fresh: String(Date.now()) },
				replace: true
			});
		}
	});
}
//#endregion
export { Home as component };
