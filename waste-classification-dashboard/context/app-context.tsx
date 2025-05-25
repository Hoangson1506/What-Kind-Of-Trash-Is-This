"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, Model, UserContributedData as ImageData, UserResponseData as Feedback, AuthData, ModelStatistics, VerificationStatus } from "@/types";
import axios, { AxiosError } from "axios";

// Định nghĩa interface cho AppContext
interface AppContextType {
  user: User | null;
  login: (user: User, authData: AuthData) => void;
  logout: () => void;
  models: Model[];
  currentModel: Model | null;
  setCurrentModel: (model: Model) => void;
  imageData: ImageData[];
  approveImage: (data_id: number) => void;
  rejectImage: (data_id: number) => void;
  feedbacks: Feedback[];
  verifiedFeedbacks: Feedback[];
  approveFeedback: (response_id: number) => void;
  rejectFeedback: (response_id: number) => void;
  unverifiedSamplesCount: number;
  pendingFeedbacksCount: number;
  approvedFeedbacksCount: number;
  changeModel: (modelName: string, modelFormat: string, newPath: string) => void;
  getDataByStatus: (status: VerificationStatus) => Promise<void>;
  getResponseByStatus: (status: VerificationStatus) => Promise<void>;
  deleteDisapprovedImage: (data_id: number) => void;
  deleteDisapprovedResponse: (response_id: number) => void;
  modelStatistics: Record<string, ModelStatistics>;
  getModelStatistics: (modelName?: string) => Promise<void>;
  modelNames: string[];
  error: string | null;
  setError: (error: string | null) => void;
}

const FIXED_MODEL_LIST: Omit<Model, keyof ModelStatistics>[] = [
  { model_name: "yolo_11n_version_1", model_format: "onnx", path: "/models/yolo_11n_version_1.onnx" },
  { model_name: "yolo_11n_version_1", model_format: "pt", path: "/models/yolo_11n_version_1.pt" },
  { model_name: "yolo_11s_version_1", model_format: "onnx", path: "/models/yolo_11s_version_1.onnx" },
  { model_name: "yolo_11s_version_1", model_format: "pt", path: "/models/yolo_11s_version_1.pt" },
  { model_name: "yolo_v8n_version_1", model_format: "pt", path: "/models/yolo_v8n_version_1.pt" },
  { model_name: "yolo_v8s_version_1", model_format: "pt", path: "/models/yolo_v8s_version_1.pt" },
  { model_name: "yolo_v8s_version_2", model_format: "onnx", path: "/models/yolo_v8s_version_2.onnx" },
  { model_name: "yolo_v8s_version_2", model_format: "pt", path: "/models/yolo_v8s_version_2.pt" },
  { model_name: "yolo_v8n_version_1", model_format: "onnx", path: "/models/yolo_v8n_version_1.onxx" },
  { model_name: "best", model_format: "pt", path: "/models/best.pt" },
];

// Tạo context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Local storage keys
const STORAGE_KEYS = {
  USER: "wasteAdmin:user",
  CURRENT_MODEL: "wasteAdmin:currentModel",
  IMAGE_DATA: "wasteAdmin:imageData",
  FEEDBACKS: "wasteAdmin:feedbacks",
  VERIFIED_FEEDBACKS: "wasteAdmin:verified_feedbacks",
};
const AUTH_TOKEN = {
  AUTH_TOKEN: "wasteAdmin:auth_token",
};

// Component AppProvider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [imageData, setImageData] = useState<ImageData[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [verifiedFeedbacks, setVerifiedFeedbacks] = useState<Feedback[]>([]);
  const [modelStatistics, setModelStatistics] = useState<Record<string, ModelStatistics>>({});
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo currentModel từ localStorage trước
  useEffect(() => {
    const storedCurrentModel = localStorage.getItem(STORAGE_KEYS.CURRENT_MODEL);
    if (storedCurrentModel) {
      try {
        const parsedModel = JSON.parse(storedCurrentModel);
        if (parsedModel && parsedModel.model_name) {
          setCurrentModel(parsedModel);
        }
      } catch (err) {
        console.error("Không thể phân tích mô hình hiện tại từ localStorage:", err);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MODEL);
      }
    }
  }, []);

  // Khởi tạo dữ liệu từ localStorage
  // Trong useEffect khởi tạo dữ liệu từ localStorage
