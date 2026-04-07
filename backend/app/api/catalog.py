import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.database import Garment, get_db
from app.models.schemas import (
    GarmentCreate,
    GarmentFetchRequest,
    GarmentResponse,
    GarmentSearchResult,
)
from app.services.garment_scraper import download_image, fetch_product_image, search_garments
from app.services.preprocessing import image_to_bytes, validate_image
from app.services.storage import upload_file

router = APIRouter()


def garment_to_response(g: Garment) -> GarmentResponse:
    processed_url = f"/api/files/{g.processed_path}" if g.processed_path else None
    metadata = json.loads(g.metadata_json) if g.metadata_json else {}
    return GarmentResponse(
        id=g.id,
        name=g.name,
        brand=g.brand,
        category=g.category,
        source=g.source,
        original_url=g.original_url,
        processed_url=processed_url,
        metadata=metadata,
        created_at=g.created_at,
    )


@router.post("/garments/fetch", response_model=GarmentResponse)
async def fetch_garment_from_url(req: GarmentFetchRequest, db: Session = Depends(get_db)):
    """Fetch a garment from a product page URL."""
    try:
        product_info = await fetch_product_image(req.url)
    except Exception as e:
        raise HTTPException(400, f"Failed to fetch product page: {e}")

    if not product_info["image_url"]:
        raise HTTPException(400, "Could not find a product image on the page")

    try:
        image_data = await download_image(product_info["image_url"])
    except Exception as e:
        raise HTTPException(400, f"Failed to download product image: {e}")

    garment_id = str(uuid.uuid4())

    # Validate and process image
    try:
        img = validate_image(image_data)
    except ValueError as e:
        raise HTTPException(400, f"Invalid product image: {e}")

    # Remove background using rembg
    try:
        from rembg import remove
        processed = remove(image_data)
        processed_key = f"garments/{garment_id}/processed.png"
        upload_file(processed_key, processed, "image/png")
    except ImportError:
        # rembg not installed, use original
        processed_key = f"garments/{garment_id}/original.jpg"
        upload_file(processed_key, image_to_bytes(img.convert("RGB")), "image/jpeg")

    name = req.name or product_info.get("title", "Unknown Garment")
    brand = req.brand or product_info.get("brand", "")

    garment = Garment(
        id=garment_id,
        name=name,
        brand=brand,
        category=req.category,
        source="scraper",
        original_url=req.url,
        processed_path=processed_key,
        metadata_json=json.dumps({"price": product_info.get("price", ""), "image_url": product_info["image_url"]}),
    )
    db.add(garment)
    db.commit()

    return garment_to_response(garment)


@router.get("/garments/search", response_model=list[GarmentSearchResult])
async def search_garments_endpoint(q: str, category: str = ""):
    """Search for garments via Google Shopping."""
    return await search_garments(q, category)


@router.post("/garments/upload", response_model=GarmentResponse)
async def upload_garment(
    file: UploadFile,
    name: str = "Uploaded Garment",
    brand: str = "",
    category: str = "upper_body",
    db: Session = Depends(get_db),
):
    """Manually upload a garment image."""
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large, maximum 10MB")

    try:
        img = validate_image(data)
    except ValueError as e:
        raise HTTPException(400, str(e))

    garment_id = str(uuid.uuid4())

    # Remove background
    try:
        from rembg import remove
        processed = remove(data)
        processed_key = f"garments/{garment_id}/processed.png"
        upload_file(processed_key, processed, "image/png")
    except ImportError:
        processed_key = f"garments/{garment_id}/original.jpg"
        upload_file(processed_key, image_to_bytes(img.convert("RGB")), "image/jpeg")

    garment = Garment(
        id=garment_id,
        name=name,
        brand=brand,
        category=category,
        source="manual",
        processed_path=processed_key,
    )
    db.add(garment)
    db.commit()

    return garment_to_response(garment)


@router.get("/garments", response_model=list[GarmentResponse])
async def list_garments(category: str = "", db: Session = Depends(get_db)):
    query = db.query(Garment)
    if category:
        query = query.filter(Garment.category == category)
    garments = query.order_by(Garment.created_at.desc()).limit(50).all()
    return [garment_to_response(g) for g in garments]


@router.get("/garments/{garment_id}", response_model=GarmentResponse)
async def get_garment(garment_id: str, db: Session = Depends(get_db)):
    garment = db.query(Garment).filter(Garment.id == garment_id).first()
    if not garment:
        raise HTTPException(404, "Garment not found")
    return garment_to_response(garment)
