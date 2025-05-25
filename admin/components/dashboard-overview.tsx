import { useAppContext } from "@/context/app-context"

export default function DashboardOverview() {
  const { models, currentModel, imageData, feedbacks } = useAppContext()

  // Calculate stats
  const approvedImages = imageData.filter((img) => img.status === "verified").length
  const pendingImages = imageData.filter((img) => img.status === "unverified").length
  const approvedFeedbacks = feedbacks.filter((f) => f.status === "verified").length
  const pendingFeedbacks = feedbacks.filter((f) => f.status === "unverified").length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">Current Model</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900">{currentModel?.model_name}</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">Available Models</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900">{models.length}</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">Images Moderated</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900">{approvedImages}</p>
          <p className="text-sm text-gray-500 mt-1">Pending: {pendingImages}</p>
        </div>

        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-700">Approved Feedbacks</h2>
          <p className="mt-2 text-2xl font-bold text-gray-900">{approvedFeedbacks}</p>
          <p className="text-sm text-gray-500 mt-1">Pending: {pendingFeedbacks}</p>
        </div>
      </div>
    </div>
  )
}
