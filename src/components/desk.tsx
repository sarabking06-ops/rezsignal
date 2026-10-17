import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import { ChevronRight, Copy, RefreshCw, Search } from "lucide-react";
import type { Board, CoinRow } from "@/lib/signals/board.functions";
import type { Signal } from "@/lib/signals/engine";
import { formatCompact, formatPct, formatPrice, formatWhen } from "@/lib/signals/format";

type Filter = "active" | "long" | "short" | "all";
type Sort = "score" | "rank" | "change" | "risk";

export function Desk({
  board,
  loading,
  onRefresh,
}: {
  board: Board;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (!board.ok) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-4">
        <p className="text-2xl font-semibold">قیمت‌ها نرسید</p>
        <p className="text-muted">{board.message}</p>
        <button
          type="button"
          onClick={onRefresh}
          className="h-11 rounded-md bg-up px-4 font-medium text-up-ink"
        >
          تلاش دوباره
        </button>
      </main>
    );
  }

  return <BoardView board={board} loading={loading} onRefresh={onRefresh} />;
}

function BoardView({
  board,
  loading,
  onRefresh,
}: {
  board: Extract<Board, { ok: true }>;
  loading: boolean;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("active");
  const [sort, setSort] = useState<Sort>("score");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const active = board.coins.filter((c) => c.signal.side === "long" || c.signal.side === "short");
  const longs = active.filter((c) => c.signal.side === "long").length;
  const shorts = active.filter((c) => c.signal.side === "short").length;

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return board.coins;
    return board.coins.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [board.coins, query]);

  const rows = useMemo(() => {
    let list = searched;
    if (filter === "active") {
      list = list.filter((c) => c.signal.side === "long" || c.signal.side === "short");
    } else if (filter === "long") {
      list = list.filter((c) => c.signal.side === "long");
    } else if (filter === "short") {
      list = list.filter((c) => c.signal.side === "short");
    }
    const next = list.slice();
    next.sort((a, b) => compare(a, b, sort));
    return next;
  }, [searched, filter, sort]);

  const selected = board.coins.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    if (window.matchMedia("(max-width: 1023px)").matches) window.scrollTo({ top: 0 });
  }, [selectedId]);

  const regime = regimeOf(board.coins);
  const crowded =
    active.length >= 5 && shorts / active.length >= 0.8
      ? "short"
      : active.length >= 5 && longs / active.length >= 0.8
        ? "long"
        : null;

  return (
    <div className="min-h-screen">
      <div className="h-1 bg-up" />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 grid-cols-3 items-end gap-0.5 rounded-md bg-up px-1.5 pb-1.5" aria-hidden="true">
              <span className="h-2 rounded-sm bg-up-ink" />
              <span className="h-4 rounded-sm bg-up-ink" />
              <span className="h-3 rounded-sm bg-up-ink" />
            </span>
            <div>
              <h1 className="text-xl font-semibold leading-tight">نبض</h1>
              <p className="text-sm text-muted">ورود، حد ضرر و حد سود — ۱۰۰ ارز برتر</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-up px-4 font-medium text-up-ink disabled:opacity-60"
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            تازه‌سازی
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5">
        <p className="max-w-3xl text-sm text-muted">
          داده زنده کوین‌گکو. سیگنال فقط وقتی صادر می‌شود که روند ۴ساعته، ناحیه پولبک و نسبت سود به ضرر با هم جور باشند.
          سود هیچ معامله‌ای تضمین نیست.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="ستاپ فعال" value={String(active.length)} />
          <Stat label="خرید" value={String(longs)} tone="up" />
          <Stat label="فروش" value={String(shorts)} tone="down" />
          <Stat
            label="دامیننس بیت‌کوین"
            value={board.btcDominance == null ? "—" : `${board.btcDominance.toFixed(1)}%`}
            hint={board.marketChange24h == null ? undefined : `بازار ${formatPct(board.marketChange24h)}`}
          />
        </dl>

        <p className="mt-3 text-sm text-muted">
          {regime === "down"
            ? "رژیم ۴ساعته بازار نزولی است. خرید خلاف روند ساخته نمی‌شود."
            : regime === "up"
              ? "رژیم ۴ساعته بازار صعودی است. فروش خلاف روند ساخته نمی‌شود."
              : "روند کل بازار یکدست نیست؛ فقط ارزهایی که روند تمیز دارند سیگنال می‌گیرند."}{" "}
          <span dir="ltr" className="font-mono">
            {formatWhen(board.fetchedAt)}
          </span>
          {board.cached ? " · ذخیره موقت" : ""}
        </p>

        {crowded ? (
          <p className="mt-3 rounded-md border border-line bg-surface px-3 py-3 text-sm">
            {crowded === "short"
              ? "فروش‌ها هم‌جهت و هم‌بسته‌اند. چند ستاپ اول را انتخاب کنید، نه همه را با هم."
              : "خریدها هم‌جهت و هم‌بسته‌اند. چند ستاپ اول را انتخاب کنید، نه همه را با هم."}
          </p>
        ) : null}

        <details className="mt-4 rounded-lg border border-line bg-surface">
          <summary className="cursor-pointer px-4 py-3 font-medium">این عددها از کجا می‌آیند؟</summary>
          <div className="space-y-2 border-t border-line px-4 py-4 text-sm text-muted">
            <p>قیمت ساعتی هفت روز گذشته به کندل ۴ساعته تبدیل می‌شود. جهت معامله فقط جهت EMA ۸ نسبت به EMA ۲۱ است.</p>
            <p>ورود لحظه‌ای فقط نزدیک همان میانگین مجاز است. اگر قیمت کشیده باشد، به‌جای تعقیب یک اردر لیمیت روی میانگین گذاشته می‌شود.</p>
            <p>حد ضرر پشت آخرین سویینگ است؛ نه تنگ‌تر از ۱.۵ برابر ATR و نه بازتر از حدود ۶٪.</p>
            <p>هدف اصلی حداکثر ۲.۴ برابر ریسک است و اگر حمایت یا مقاومت زودتر برسد، یا هدف کوتاه می‌شود یا سیگنال حذف می‌شود.</p>
            <p>
              اگر از هر ده معامله چهار تا به هدف ۲.۴ برابر ریسک برسد و شش تا روی حد ضرر بسته شود، نتیجه هنوز مثبت است. این ویژگی ساختار است، نه وعده برد.
            </p>
          </div>
        </details>

        <div className={selected ? "mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-4" : "mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-4"}>
          <section className={selected ? "hidden lg:block" : ""}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Chip pressed={filter === "active"} onClick={() => setFilter("active")}>
                  فعال‌ها {countSide(searched, "active")}
                </Chip>
                <Chip pressed={filter === "long"} onClick={() => setFilter("long")}>
                  خرید {countSide(searched, "long")}
                </Chip>
                <Chip pressed={filter === "short"} onClick={() => setFilter("short")}>
                  فروش {countSide(searched, "short")}
                </Chip>
                <Chip pressed={filter === "all"} onClick={() => setFilter("all")}>
                  همه {searched.length}
                </Chip>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                مرتب‌سازی
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-11 rounded-md border border-line bg-surface px-3 text-fg"
                >
                  <option value="score">قدرت سیگنال</option>
                  <option value="rank">رتبه بازار</option>
                  <option value="change">تغییر ۲۴س</option>
                  <option value="risk">کمترین ریسک</option>
                </select>
              </label>
            </div>

            <label className="mt-3 flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3">
              <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="نماد یا نام، مثل BTC"
                className="h-full w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted"
              />
            </label>

            <div className={loading ? "mt-3 space-y-2 opacity-60" : "mt-3 space-y-2"}>
              {rows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line px-4 py-8">
                  <p className="font-medium">
                    {filter === "all" ? "ارزی با این نام پیدا نشد." : "با این فیلتر ستاپی نیست."}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {filter === "active"
                      ? "یعنی مدل، ورود به‌صرفه پیدا نکرده. تعقیب حرکت کشیده یا معامله داخل رنج عمداً حذف شده است."
                      : "فیلتر را روی همه بگذارید تا دلیل رد شدن هر ارز را ببینید."}
                  </p>
                  {filter !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setFilter("all")}
                      className="mt-4 h-11 rounded-md border border-line px-4 text-sm"
                    >
                      نمایش هر ۱۰۰ ارز
                    </button>
                  ) : null}
                </div>
              ) : (
                rows.map((coin, index) => (
                  <CoinCard
                    key={coin.id}
                    coin={coin}
                    index={index}
                    selected={coin.id === selectedId}
                    onSelect={() => setSelectedId(coin.id)}
                  />
                ))
              )}
            </div>
          </section>

          <aside className={selected ? "lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto lg:py-4" : "hidden lg:block"}>
            {selected ? (
              <Detail coin={selected} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="rounded-lg border border-dashed border-line p-5">
                <p className="font-medium">یک ارز را باز کنید</p>
                <p className="mt-2 text-sm text-muted">
                  نمودار هفت‌روزه، سه هدف، و اندازه پوزیشن بر اساس مبلغی که حاضرید از دست بدهید.
                </p>
              </div>
            )}
          </aside>
        </div>

        <footer className="mt-8 border-t border-line py-6 text-sm text-muted">
          نبض ابزار تحلیلی است، نه توصیه مالی. حد ضرر را بعد از ورود جابه‌جا نکنید مگر به نقطه ورود، آن هم بعد از هدف اول.
          فروش‌ها برای فیوچرز یا مارجین است؛ در اسپات فقط خریدها قابل اجرا هستند.
        </footer>
      </main>
    </div>
  );
}

