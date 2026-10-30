import uvicorn
from fastapi import FastAPI

from grabby.sources import get_source

app = FastAPI(title="Grabby catalog feed")
source = get_source()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/stores")
def stores() -> list[dict]:
    return source.stores()


@app.get("/offers")
def offers() -> list[dict]:
    return source.offers()


def serve() -> None:
    uvicorn.run("grabby.api:app", host="127.0.0.1", port=8000)
