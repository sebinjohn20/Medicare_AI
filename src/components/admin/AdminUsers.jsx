"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, Search } from "lucide-react";
import { Card, Badge, EmptyState, Spinner } from "@/components/ui";
import { formatDate, getInitials } from "@/lib/utils";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/admin/users${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) { setUsers(d.users); setTotal(d.total); } })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Patients</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} registered patients</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><Spinner /></div> :
          users.length === 0 ? <EmptyState icon={Users} title="No patients found" description="Patients will appear here after registration" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Patient","Email","Role","Joined","Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-6 py-4 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <Badge className={u.role === "admin" ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-blue-100 text-blue-700 border-blue-200"}>{u.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4">
                        <Badge className={u.isActive !== false ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                          {u.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>
    </div>
  );
}
