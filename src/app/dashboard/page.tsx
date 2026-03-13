import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { logout } from "@/server/auth/actions";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Sign out
            </button>
          </form>
        </div>
        <p className="mt-4 text-gray-600">
          Welcome to Chore Champ! More features coming soon.
        </p>
      </div>
    </main>
  );
}
