from fastapi import APIRouter

router = APIRouter()

@router.post("/commands")
async def create_command(body: dict):

    return {
        "status": "not_implemented_yet"
    }