useEffect(() => {
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Không thể phân tích dữ liệu người dùng từ localStorage:", err);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  const storedImageData = localStorage.getItem(STORAGE_KEYS.IMAGE_DATA);
  if (storedImageData) {
    try {
      const parsedData = JSON.parse(storedImageData);
      const transformedData = parsedData.map((item: any) => ({
        data_id: item.data_id || 0,
        image_path: item.image_path || item.image || "",
        labels: Array.isArray(item.labels)
          ? item.labels.map((label: any) => ({
              trashType: label.trashType || "Unknown",
              bbox: Array.isArray(label.bbox) ? label.bbox.map(Number) : [],
            }))
          : null, 
        status: ["unverified", "verified", "disproved"].includes(item.status)
          ? item.status
          : "unverified",
        model_used: item.model_used || "",
        added_at: item.added_at || new Date().toISOString(),
      }));
      setImageData(transformedData);
    } catch (err) {
      console.error("Không thể phân tích dữ liệu hình ảnh từ localStorage:", err);
    }
  }

    const storedFeedbacks = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    if (storedFeedbacks) {
      try {
        const parsedFeedbacks = JSON.parse(storedFeedbacks);
        const transformedFeedbacks = parsedFeedbacks.map((feedback: any) => ({
          response_id: feedback.response_id || feedback.data_id || parseInt(feedback.id, 10) || 0,
          image_path: feedback.image_path || feedback.image_url || "",
          is_right: typeof feedback.is_right === "boolean" ? feedback.is_right : feedback.is_right === "Yes",
          comment: feedback.comment || "",
          status: ["unverified", "verified", "disproved"].includes(feedback.status)
            ? feedback.status
            : "unverified",
          model_used: feedback.model_used || feedback.modelName || "unknown",
          added_at: feedback.added_at || new Date().toISOString(),
        }));
        setFeedbacks(transformedFeedbacks);
      } catch (err) {
        console.error("Không thể phân tích dữ liệu phản hồi từ localStorage:", err);
        localStorage.removeItem(STORAGE_KEYS.FEEDBACKS);
      }
    }

    const storedVerifiedFeedbacks = localStorage.getItem(STORAGE_KEYS.VERIFIED_FEEDBACKS);
    if (storedVerifiedFeedbacks) {
      try {
        const parsedFeedbacks = JSON.parse(storedVerifiedFeedbacks);
        const transformedVerifiedFeedbacks = parsedFeedbacks
          .filter((feedback: any) => feedback.status === "verified")
          .map((feedback: any) => ({
            response_id: feedback.response_id || feedback.data_id || parseInt(feedback.id, 10) || 0,
            image_path: feedback.image_path || feedback.image_url || "",
            is_right: typeof feedback.is_right === "boolean" ? feedback.is_right : feedback.is_right === "Yes",
            comment: feedback.comment || "",
            status: "verified",
            model_used: feedback.model_used || feedback.modelName || "unknown",
            added_at: feedback.added_at || new Date().toISOString(),
          }));
        setVerifiedFeedbacks(transformedVerifiedFeedbacks);
      } catch (err) {
        console.error("Không thể phân tích dữ liệu phản hồi đã verified từ localStorage:", err);
        localStorage.removeItem(STORAGE_KEYS.VERIFIED_FEEDBACKS);
      }
    }
  }, []);

  // Lấy dữ liệu ban đầu từ API
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
    if (!token) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [modelsRes, imagesRes, feedbacksRes, verifiedFeedbacksRes] = await Promise.all([
          axios.get("http://localhost:8000/admin/get-model-statistics", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.warn("Không có thống kê mô hình tổng quát:", err);
            return { data: {} };
          }),
          axios.get("http://localhost:8000/admin/get-data/unverified", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.warn("Không có dữ liệu hình ảnh unverified:", err);
            return { data: [] };
          }),
          axios.get("http://localhost:8000/admin/get-response/unverified", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.warn("Không có phản hồi unverified:", err);
            return { data: [] };
          }),
          axios.get("http://localhost:8000/admin/get-response/verified", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.warn("Không có phản hồi verified:", err);
            return { data: [] };
          }),
        ]);

        // Models
        const stats: Record<string, ModelStatistics> = {};
        const modelList: Model[] = FIXED_MODEL_LIST.map((fixedModel) => {
          const defaultStats: ModelStatistics = {
            image_inference_count: 0,
            live_inference_count: 0,
            number_of_responses: 0,
            accuracy: null,
          };
          stats[fixedModel.model_name] = defaultStats;
          return {
            ...fixedModel,
            ...defaultStats,
          };
        });

        for (const model of modelList) {
          try {
            const response = await axios.get(
              `http://localhost:8000/admin/get-model-statistics?model_name=${model.model_name}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const data = response.data;
            if (data && typeof data === "object") {
              const modelStats: ModelStatistics = {
                image_inference_count: Number(data.image_inference_count) || 0,
                live_inference_count: Number(data.live_inference_count) || 0,
                number_of_responses: Number(data.number_of_responses) || 0,
                accuracy: data.accuracy !== undefined ? Number(data.accuracy) : null,
              };
              stats[model.model_name] = modelStats;
              const updatedModel: Model = {
                ...model,
                ...modelStats,
              };
              modelList[modelList.findIndex((m) => m.model_name === model.model_name)] = updatedModel;
            }
          } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
              console.log(`Chưa có dữ liệu thống kê cho mô hình ${model.model_name}`);
            } else {
              console.error(`Lỗi khi lấy thống kê cho ${model.model_name}:`, err);
            }
            stats[model.model_name] = {
              image_inference_count: 0,
              live_inference_count: 0,
              number_of_responses: 0,
              accuracy: null,
            };
          }
        }

        setModels(modelList);
        setModelStatistics(stats);

        // Image Data
        const imageList: ImageData[] = imagesRes.data.map((item: any) => ({
          data_id: Number(item.data_id) || 0,
          image_path: item.image_path || item.image || "",
          labels: Array.isArray(item.labels)
          ? item.labels.map((label: any) => ({
              trashType: label.trashType || "Unknown",
              bbox: Array.isArray(label.bbox) ? label.bbox.map(Number) : [],
            }))
          : null,
          status: ["unverified", "verified", "disproved"].includes(item.status)
            ? item.status
            : "unverified",
          model_used: item.model_used || "",
          added_at: item.added_at || new Date().toISOString(),
        }));
        setImageData(imageList);
        localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, JSON.stringify(imageList));

        // Feedbacks (unverified)
        const unverifiedFeedbackList: Feedback[] = feedbacksRes.data.map((feedback: any) => ({
          response_id: feedback.response_id || parseInt(feedback.id, 10) || 0,
          image_path: feedback.image_path || feedback.image || "",
          is_right: typeof feedback.is_right === "boolean" ? feedback.is_right : feedback.is_right === "Yes",
          comment: feedback.comment || "",
          status: "unverified",
          model_used: feedback.model_used || feedback.modelName || "unknown",
          added_at: feedback.added_at || new Date().toISOString(),
        }));
        setFeedbacks(unverifiedFeedbackList);
        localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(unverifiedFeedbackList));

        // Verified Feedbacks
        const verifiedFeedbackList: Feedback[] = verifiedFeedbacksRes.data.map((feedback: any) => ({
          response_id: feedback.response_id || parseInt(feedback.id, 10) || 0,
          image_path: feedback.image_path || feedback.image || "",
          is_right: typeof feedback.is_right === "boolean" ? feedback.is_right : feedback.is_right === "Yes",
          comment: feedback.comment || "",
          status: "verified",
          model_used: feedback.model_used || feedback.modelName || "unknown",
          added_at: feedback.added_at || new Date().toISOString(),
        }));
        setVerifiedFeedbacks(verifiedFeedbackList);
        localStorage.setItem(STORAGE_KEYS.VERIFIED_FEEDBACKS, JSON.stringify(verifiedFeedbackList));

        setError(null);
      } catch (err) {
        setError("Lỗi khi lấy dữ liệu khởi tạo: " + (err as Error).message);
      }
    };

    fetchInitialData();
  }, []);

  // Lấy thống kê mô hình từ API
  const getModelStatistics = useCallback(async (modelName?: string) => {
    const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
    if (!token) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    const nameToFetch = modelName || currentModel?.model_name || "yolo_11n_version_1";
    console.log(`Fetching statistics for model_name: ${nameToFetch}`);
    try {
      const response = await axios.get(
        `http://localhost:8000/admin/get-model-statistics?model_name=${nameToFetch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Response data:", response.data);
      const data = response.data;
      if (!data || typeof data !== "object") {
        setError("Dữ liệu phản hồi không hợp lệ");
        return;
      }

      const stats: ModelStatistics = {
        image_inference_count: Number(data.image_inference_count) || 0,
        live_inference_count: Number(data.live_inference_count) || 0,
        number_of_responses: Number(data.number_of_responses) || 0,
        accuracy: data.accuracy !== undefined ? Number(data.accuracy) : null,
      };

      setModelStatistics((prev) => ({
        ...prev,
        [nameToFetch]: stats,
      }));

      const updatedModel: Model = {
        model_name: nameToFetch,
        model_format: models.find((m) => m.model_name === nameToFetch)?.model_format || "",
        path: models.find((m) => m.model_name === nameToFetch)?.path || "",
        ...stats,
      };

      setModels((prevModels) =>
        prevModels.map((model) =>
          model.model_name === updatedModel.model_name ? updatedModel : model
        )
      );
      if (currentModel?.model_name === nameToFetch) {
        setCurrentModel(updatedModel);
      }
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        console.log(`Chưa có dữ liệu thống kê cho mô hình ${nameToFetch}`);
      } else {
        console.error("Error details:", (err as AxiosError)?.response?.data, (err as AxiosError)?.response?.status);
        setError("Không thể lấy thống kê mô hình: " + (err as Error).message);
      }
    }
  }, [currentModel, models]);

  // Lấy dữ liệu phản hồi theo trạng thái
  const getResponseByStatus = useCallback(async (status: VerificationStatus) => {
    const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
    if (!token) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/admin/get-response/${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!Array.isArray(response.data)) {
        setError("Dữ liệu phản hồi không đúng định dạng");
        return;
      }

      const transformedFeedbacks = response.data.map((feedback: any) => ({
        response_id: feedback.response_id || feedback.data_id || parseInt(feedback.id, 10) || 0,
        image_path: feedback.image_path || feedback.image || "",
        is_right: typeof feedback.is_right === "boolean" ? feedback.is_right : feedback.is_right === "Yes",
        comment: feedback.comment || "",
        status: status,
        model_used: feedback.model_used || feedback.modelName || "unknown",
        added_at: feedback.added_at || new Date().toISOString(),
      }));

      // Lọc dữ liệu theo currentModel.model_name nếu có
      const filteredFeedbacks = currentModel
        ? transformedFeedbacks.filter((feedback) => feedback.model_used === currentModel.model_name)
        : transformedFeedbacks;

      if (status === "unverified") {
        setFeedbacks(filteredFeedbacks);
        localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(filteredFeedbacks));
      } else if (status === "verified") {
        setVerifiedFeedbacks(filteredFeedbacks);
        localStorage.setItem(STORAGE_KEYS.VERIFIED_FEEDBACKS, JSON.stringify(filteredFeedbacks));
      }
      setError(null);
    } catch (err) {
      setError("Không thể lấy phản hồi theo trạng thái: " + (err as Error).message);
    }
  }, [currentModel]);

  // Thay đổi mô hình
  const changeModel = useCallback(
    async (model_name: string, model_format: string, path: string) => {
      const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
      if (!token) {
        setError("Không tìm thấy token xác thực");
        return;
      }

      try {
        const response = await axios.put(
          `http://localhost:8000/admin/change-model?model_name=${encodeURIComponent(model_name)}&model_format=${encodeURIComponent(model_format)}`,
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Change model response:", response.data);

        const selectedModel = models.find(
          (model) => model.model_name === model_name && model.model_format === model_format
        );
        if (selectedModel) {
          const updatedModel = { ...selectedModel, path };
          setCurrentModel(updatedModel);
          localStorage.setItem(STORAGE_KEYS.CURRENT_MODEL, JSON.stringify(updatedModel));
          await getModelStatistics(model_name);
          await getResponseByStatus("unverified");
          await getResponseByStatus("verified");
        } else {
          throw new Error(`Không tìm thấy mô hình: ${model_name}.${model_format}`);
        }
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          console.error("Axios error details:", {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message,
            config: err.config,
            code: err.code,
          });
          setError(
            `Không thể thay đổi mô hình: ${err.message} (Code: ${err.code}, Status: ${err.response?.status})`
          );
        } else {
          console.error("Non-Axios error:", err);
          setError("Không thể thay đổi mô hình: " + (err as Error).message);
        }
      }
    },
    [models, getModelStatistics, getResponseByStatus]
  );

  const login = useCallback((userData: User, authData: AuthData) => {
    if (!authData.access_token) {
      throw new Error("Không nhận được token truy cập");
    }
    setUser(userData);
    localStorage.setItem(AUTH_TOKEN.AUTH_TOKEN, authData.access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(AUTH_TOKEN.AUTH_TOKEN);
  }, []);

  const handleSetCurrentModel = useCallback(async (model: Model) => {
    setCurrentModel(model);
    localStorage.setItem(STORAGE_KEYS.CURRENT_MODEL, JSON.stringify(model));
    try {
      await getModelStatistics(model.model_name);
      await getResponseByStatus("unverified");
      await getResponseByStatus("verified");
    } catch (err) {
      console.error("Lỗi khi lấy thống kê mô hình hoặc phản hồi:", err);
    }
  }, [getModelStatistics, getResponseByStatus]);

  const approveImage = useCallback(async (data_id: number) => {
    const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
    if (!token) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8000/admin/verify-data?data_id=${data_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setImageData((prevData) =>
        prevData.map((img) =>
          img.data_id === data_id ? { ...img, status: "verified" as const } : img
        )
      );
    } catch (err) {
      setError("Không thể phê duyệt hình ảnh: " + (err as Error).message);
    }
  }, []);

  const rejectImage = useCallback(async (data_id: number) => {
  const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
  if (!token) {
    setError("Không tìm thấy token xác thực");
    return;
  }

  try {
    await axios.put(
      `http://localhost:8000/admin/disprove-data?data_id=${data_id}`, // Change to query parameter
      {}, // Empty body if not needed
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    setImageData((prevData) =>
      prevData.map((img) =>
        img.data_id === data_id ? { ...img, status: "disproved" as const } : img
      )
    );
  } catch (err) {
    setError("Không thể từ chối hình ảnh: " + (err as Error).message);
  }
}, []);

  const approveFeedback = useCallback(async (response_id: number) => {
  const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
  if (!token) {
    setError("Không tìm thấy token xác thực");
    return;
  }

  // Kiểm tra xem response_id có hợp lệ không
  const feedbackToApprove = feedbacks.find((f) => f.response_id === response_id);
  if (!feedbackToApprove) {
    setError("Không tìm thấy phản hồi để phê duyệt");
    return;
  }

  try {
    await axios.put(
      `http://localhost:8000/admin/verify-response?response_id=${response_id}`, // Sử dụng query parameter
      {}, // Body rỗng vì dữ liệu đã được truyền qua query
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Cập nhật state
    const updatedFeedback = { ...feedbackToApprove, status: "verified" as const };
    const newFeedbacks = feedbacks.filter((feedback) => feedback.response_id !== response_id);
    const newVerifiedFeedbacks = [...verifiedFeedbacks, updatedFeedback];

    // Cập nhật state và localStorage
    setFeedbacks(newFeedbacks);
    setVerifiedFeedbacks(newVerifiedFeedbacks);
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(newFeedbacks));
    localStorage.setItem(STORAGE_KEYS.VERIFIED_FEEDBACKS, JSON.stringify(newVerifiedFeedbacks));
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(`Không thể phê duyệt phản hồi: ${err.response?.data?.detail || err.message}`);
    } else {
      setError("Không thể phê duyệt phản hồi: " + (err as Error).message);
    }
  }
}, [feedbacks, verifiedFeedbacks]);

const rejectFeedback = useCallback(async (response_id: number) => {
  const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
  if (!token) {
    setError("Không tìm thấy token xác thực");
    return;
  }

  // Kiểm tra xem response_id có hợp lệ không
  const feedbackToReject = feedbacks.find((f) => f.response_id === response_id);
  if (!feedbackToReject) {
    setError("Không tìm thấy phản hồi để từ chối");
    return;
  }

  try {
    await axios.put(
      `http://localhost:8000/admin/disprove-response?response_id=${response_id}`, // Sử dụng query parameter
      {}, // Body rỗng vì dữ liệu đã được truyền qua query
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Cập nhật state
    const newFeedbacks = feedbacks.map((feedback) =>
      feedback.response_id === response_id ? { ...feedback, status: "disproved" as const } : feedback
    );

    // Cập nhật state và localStorage
    setFeedbacks(newFeedbacks);
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(newFeedbacks));
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("Axios error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(`Không thể từ chối phản hồi: ${err.response?.data?.detail || err.message}`);
    } else {
      setError("Không thể từ chối phản hồi: " + (err as Error).message);
    }
  }
}, [feedbacks]);

  const getDataByStatus = useCallback(async (status: VerificationStatus) => {
  const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
  if (!token) {
    setError("Không tìm thấy token xác thực");
    return;
  }

  try {
    const response = await axios.get(`http://localhost:8000/admin/get-data/${status}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!Array.isArray(response.data)) {
      setError("Dữ liệu trả về không đúng định dạng");
      return;
    }

    const transformedData: ImageData[] = response.data.map((item: any) => ({
      data_id: Number(item.data_id) || 0,
      image_path: item.image_path || item.image || "",
      labels: Array.isArray(item.labels)
          ? item.labels.map((label: any) => ({
              trashType: label.trashType || "Unknown",
              bbox: Array.isArray(label.bbox) ? label.bbox.map(Number) : [],
            }))
          : null,
      status: ["unverified", "verified", "disproved"].includes(item.status)
        ? (item.status as VerificationStatus)
        : "unverified",
      model_used: item.model_used || "",
      added_at: item.added_at || new Date().toISOString(),
    }));
    setImageData(transformedData);
    localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, JSON.stringify(transformedData));
    setError(null);
  } catch (err) {
    setError("Không thể lấy dữ liệu theo trạng thái: " + (err as Error).message);
  }
}, []);

  const deleteDisapprovedImage = useCallback(async (data_id: number) => {
    const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
    if (!token) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/delete-disproved-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { data_id },
      });
      setImageData((prevData) => {
        const newData = prevData.filter((img) => img.data_id !== data_id);
        localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, JSON.stringify(newData));
        return newData;
      });
    } catch (err) {
      setError("Không thể xóa hình ảnh đã từ chối: " + (err as Error).message);
    }
  }, []);

  const deleteDisapprovedResponse = useCallback(async (response_id: number) => {
    const token = localStorage.getItem(AUTH_TOKEN.AUTH_TOKEN);
    if (!token) {
      setError("Không tìm thấy token xác thực");
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/admin/delete-disproved-response`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { response_id },
      });
      setFeedbacks((prevFeedbacks) => {
        const newFeedbacks = prevFeedbacks.filter((feedback) => feedback.response_id !== response_id);
        localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(newFeedbacks));
        return newFeedbacks;
      });
      setVerifiedFeedbacks((prevVerified) => {
        const newVerified = prevVerified.filter((feedback) => feedback.response_id !== response_id);
        localStorage.setItem(STORAGE_KEYS.VERIFIED_FEEDBACKS, JSON.stringify(newVerified));
        return newVerified;
      });
    } catch (err) {
      setError("Không thể xóa phản hồi đã từ chối: " + (err as Error).message);
    }
  }, []);

  // Tính danh sách model_name duy nhất
  const modelNames = [...new Set(models.map((model) => model.model_name))];

  // Lấy thống kê mô hình khi user hoặc currentModel thay đổi
 useEffect(() => {
  let isMounted = true;
  let timeoutId: NodeJS.Timeout | null = null;

  // Hàm gọi getModelStatistics với điều kiện
  const fetchStatistics = () => {
    if (isMounted && user && currentModel && currentModel.model_name) {
      getModelStatistics(currentModel.model_name);
    }
  };

  // Kiểm tra và trì hoãn gọi API
  if (user && currentModel && currentModel.model_name) {
    // Xóa timeout cũ nếu có
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Thiết lập timeout mới
    timeoutId = setTimeout(fetchStatistics, 500); // Độ trễ 500ms
  }

  // Cleanup
  return () => {
    isMounted = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}, [user, currentModel, getModelStatistics]);

  // Lưu dữ liệu vào localStorage khi state thay đổi
  useEffect(() => {
    if (currentModel) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_MODEL, JSON.stringify(currentModel));
    }
    if (imageData.length > 0) {
      localStorage.setItem(STORAGE_KEYS.IMAGE_DATA, JSON.stringify(imageData));
    }
    if (feedbacks.length > 0) {
      localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
    }
    if (verifiedFeedbacks.length > 0) {
      localStorage.setItem(STORAGE_KEYS.VERIFIED_FEEDBACKS, JSON.stringify(verifiedFeedbacks));
    }
  }, [currentModel, imageData, feedbacks, verifiedFeedbacks]);

  // Log approvedFeedbacksCount mỗi khi nó thay đổi
  const unverifiedSamplesCount = imageData.filter((img) => img.status === "unverified").length;
  const pendingFeedbacksCount = currentModel
    ? feedbacks.filter((f) => f.model_used === currentModel.model_name && f.status === "unverified").length
    : 0;
  const approvedFeedbacksCount = currentModel
    ? verifiedFeedbacks.filter((vf) => vf.model_used === currentModel.model_name && vf.status === "verified").length
    : 0;

  useEffect(() => {
    console.log(
      `Approved Feedbacks Count for model ${currentModel?.model_name || "unknown"}: ${approvedFeedbacksCount}`,
      new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    );
  }, [approvedFeedbacksCount, currentModel]);

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        models,
        currentModel,
        setCurrentModel: handleSetCurrentModel,
        imageData,
        approveImage,
        rejectImage,
        feedbacks,
        verifiedFeedbacks,
        approveFeedback,
        rejectFeedback,
        unverifiedSamplesCount,
        pendingFeedbacksCount,
        approvedFeedbacksCount,
        changeModel,
        getDataByStatus,
        getResponseByStatus,
        deleteDisapprovedImage,
        deleteDisapprovedResponse,
        modelStatistics,
        getModelStatistics,
        modelNames,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook để sử dụng AppContext
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}