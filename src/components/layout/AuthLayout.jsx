import { Bot } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bot className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Receptionist</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Your intelligent front desk solution
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
