"""
Configuration management for Avocado Orchard Digital AI Application
Loads environment variables safely and exposes them to backend services
"""

import os
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if it exists
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)
    print(f"✅ Loaded environment from {env_path}")
else:
    print(f"⚠️  No .env file found at {env_path}, using system environment variables")


class Config:
    """Application configuration"""
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS Configuration
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:3000,http://localhost:3001"
    ).split(",")
    
    # AMD Cloud API Configuration
    AMD_API_KEY: Optional[str] = os.getenv("AMD_API_KEY")
    AMD_API_URL: str = os.getenv("AMD_API_URL", "https://api.amd.cloud/v1")
    AMD_MODEL_ENDPOINT: Optional[str] = os.getenv("AMD_MODEL_ENDPOINT")
    AMD_MODEL_NAME: str = os.getenv("AMD_MODEL_NAME", "Qwen/Qwen2.5-7B-Instruct")
    AMD_GPU_TARGET: str = os.getenv("AMD_GPU_TARGET", "AMD MI300X")
    
    # vLLM Configuration
    VLLM_API_KEY: Optional[str] = os.getenv("VLLM_API_KEY")
    VLLM_API_URL: Optional[str] = os.getenv("VLLM_API_URL")
    VLLM_MODEL_NAME: str = os.getenv("VLLM_MODEL_NAME", "Qwen/Qwen2.5-7B-Instruct")
    
    # HuggingFace Configuration
    HUGGINGFACE_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_TOKEN")
    
    # AMD GPU Configuration
    AMD_GPU_ENABLED: bool = os.getenv("AMD_GPU_ENABLED", "false").lower() == "true"
    ROCM_VERSION: str = os.getenv("ROCM_VERSION", "5.7")
    
    # AI Model Configuration
    MODEL_NAME: str = os.getenv("MODEL_NAME", "Qwen/Qwen2.5-7B-Instruct")
    MODEL_PATH: str = os.getenv("MODEL_PATH", "/models")
    VLLM_ENABLED: bool = os.getenv("VLLM_ENABLED", "false").lower() == "true"
    
    # Database Configuration (Future)
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")
    
    # Redis Configuration (Future)
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Google Cloud / Gemini Configuration (Hackathon Expansion)
    GOOGLE_CLOUD_PROJECT: Optional[str] = os.getenv("GOOGLE_CLOUD_PROJECT")
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    GOOGLE_GENAI_MODEL: str = os.getenv("GOOGLE_GENAI_MODEL", "gemini-1.5-pro")
    GOOGLE_AGENT_MODE: str = os.getenv("GOOGLE_AGENT_MODE", "mock") # "mock" or "live"
    
    # MongoDB Configuration (Mission Memory)
    MONGODB_URI: Optional[str] = os.getenv("MONGODB_URI")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "avocado_ops")

    @classmethod
    def is_amd_cloud_configured(cls) -> bool:
        """Check if AMD Cloud API is configured"""
        return bool(cls.AMD_API_KEY and cls.AMD_API_URL)
    
    @classmethod
    def is_vllm_configured(cls) -> bool:
        """Check if vLLM is configured"""
        return bool(cls.VLLM_API_KEY and cls.VLLM_API_URL)
    
    @classmethod
    def get_masked_api_key(cls, key: Optional[str]) -> str:
        """Return masked API key for logging (never log full key)"""
        if not key:
            return "NOT_SET"
        if len(key) < 8:
            return "***"
        return f"{key[:4]}...{key[-4:]}"
    
    @classmethod
    def print_config_status(cls):
        """Print configuration status (safe for logging)"""
        print("\n" + "="*60)
        print("🔧 Configuration Status")
        print("="*60)
        print(f"Environment: {cls.ENVIRONMENT}")
        print(f"API Host: {cls.API_HOST}:{cls.API_PORT}")
        print(f"AMD Cloud API: {'✅ Configured' if cls.is_amd_cloud_configured() else '❌ Not configured'}")
        if cls.AMD_API_KEY:
            print(f"  - API Key: {cls.get_masked_api_key(cls.AMD_API_KEY)}")
            print(f"  - API URL: {cls.AMD_API_URL}")
        print(f"vLLM: {'✅ Configured' if cls.is_vllm_configured() else '❌ Not configured'}")
        if cls.VLLM_API_KEY:
            print(f"  - API Key: {cls.get_masked_api_key(cls.VLLM_API_KEY)}")
            print(f"  - Model: {cls.VLLM_MODEL_NAME}")
        print(f"AMD GPU: {'✅ Enabled' if cls.AMD_GPU_ENABLED else '❌ Disabled'}")
        print(f"HuggingFace: {'✅ Configured' if cls.HUGGINGFACE_TOKEN else '❌ Not configured'}")
        print(f"Google Cloud Agent: {'✅ Live' if cls.GOOGLE_AGENT_MODE == 'live' else '☁️ Mock Mode'}")
        if cls.GOOGLE_CLOUD_PROJECT:
            print(f"  - Project: {cls.GOOGLE_CLOUD_PROJECT}")
            print(f"  - Model: {cls.GOOGLE_GENAI_MODEL}")
        print("="*60 + "\n")


# Create singleton instance
config = Config()

# Print status on import (only in development)
if config.ENVIRONMENT == "development":
    config.print_config_status()

# Made with Bob