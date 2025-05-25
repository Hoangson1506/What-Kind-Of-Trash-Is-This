"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAppContext } from "@/context/app-context"
import { Database, ImageIcon, MessageSquare, MessageCircle, LogOut } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, currentModel, unverifiedSamplesCount, pendingFeedbacksCount, approvedFeedbacksCount } =
    useAppContext()

  const navigation = [
    {
      name: "Model Management",
      href: "/adminwaste/model-management",
      icon: Database,
      count: null,
    },
    {
      name: "Data Moderation",
      href: "/adminwaste/data-moderation",
      icon: ImageIcon,
      count: unverifiedSamplesCount,
    },
    {
      name: "Iterate Feedbacks",
      href: "/adminwaste/iterate-feedbacks",
      icon: MessageSquare,
      count: pendingFeedbacksCount,
    },
    {
      name: "User Feedbacks",
      href: "/adminwaste/user-feedbacks",
      icon: MessageCircle,
      count: approvedFeedbacksCount,
    },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Waste Classification</h1>
      </div>

      <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
        <p className="text-xs text-blue-600 font-medium">Current Model</p>
        <p className="text-sm font-semibold text-blue-800">
          {currentModel ? currentModel.model_name : "No model selected"}
        </p>
      </div>

      <div className="flex flex-col justify-between flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.name}</span>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isActive ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </a>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 font-medium">
                {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-900">{user?.username || "Guest"}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}