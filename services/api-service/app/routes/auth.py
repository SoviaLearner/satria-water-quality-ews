import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from supabase import create_client
from app.core.config import settings

logger = logging.getLogger("api-service.auth")
router = APIRouter(prefix="/auth", tags=["Auth"])

TEMPORARY_RESET_PASSWORD = "12345678"


class ForgotPasswordRequest(BaseModel):
    email: str


class ForgotPasswordResponse(BaseModel):
    message: str


def _get_admin_client():
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Konfigurasi reset password belum lengkap di server.",
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def _extract_users(response):
    if isinstance(response, list):
        return response
    users = getattr(response, "users", None)
    if users is not None:
        return users
    data = getattr(response, "data", None)
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        return data.get("users", [])
    if isinstance(response, dict):
        return response.get("users", response.get("data", []))
    return []


def _get_field(item, key: str, default=None):
    if isinstance(item, dict):
        return item.get(key, default)
    return getattr(item, key, default)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(payload: ForgotPasswordRequest):
    """
    Temporary local reset flow for SATRIA.
    Valid registered emails are reset to the temporary password 12345678.
    """
    email = payload.email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format email tidak valid.",
        )

    admin_client = _get_admin_client()

    try:
        matched_user = None
        for page in range(1, 11):
            response = admin_client.auth.admin.list_users(page=page, per_page=1000)
            users = _extract_users(response)
            if not users:
                break

            for user in users:
                user_email = (_get_field(user, "email", "") or "").lower()
                if user_email == email:
                    matched_user = user
                    break

            if matched_user:
                break

        if not matched_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email tidak ditemukan. Pastikan email sudah terdaftar.",
            )

        user_id = _get_field(matched_user, "id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User ditemukan, tetapi ID Supabase tidak terbaca.",
            )
        admin_client.auth.admin.update_user_by_id(user_id, {"password": TEMPORARY_RESET_PASSWORD})
        return {
            "message": "Password berhasil di-reset. Silakan login menggunakan password sementara: 12345678."
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Temporary password reset failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reset password gagal diproses: {exc}",
        )
