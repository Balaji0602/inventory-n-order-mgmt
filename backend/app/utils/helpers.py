from datetime import datetime, timezone


def get_utc_now() -> datetime:
    """Returns dynamic localized aware UTC timestamps."""
    return datetime.now(timezone.utc)


def format_currency(value: float) -> str:
    """Standardizes price values to double decimal formats."""
    return f"${value:.2f}"
