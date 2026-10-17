import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { Desk } from "@/components/desk";
import { getBoard } from "@/lib/signals/board.functions";

type Search = { fresh?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    fresh: typeof search.fresh === "string" ? search.fresh : undefined,
  }),
  loaderDeps: ({ search }) => ({ fresh: search.fresh }),
  loader: ({ deps }) => getBoard({ data: { force: Boolean(deps.fresh) } }),
  pendingComponent: Pending,
  component: Home,
});

function Home() {
  const board = Route.useLoaderData();
  const navigate = useNavigate({ from: "/" });
  const loading = useRouterState({ select: (s) => s.isLoading });
  return (
    <Desk
      board={board}
      loading={loading}
      onRefresh={() => {
        void navigate({
          to: "/",
          search: { fresh: String(Date.now()) },
          replace: true,
        });
      }}
    />
  );
}

function Pending() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <p className="text-2xl font-semibold">نبض</p>
      <p className="mt-2 text-muted">قیمت ۱۰۰ ارز از کوین‌گکو گرفته می‌شود…</p>
    </main>
  );
}
