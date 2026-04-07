from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class PhotoUploadResponse(BaseModel):
    photo_id: str
    status: str


class PhotoStatus(BaseModel):
    photo_id: str
    status: str
    resized_url: str | None = None


class GarmentBase(BaseModel):
    name: str
    brand: str = ""
    category: Literal["upper_body", "lower_body", "dresses", "shoes", "accessories"]


class GarmentCreate(GarmentBase):
    pass


class GarmentResponse(GarmentBase):
    id: str
    source: str
    original_url: str
    processed_url: str | None = None
    metadata: dict = {}
    created_at: datetime


class GarmentFetchRequest(BaseModel):
    url: str
    category: Literal["upper_body", "lower_body", "dresses", "shoes", "accessories"]
    name: str = ""
    brand: str = ""


class GarmentSearchRequest(BaseModel):
    query: str
    category: str = ""


class GarmentSearchResult(BaseModel):
    title: str
    brand: str
    image_url: str
    product_url: str
    price: str = ""


class TryOnRequest(BaseModel):
    photo_id: str
    garment_id: str


class TryOnResponse(BaseModel):
    job_id: str
    status: str


class TryOnStatus(BaseModel):
    job_id: str
    status: str
    result_url: str | None = None
    error: str | None = None


class OutfitItem(BaseModel):
    garment_id: str
    category: Literal["upper_body", "lower_body", "dresses", "shoes", "accessories"]


class OutfitRequest(BaseModel):
    photo_id: str
    garments: list[OutfitItem]


class OutfitResponse(BaseModel):
    job_id: str
    status: str


class OutfitStatus(BaseModel):
    job_id: str
    status: str
    result_url: str | None = None
    intermediate_urls: list[str] = []
    error: str | None = None
