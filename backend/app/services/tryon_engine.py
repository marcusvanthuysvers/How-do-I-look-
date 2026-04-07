import io
import logging

import httpx
import replicate

from app.config import settings

logger = logging.getLogger(__name__)

CATEGORY_MAP = {
    "upper_body": "upper_body",
    "lower_body": "lower_body",
    "dresses": "dresses",
}


async def run_tryon(
    human_image: bytes,
    garment_image: bytes,
    category: str,
) -> bytes:
    """Run virtual try-on using Replicate's IDM-VTON model.

    Returns the result image as bytes.
    """
    if not settings.replicate_api_token:
        raise RuntimeError("REPLICATE_API_TOKEN is not set")

    vton_category = CATEGORY_MAP.get(category)
    if not vton_category:
        raise ValueError(f"IDM-VTON does not support category: {category}. Supported: {list(CATEGORY_MAP.keys())}")

    client = replicate.Client(api_token=settings.replicate_api_token)

    logger.info(f"Starting IDM-VTON inference for category: {vton_category}")

    output = client.run(
        "cuuupid/idm-vton:c871bb9b046c1584f06571c8a90edcf348a68e82569e8fc9658db24a65a8f4c0",
        input={
            "human_img": io.BytesIO(human_image),
            "garm_img": io.BytesIO(garment_image),
            "category": vton_category,
            "seed": 42,
            "steps": 30,
        },
    )

    # output is a URL to the result image
    result_url = str(output)
    logger.info(f"IDM-VTON inference complete, downloading result from {result_url}")

    async with httpx.AsyncClient() as http:
        response = await http.get(result_url)
        response.raise_for_status()
        return response.content