function CoinCard({
  coin,
  index,
  selected,
  onSelect,
}: {
  coin: CoinRow;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const trade = coin.signal.side === "long" || coin.signal.side === "short";
  const badge = badgeOf(coin.signal);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={
        "w-full rounded-lg border p-3 text-right transition-colors " +
        (selected
          ? coin.signal.side === "short"
            ? "border-down bg-surface-2"
            : "border-up bg-surface-2"
          : "border-line bg-surface")
      }
    >
      <div className="flex items-start gap-3">
        <CoinMark coin={coin} eager={index < 6} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm">{coin.symbol}</span>
                <span className="truncate text-sm text-muted">{coin.name}</span>
              </div>
              <p className="text-xs text-muted">رتبه {coin.rank}</p>
            </div>
            <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <span dir="ltr" className="font-mono text-lg">
              {formatPrice(coin.price)}
            </span>
            <span dir="ltr" className={`font-mono text-sm ${pctClass(coin.change24h)}`}>
              {formatPct(coin.change24h)} ۲۴س
            </span>
          </div>
          {trade ? (
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <Mini label="ورود" value={formatPrice(coin.signal.entry)} />
              <Mini label="حد ضرر" value={formatPrice(coin.signal.stop)} />
              <Mini label="هدف" value={formatPrice(coin.signal.tp2)} />
            </dl>
          ) : (
            <p className="mt-2 text-sm text-muted">{coin.signal.headline}</p>
          )}
        </div>
      </div>
    </button>
  );
}

