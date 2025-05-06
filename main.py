from ultralytics import YOLO
import cv2
import argparse
import glob
import os


def load_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Ảnh không tồn tại {image_path}")
    return image


def detect_with_model(model_path, image_path):
    print(f"Đang load mô hình {model_path}")
    model = YOLO(model_path)

    result = model(load_image(image_path))
    result[0].plot()

    for box in result[0].boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = box.xyxy.tolist()
        print(f"Class {cls}, Confidence: {conf:.2f}, Box: {xyxy}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_dir", required=True,
                        help="Tên folder chứa mô hình: (ví dụ: v8n)")
    parser.add_argument("--image", required=True,
                        help="Đường dẫn tới ảnh cần detect")

    args = parser.parse_args()

    pt_files = glob.glob(os.path.join(args.model_dir, "*.pt"))
    if not pt_files:
        raise FileNotFoundError(
            f"Không tìm thấy file .pt trong thư mục {args.model_dir}")

    model_path = pt_files[0]
    detect_with_model(model_path, args.image)
