import io
import logging

import numpy as np
from PIL import Image

from app.models.schemas import OutfitItem
from app.services.tryon_engine import run_tryon

logger = logging.getLogger(__name__)

# Processing order: lower body first, then upper, then dresses, shoes, accessories
CATEGORY_ORDER = {
    "lower_body": 0,
    "upper_body": 1,
    "dresses": 2,
    "shoes": 3,
    "accessories": 4,
}


def sort_by_category_priority(garments: list[OutfitItem]) -> list[OutfitItem]:
    return sorted(garments, key=lambda g: CATEGORY_ORDER.get(g.category, 99))


async def apply_sunglasses(
    base_image: bytes,
    sunglasses_image: bytes,
) -> bytes:
    """Overlay sunglasses using MediaPipe Face Mesh landmarks."""
    try:
        import mediapipe as mp
    except ImportError:
        logger.warning("MediaPipe not available, returning base image unchanged")
        return base_image

    base = Image.open(io.BytesIO(base_image)).convert("RGBA")
    glasses = Image.open(io.BytesIO(sunglasses_image)).convert("RGBA")

    base_rgb = base.convert("RGB")
    img_array = np.array(base_rgb)

    face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
    )

    results = face_mesh.process(img_array)
    face_mesh.close()

    if not results.multi_face_landmarks:
        logger.warning("No face detected, returning base image unchanged")
        return base_image

    landmarks = results.multi_face_landmarks[0].landmark
    h, w = img_array.shape[:2]

    # Key landmarks for sunglasses placement
    # 33 = right eye outer, 263 = left eye outer, 168 = nose bridge top
    left_eye_outer = landmarks[33]
    right_eye_outer = landmarks[263]
    nose_bridge = landmarks[168]

    lx, ly = int(left_eye_outer.x * w), int(left_eye_outer.y * h)
    rx, ry = int(right_eye_outer.x * w), int(right_eye_outer.y * h)

    # Calculate glasses dimensions
    eye_distance = ((rx - lx) ** 2 + (ry - ly) ** 2) ** 0.5
    glasses_width = int(eye_distance * 1.6)
    aspect = glasses.height / glasses.width
    glasses_height = int(glasses_width * aspect)

    glasses_resized = glasses.resize((glasses_width, glasses_height), Image.LANCZOS)

    # Calculate rotation angle
    import math
    angle = math.degrees(math.atan2(ry - ly, rx - lx))
    glasses_resized = glasses_resized.rotate(-angle, expand=True, resample=Image.BICUBIC)

    # Position centered on nose bridge
    nx, ny = int(nose_bridge.x * w), int(nose_bridge.y * h)
    paste_x = nx - glasses_resized.width // 2
    paste_y = ny - glasses_resized.height // 2

    base.paste(glasses_resized, (paste_x, paste_y), glasses_resized)

    result = base.convert("RGB")
    buf = io.BytesIO()
    result.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


async def apply_shoes_overlay(
    base_image: bytes,
    shoe_image: bytes,
) -> bytes:
    """Simple shoe overlay using bottom portion of the image.

    For MVP, this does a basic perspective-aware placement at the foot region.
    A more sophisticated version would use DensePose foot keypoints.
    """
    base = Image.open(io.BytesIO(base_image)).convert("RGBA")
    shoe = Image.open(io.BytesIO(shoe_image)).convert("RGBA")

    bw, bh = base.size

    # Place shoes in the bottom ~15% of the image
    foot_region_top = int(bh * 0.85)
    foot_region_height = bh - foot_region_top

    # Scale shoe to fit
    shoe_width = int(bw * 0.35)
    aspect = shoe.height / shoe.width
    shoe_height = min(int(shoe_width * aspect), foot_region_height)
    shoe_resized = shoe.resize((shoe_width, shoe_height), Image.LANCZOS)

    # Place left and right shoe
    center_x = bw // 2
    gap = int(bw * 0.02)

    # Left shoe
    left_x = center_x - shoe_width - gap
    left_y = bh - shoe_height
    base.paste(shoe_resized, (left_x, left_y), shoe_resized)

    # Right shoe (flipped)
    right_shoe = shoe_resized.transpose(Image.FLIP_LEFT_RIGHT)
    right_x = center_x + gap
    base.paste(right_shoe, (right_x, left_y), right_shoe)

    result = base.convert("RGB")
    buf = io.BytesIO()
    result.save(buf, format="JPEG", quality=95)
    return buf.getvalue()


async def compose_outfit(
    photo_image: bytes,
    garment_images: dict[str, bytes],
    garment_items: list[OutfitItem],
) -> tuple[bytes, list[bytes]]:
    """Compose a full outfit by applying garments sequentially.

    Returns (final_image, list_of_intermediate_images).
    """
    ordered = sort_by_category_priority(garment_items)
    current_image = photo_image
    intermediates: list[bytes] = []

    for item in ordered:
        garment_image = garment_images[item.garment_id]

        if item.category in ("upper_body", "lower_body", "dresses"):
            current_image = await run_tryon(current_image, garment_image, item.category)
            intermediates.append(current_image)
        elif item.category == "shoes":
            current_image = await apply_shoes_overlay(current_image, garment_image)
            intermediates.append(current_image)
        elif item.category == "accessories":
            current_image = await apply_sunglasses(current_image, garment_image)
            intermediates.append(current_image)
        else:
            logger.warning(f"Unknown category: {item.category}, skipping")

    return current_image, intermediates