function Detail({ coin, onClose }: { coin: CoinRow; onClose: () => void }) {
  const s = coin.signal;
  const trade = s.side === "long" || s.side === "short";
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied((cur) => (cur === id ? null : cur)), 1400);
    } catch {
      setCopied(null);
    }
  }

  const plan = trade
    ? [
        `${coin.symbol} ${s.headline}`,
        `ورود: ${formatPrice(s.entry)} (${s.entryKind === "limit" ? "limit" : "market"})`,
        `حد ضرر: ${formatPrice(s.stop)}`,
        `هدف ۱: ${formatPrice(s.tp1)}`,
        `هدف ۲: ${formatPrice(s.tp2)}`,
        s.tp3 != null ? `هدف ۳: ${formatPrice(s.tp3)}` : null,
        `ریسک: ${s.riskPct?.toFixed(2)}%`,
        `R:R هدف ۲: ${s.rr?.toFixed(2)}`,
        "نبض — داده کوین‌گکو، پولبک روند ۴ساعته",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <button
        type="button"
        onClick={onClose}
        className="mb-3 inline-flex h-11 items-center gap-1 text-sm text-muted lg:hidden"
      >
        <ChevronRight className="size-4" />
        بازگشت به فهرست
      </button>
      <div className="flex items-start gap-3">
        <CoinMark coin={coin} eager />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">
            <span className="font-mono">{coin.symbol}</span>
            <span className="ms-2 text-base font-normal text-muted">{coin.name}</span>
          </h2>
          <p className="text-sm text-muted">رتبه {coin.rank}</p>
        </div>
      </div>

      <p dir="ltr" className="mt-3 font-mono text-3xl">
        {formatPrice(coin.price)}
      </p>
      <p className="mt-1 font-mono text-sm">
        <span dir="ltr" className={pctClass(coin.change1h)}>
          ۱س {formatPct(coin.change1h)}
        </span>
        <span className="text-muted"> · </span>
        <span dir="ltr" className={pctClass(coin.change24h)}>
          ۲۴س {formatPct(coin.change24h)}
        </span>
        <span className="text-muted"> · </span>
        <span dir="ltr" className={pctClass(coin.change7d)}>
          ۷ر {formatPct(coin.change7d)}
        </span>
      </p>

      <PriceChart coin={coin} />

      {trade ? (
        <>
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="font-medium">
              {s.grade === "A" ? "ستاپ عالی" : "ستاپ معتبر"} · {s.headline}
            </p>
            <span className="font-mono text-sm text-muted">امتیاز {s.score}</span>
          </div>
          {s.entryKind === "limit" && s.gapPct != null ? (
            <p className="mt-1 text-sm text-muted">
              ورود {formatPct(Math.abs(s.gapPct))} {s.side === "short" ? "بالاتر" : "پایین‌تر"} از قیمت فعلی است. تا رسیدنش به ورود، معامله باز نیست.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">قیمت در ناحیه ورود است. می‌شود لحظه‌ای وارد شد.</p>
          )}

          <div className="mt-3 grid gap-2">
            <LevelButton
              id="entry"
              label={s.entryKind === "limit" ? "ورود لیمیت" : "ورود لحظه‌ای"}
              value={s.entry}
              copied={copied}
              onCopy={copy}
            />
            <LevelButton id="stop" label="حد ضرر" value={s.stop} copied={copied} onCopy={copy} />
            <LevelButton id="tp1" label="هدف ۱ · بستن ۴۰٪" value={s.tp1} copied={copied} onCopy={copy} />
            <LevelButton id="tp2" label="هدف ۲ · بستن ۴۰٪" value={s.tp2} copied={copied} onCopy={copy} />
            {s.tp3 != null ? (
              <LevelButton id="tp3" label="هدف ۳ · باقی‌مانده" value={s.tp3} copied={copied} onCopy={copy} />
            ) : null}
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-2">
            <Mini label="ریسک" value={s.riskPct == null ? "—" : `${s.riskPct.toFixed(2)}%`} />
            <Mini label="R:R" value={s.rr == null ? "—" : s.rr.toFixed(2)} />
            <Mini label="RSI" value={s.rsi == null ? "—" : s.rsi.toFixed(1)} />
          </dl>

          <p className="mt-3 text-sm text-muted">
            بعد از هدف ۱، حد ضرر را به قیمت ورود بیاورید. اگر به هدف ۲ نرسید، همین کار بخش زیادی از باخت‌ها را کوچک می‌کند.
          </p>

          <Sizer entry={s.entry ?? coin.price} stop={s.stop ?? coin.price} />

          <button
            type="button"
            onClick={() => void copy("plan", plan)}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-line text-sm"
          >
            <Copy className="size-4" />
            {copied === "plan" ? "کپی شد" : "کپی پلن معامله"}
          </button>
        </>
      ) : (
        <p className="mt-4 font-medium">{s.headline}</p>
      )}

      <ul className="mt-4 space-y-2 text-sm text-muted">
        {s.reasons.map((reason) => (
          <li key={reason} className="border-s-2 border-line ps-3">
            {reason}
          </li>
        ))}
      </ul>

      <p className="mt-4 font-mono text-xs text-muted">
        حجم ۲۴س {formatCompact(coin.volume)} · مارکت‌کپ {formatCompact(coin.marketCap)}
        {s.atrPct != null ? ` · ATR ${s.atrPct.toFixed(2)}%` : ""}
      </p>
    </article>
  );
}

