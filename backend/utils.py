import base64
from dotenv import load_dotenv
import os
import uuid
from config import IMG_DIR


def update_env_variable(key, value):
    """Update an environment variable in the .env file.

    Args:
        key (str): The name of the enviroment variable to update.
        value (str): The updated value for the environment variable.
    """

    env_file_path = '.env'

    # Read existing lines and filter out the key if it exists
    lines = []
    found = False

    if os.path.exists(env_file_path):
        with open(env_file_path, 'r') as f:
            for line in f:
                if line.strip().startswith(f"{key}="):
                    lines.append(f"{key}={value}\n")
                    found = True
                else:
                    lines.append(line)

    if not found:
        lines.append(f"{key}={value}\n")

    # Write updated lines back to the file
    with open(env_file_path, 'w') as f:
        f.writelines(lines)

    # Reload into environment
    load_dotenv(dotenv_path=env_file_path, override=True)


async def save_base64_image(base64_str: str, image_id: str = None, folder: str = IMG_DIR) -> str:
    """
    Save the base64 image string to a file.
    Args:
        base64_str (str): The base64 image string.
        folder (str): The folder to save the image.
    """
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]

    try:
        image_data = base64.b64decode(base64_str)
    except Exception as e:
        raise ValueError("Invalid base64 image string") from e

    # Tạo tên file ngẫu nhiên
    if (image_id):
        filename = f"{image_id}.jpg"
    else:
        filename = f"{uuid.uuid4().hex}.jpg"
    filepath = os.path.join(folder, filename)
    print(f"Saving image to {filepath}")

    # Ghi file
    with open(filepath, "wb") as f:
        f.write(image_data)

    # Trả về path tương đối (để lưu vào DB)
    return os.path.join("/images", filename)
