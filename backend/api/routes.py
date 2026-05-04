from services.orchard_service import get_orchard_by_id

@router.get("/orchard/{orchard_id}")
def get_orchard(orchard_id: str):
    orchard = get_orchard_by_id(orchard_id)
    return orchard