function Sizer({ entry, stop }: { entry: number; stop: number }) {
  const [capital, setCapital] = useState("1000");
  const [risk, setRisk] = useState("1");
  const cap = Number(capital);
  const riskPct = Number(risk);
  const riskAbs = Math.abs(entry - stop);
  const valid =
    Number.isFinite(cap) && cap > 0 && Number.isFinite(riskPct) && riskPct > 0 && riskPct < 50 && riskAbs > 0;
  const riskUsd = valid ? (cap * riskPct) / 100 : 0;
  const qty = valid ? riskUsd / riskAbs : 0;
  const notion = qty * entry;
  const lev = cap > 0 ? notion / cap : 0;

  return (
    <div className="mt-4 rounded-md border border-line p-3">
      <p className="text-sm font-medium">اندازه پوزیشن</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block text-xs text-muted">
          سرمایه دلاری
          <input
            inputMode="decimal"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 font-mono text-sm text-fg"
            dir="ltr"
          />
        </label>
        <label className="block text-xs text-muted">
          ریسک هر معامله ٪
          <input
            inputMode="decimal"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-line bg-bg px-3 font-mono text-sm text-fg"
            dir="ltr"
          />
        </label>
      </div>
      {valid ? (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          <Mini label="مبلغ ریسک" value={`$${formatPrice(riskUsd)}`} />
          <Mini label="مقدار" value={formatPrice(qty)} />
          <Mini label="ارزش پوزیشن" value={notion >= 10000 ? `$${formatCompact(notion)}` : `$${formatPrice(notion)}`} />
        </dl>
      ) : (
        <p className="mt-3 text-sm text-muted">سرمایه و درصد ریسک را عددی وارد کنید.</p>
      )}
      {valid && riskPct > 2 ? (
        <p className="mt-2 text-sm text-down">ریسک بالای ۲٪ برای این مدل تهاجمی است.</p>
      ) : null}
      {valid && lev > 1.05 ? (
        <p className="mt-2 text-sm text-muted">
          ارزش پوزیشن حدود {lev.toFixed(1)} برابر سرمایه است. در اسپات این حجم جا نمی‌شود؛ در فیوچرز یعنی اهرم.
        </p>
      ) : null}
    </div>
  );
}

