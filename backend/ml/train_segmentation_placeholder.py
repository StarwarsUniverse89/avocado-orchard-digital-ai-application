"""Placeholder for future orchard segmentation training.

No training is performed here. This script verifies that a prepared GeoJSON
label export exists and explains the next integration point for a real model.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser(description="Placeholder orchard segmentation trainer.")
    parser.add_argument("geojson", nargs="?", help="Path to exported orchard boundary GeoJSON.")
    args = parser.parse_args()

    if not args.geojson:
        print(json.dumps({
            "status": "not_started",
            "message": "No training run. Provide a GeoJSON export when a training pipeline is selected.",
        }, indent=2))
        return

    path = Path(args.geojson)
    if not path.exists():
        raise SystemExit(f"GeoJSON export not found: {path}")

    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)

    print(json.dumps({
        "status": "placeholder_only",
        "input_file": str(path),
        "feature_count": len(data.get("features", [])),
        "message": "Dataset validated. No model training was run.",
    }, indent=2))


if __name__ == "__main__":
    main()
