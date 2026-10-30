import json
from importlib.resources import files
from typing import Any, Protocol


class CatalogSource(Protocol):
    """Where stores and offers come from. A scraper implements this too."""

    def stores(self) -> list[dict[str, Any]]: ...

    def offers(self) -> list[dict[str, Any]]: ...


class MockSource:
    def __init__(self) -> None:
        text = files("grabby").joinpath("data/catalog.json").read_text(encoding="utf-8")
        self._data = json.loads(text)

    def stores(self) -> list[dict[str, Any]]:
        return self._data["stores"]

    def offers(self) -> list[dict[str, Any]]:
        return self._data["offers"]


def get_source() -> CatalogSource:
    return MockSource()