function LevelButton({
  id,
  label,
  value,
  copied,
  onCopy,
}: {
  id: string;
  label: string;
  value: number | null;
  copied: string | null;
  onCopy: (id: string, text: string) => void;
}) {
  const text = value == null ? "" : String(value);
  return (
    <button
      type="button"
      onClick={() => value != null && onCopy(id, text)}
      className="flex h-12 items-center justify-between gap-3 rounded-md border border-line bg-bg px-3"
    >
      <span className="text-sm text-muted">{copied === id ? "کپی شد" : label}</span>
      <span dir="ltr" className="inline-flex items-center gap-2 font-mono text-sm">
        {formatPrice(value)}
        <Copy className="size-3.5 text-muted" aria-hidden="true" />
      </span>
    </button>
  );
}

function PriceChart({ coin }: { coin: CoinRow }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const data = coin.spark.map((v, t) => ({ t, v }));
  const s = coin.signal;
  const marks = [coin.price, s.entry, s.stop, s.tp2].filter((n): n is number => n != null && Number.isFinite(n));
  const min = Math.min(...coin.spark, ...marks);
  const max = Math.max(...coin.spark, ...marks);
  const pad = (max - min) * 0.12 || coin.price * 0.02;
  const stroke = s.side === "short" ? "var(--color-down)" : s.side === "long" ? "var(--color-up)" : "var(--color-fg)";

  return (
    <div className="mt-4 h-52 w-full" dir="ltr">
      {ready ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-line)" vertical={false} />
            <YAxis
              domain={[min - pad, max + pad]}
              orientation="right"
              tickFormatter={(v: number) => formatPrice(v)}
              tick={{ fill: "var(--color-muted)", fontSize: 12 }}
              width={72}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const raw = payload[0]?.value;
                const value = typeof raw === "number" ? raw : null;
                return (
                  <div className="rounded-md border border-line bg-bg px-2 py-1 font-mono text-xs">
                    {formatPrice(value)}
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="v" stroke={stroke} dot={false} strokeWidth={2} isAnimationActive={false} />
            {s.entry != null ? (
              <ReferenceLine y={s.entry} stroke="var(--color-fg)" strokeDasharray="4 4" />
            ) : null}
            {s.stop != null ? <ReferenceLine y={s.stop} stroke="var(--color-down)" strokeDasharray="3 3" /> : null}
            {s.tp2 != null ? <ReferenceLine y={s.tp2} stroke="var(--color-up)" strokeDasharray="3 3" /> : null}
          </LineChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

function CoinMark({ coin, eager }: { coin: CoinRow; eager: boolean }) {
  const [broken, setBroken] = useState(false);
  if (!coin.image || broken) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-sm">
        {coin.symbol.slice(0, 1)}
      </span>
    );
  }
  return (
    <img
      src={coin.image}
      alt=""
      width={40}
      height={40}
      loading={eager ? "eager" : "lazy"}
      className="size-10 shrink-0 rounded-md bg-surface-2"
      onError={() => setBroken(true)}
    />
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "up" | "down";
}) {
  const color = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-fg";
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`mt-1 font-mono text-xl ${color}`}>{value}</dd>
      {hint ? <p className="mt-1 font-mono text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2 px-2 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd dir="ltr" className="mt-1 text-left font-mono text-sm text-fg">
        {value}
      </dd>
    </div>
  );
}

