"use client";

import { useEffect, useState } from "react";
import { useAppContext } from "@/context/app-context";
import { Model } from "@/types";
import { useRouter } from "next/navigation";

// Dữ liệu kích thước tệp từ hình ảnh (MB)
const modelFileSizes: Record<string, number> = {
  "yolo_11n_version_1.onnx": 10.367,
  "yolo_11n_version_1.pt": 5.345,
  "yolo_11s_version_1.onnx": 18.580,
  "yolo_11s_version_1.pt": 18.734,
  "yolo_v8_version_1.onnx": 11.992,
  "yolo_v8_version_1.pt": 21.994,
  "yolo_v8_version_2.onnx": 43.716,
  "yolo_v8_version_2.pt": 22.000,
  "best.pt": 22.000,
};

const ModelManagementPage = () => {
  const {
    user,
    models,
    modelNames,
    currentModel,
    setCurrentModel,
    getModelStatistics,
    changeModel,
    modelStatistics,
    error: contextError,
  } = useAppContext();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model | null>(currentModel);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Xử lý lỗi từ context
  useEffect(() => {
    if (contextError) {
      setLocalError(contextError);
    }
  }, [contextError]);

  // Cập nhật selectedModel khi currentModel thay đổi
  useEffect(() => {
    setSelectedModel(currentModel);
  }, [currentModel]);

  // Lấy thống kê cho tất cả mô hình chỉ khi tải trang lần đầu
  useEffect(() => {
    if (user && modelNames.length > 0 && isInitialLoad) {
      setIsLoading(true);
      Promise.all(
        modelNames.map((modelName) => getModelStatistics(modelName))
      )
        .catch((err) => {
          setLocalError("Không thể lấy thống kê mô hình: " + (err as Error).message);
        })
        .finally(() => {
          setIsLoading(false);
          setIsInitialLoad(false); // Ngăn gọi lại sau lần đầu
        });
    }
  }, [user, modelNames, getModelStatistics, isInitialLoad]);

  // Xử lý chọn mô hình
  const handleModelSelect = async (modelName: string) => {
    setIsLoading(true);
    try {
      // Tìm mô hình đầu tiên có model_name tương ứng để đại diện
      const modelToSelect = models.find((model) => model.model_name === modelName);
      if (!modelToSelect) {
        throw new Error(`Không tìm thấy mô hình với tên ${modelName}`);
      }
      await changeModel(modelToSelect.model_name, modelToSelect.model_format, modelToSelect.path || "");
      setCurrentModel(modelToSelect); // Cập nhật currentModel trong context
      setSelectedModel(modelToSelect); // Đồng bộ selectedModel
      setLocalError(null);
    } catch (err) {
      setLocalError("Không thể thay đổi mô hình: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý mô hình</h1>

      {/* Hiển thị lỗi nếu có */}
      {(localError || contextError) && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
          {localError || contextError}
        </div>
      )}

      {/* Hiển thị trạng thái tải */}
      {isLoading && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg text-yellow-700">
          Đang tải thông số mô hình...
        </div>
      )}

      {/* Danh sách mô hình */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Danh sách mô hình</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Tên mô hình</th>
                <th className="px-4 py-2 text-left">Phiên bản</th>
                <th className="px-4 py-2 text-left">Người dùng phản hồi</th>
                <th className="px-4 py-2 text-left">Dự đoán hình ảnh</th>
                <th className="px-4 py-2 text-left">Dự đoán webcam</th>
                <th className="px-4 py-2 text-left">Độ chính xác (%)</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {modelNames.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                    Không có mô hình nào
                  </td>
                </tr>
              ) : (
                modelNames.map((modelName) => {
                  // Lấy tất cả các mô hình có model_name tương ứng
                  const relatedModels = models.filter((model) => model.model_name === modelName);
                  if (relatedModels.length === 0) return null;

                  // Chọn mô hình đầu tiên để lấy thống kê
                  const representativeModel = relatedModels[0];
                  const stats = modelStatistics[representativeModel.model_name] || {
                    image_inference_count: 0,
                    live_inference_count: 0,
                    number_of_responses: 0,
                    accuracy: null,
                  };

                  // Gán trực tiếp các giá trị từ stats
                  const totalImageInferenceCount = stats.image_inference_count;
                  const totalLiveInferenceCount = stats.live_inference_count;
                  const totalNumberOfResponses = stats.number_of_responses;
                  const accuracy =
                    stats.accuracy !== null ? `${(stats.accuracy*100).toFixed(2)}%` : "N/A";

                  // Lấy danh sách định dạng
                  const formats = relatedModels.map((model) => model.model_format).join(", ");

                  // Lấy danh sách đường dẫn
                  const paths = relatedModels.map((model) => model.path || "Chưa có").join(", ");

                  // Trích xuất phiên bản từ model_name
                  const versionMatch = modelName.match(/version_(\d+)/);
                  const version = versionMatch ? versionMatch[1] : modelName === "best" ? "N/A" : "N/A";

                  return (
                    <tr
                      key={modelName}
                      className={`border-t ${
                        selectedModel?.model_name === modelName ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2">{modelName.split("_version")[0]}</td>
                      <td className="px-4 py-2">{version}</td>
                      <td className="px-4 py-2">{totalNumberOfResponses}</td>
                      <td className="px-4 py-2">{totalImageInferenceCount}</td>
                      <td className="px-4 py-2">{totalLiveInferenceCount}</td>
                      <td className="px-4 py-2">{accuracy}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleModelSelect(modelName)}
                          disabled={isLoading || selectedModel?.model_name === modelName}
                          className={`px-3 py-1 rounded ${
                            selectedModel?.model_name === modelName
                              ? "bg-blue-500 text-white cursor-not-allowed"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                          {selectedModel?.model_name === modelName ? "Đang chọn" : "Chọn"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelManagementPage;