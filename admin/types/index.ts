// @/types/index.ts
export type VerificationStatus = "unverified" | "verified" | "disproved";
export interface UserContributedData {
  data_id: number;
  image_path: string;
  labels: Record<string, any>;  // hoặc string[] nếu labels là array
  added_at: string;  // ISO timestamp
  status: VerificationStatus
}
export interface UserResponseData {
  response_id: number;
  image_path: string;
  is_right: boolean;
  comment: string;
  model_used: string;
  added_at: string;  // ISO timestamp
  status: VerificationStatus
}
export interface ModelStatistics {
  image_inference_count: number;
  live_inference_count: number;
  number_of_responses: number;
  accuracy: number | null;  // vì có thể không có phản hồi nào
}
export interface OperationResult {
  status: "success";
  message: string;
}
interface VerifyDataRequest {
  data_id: number;
}
interface VerifyResponseRequest {
  response_id: number;
}
export interface BaseModel{
  model_name: string;
  model_format: string;
  path: string;
}

export type Model = BaseModel & ModelStatistics
export interface User {
  id: string
  username: string
}

export interface AuthData {
  access_token: string
}