function Chip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={
        "h-11 rounded-md px-3 text-sm " +
        (pressed ? "bg-up font-medium text-up-ink" : "border border-line bg-surface text-fg")
      }
    >
      {children}
    </button>
  );
}

function badgeOf(signal: Signal): { label: string; className: string } {
  if (signal.side === "long" || signal.side === "short") {
    const grade = signal.grade === "A" ? "عالی" : "معتبر";
    const tone = signal.side === "long" ? "bg-up text-up-ink" : "bg-down text-down-ink";
    return { label: `${grade} · ${signal.headline}`, className: tone };
  }
  if (signal.side === "stable") return { label: "استیبل", className: "bg-surface-2 text-muted" };
  return { label: "بدون ورود", className: "bg-surface-2 text-muted" };
}

function pctClass(n: number | null): string {
  if (n == null || n === 0) return "text-muted";
  return n > 0 ? "text-up" : "text-down";
}

function countSide(coins: CoinRow[], filter: Filter): number {
  if (filter === "long") return coins.filter((c) => c.signal.side === "long").length;
  if (filter === "short") return coins.filter((c) => c.signal.side === "short").length;
  if (filter === "active") {
    return coins.filter((c) => c.signal.side === "long" || c.signal.side === "short").length;
  }
  return coins.length;
}

function compare(a: CoinRow, b: CoinRow, sort: Sort): number {
  if (sort === "rank") return a.rank - b.rank;
  if (sort === "change") return (b.change24h ?? -1e9) - (a.change24h ?? -1e9);
  if (sort === "risk") return (a.signal.riskPct ?? 1e9) - (b.signal.riskPct ?? 1e9);
  const as = a.signal.side === "long" || a.signal.side === "short" ? a.signal.score : -1;
  const bs = b.signal.side === "long" || b.signal.side === "short" ? b.signal.score : -1;
  if (bs !== as) return bs - as;
  return a.rank - b.rank;
}

function regimeOf(coins: CoinRow[]): "up" | "down" | "mixed" {
  const set = coins.filter((c) => c.signal.side !== "stable");
  const up = set.filter((c) => c.signal.trend === "up").length;
  const down = set.filter((c) => c.signal.trend === "down").length;
  if (down > up * 1.35 && down > set.length * 0.28) return "down";
  if (up > down * 1.35 && up > set.length * 0.28) return "up";
  return "mixed";
}
