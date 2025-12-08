import { Copy, RefreshCw, Trash2 } from "lucide-react";

const UserTable = ({
  users,
  currentUser,
  onDeleteClick,
  onCopyPassword,
  onRegeneratePassword
}) => {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institute
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-start">
            {users.map((tableUser) => (
              <tr key={tableUser.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 wrap-words max-w-xs">
                  <div className="text-sm font-medium text-gray-900">{tableUser.userId}</div>
                </td>
                <td className="px-6 py-4 wrap-words max-w-xs">
                  <div className="text-sm text-gray-900">{tableUser.fullName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${tableUser.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : tableUser.role === "institute"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                    }`}>
                    {tableUser.role}
                  </span>
                </td>
                <td className="px-6 py-4 wrap-words max-w-xs">
                  <div className="text-sm text-gray-900">{tableUser.instituteName || "-"}</div>
                </td>
                <td className="px-6 py-4 wrap-words max-w-xs">
                  <div className="text-sm text-gray-900">{tableUser.email || "-"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">••••••••</span>
                    <button
                      onClick={() => onCopyPassword(tableUser.userId)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors"
                      title="Copy password"
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onRegeneratePassword(tableUser.userId, tableUser.fullName)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50 transition-colors"
                      title="Regenerate password"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onDeleteClick(tableUser.userId, tableUser.fullName)}
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded-full hover:bg-red-50 transition-colors"
                    disabled={tableUser.role === "admin" && tableUser.userId === currentUser?.userId}
                    title="Delete user"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
