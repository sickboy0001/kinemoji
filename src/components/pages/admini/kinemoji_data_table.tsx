"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
} from "lucide-react";

type Kinemoji = {
  id: string;
  shortId: string;
  text: string;
  status: string;
  imageUrl: string | null;
  createdAt: number;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
};

export function KinemojiDataTable() {
  const [kinemojis, setKinemojis] = useState<Kinemoji[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchKinemojis();
  }, []);

  const fetchKinemojis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error("データの取得に失敗しました");
      const data = await response.json();
      setKinemojis(data);
    } catch (error) {
      console.error(error);
      toast.error("データの読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === kinemojis.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(kinemojis.map((k) => k.id)));
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`選択した ${selectedIds.size} 件のデータを削除しますか？`))
      return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/kinemoji", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (!response.ok) throw new Error("削除に失敗しました");

      toast.success(`${selectedIds.size} 件のデータを削除しました`);
      setSelectedIds(new Set());
      fetchKinemojis();
    } catch (error) {
      console.error(error);
      toast.error("削除処理中にエラーが発生しました");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Kinemoji データ管理</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={fetchKinemojis}
            disabled={isLoading}
            className="rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            更新
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={selectedIds.size === 0 || isDeleting}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            選択項目を削除 ({selectedIds.size})
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-bottom border-gray-100">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  checked={
                    kinemojis.length > 0 &&
                    selectedIds.size === kinemojis.length
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 font-semibold text-gray-600 text-sm">
                プレビュー
              </th>
              <th className="p-4 font-semibold text-gray-600 text-sm">
                テキスト
              </th>
              <th className="p-4 font-semibold text-gray-600 text-sm">
                ステータス
              </th>
              <th className="p-4 font-semibold text-gray-600 text-sm">
                作成日時
              </th>
              <th className="p-4 font-semibold text-gray-600 text-sm">ID</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && kinemojis.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  読み込み中...
                </td>
              </tr>
            ) : kinemojis.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400">
                  データが見つかりません
                </td>
              </tr>
            ) : (
              kinemojis.map((k) => (
                <tr
                  key={k.id}
                  className={`border-t border-gray-50 hover:bg-orange-50/30 transition-colors ${selectedIds.has(k.id) ? "bg-orange-50" : ""}`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      checked={selectedIds.has(k.id)}
                      onChange={() => toggleSelect(k.id)}
                    />
                  </td>
                  <td className="p-4">
                    {k.imageUrl ? (
                      <img
                        src={k.imageUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded-md border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center border border-gray-50">
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 max-w-xs">
                      {k.text}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center">
                      {k.status === "completed" ? (
                        <span className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          完了
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                          <Clock className="w-3 h-3 mr-1" />
                          処理中
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {formatDate(k.createdAt)}
                  </td>
                  <td className="p-4 text-xs font-mono text-gray-400">
                    {k.shortId}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
