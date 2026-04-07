from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    replicate_api_token: str = ""
    serpapi_key: str = ""

    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket_name: str = "howdoilook"

    database_url: str = "sqlite:///./data/howdoilook.db"

    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
