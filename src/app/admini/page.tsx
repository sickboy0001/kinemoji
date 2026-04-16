import { auth } from "@/auth";
import AdminiPage from "@/components/pages/admini/admini";
import { isAdministrator } from "@/lib/user";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理者用ダッシュボード | ChoitameLab",
};

export default async function AdminiPageWrapper() {
  const session = await auth();
  const isAdmin = await isAdministrator(session?.user?.email);

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h1 className="text-xl font-bold mb-2">アクセス権限がありません</h1>
          <p>このページは管理者のみがアクセスできます。</p>
        </div>
      </div>
    );
  }

  return <AdminiPage />;
}
