"""Placeholder for future orchard segmentation evaluation.

No model evaluation is performed. This script provides a stable CLI contract for
future comparison of predicted boundaries against the human-labeled GeoJSON.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def _feature_count(path: Path) -> int:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    return len(data.get("features", []))


def main() -> None:
    parser = argparse.ArgumentParser(description="Placeholder orchard segmentation evaluator.")
    parser.add_argument("--labels", help="Path to human-labeled GeoJSON export.")
    parser.add_argument("--predictions", help="Path to future model prediction GeoJSON.")
    args = parser.parse_args()

    if not args.labels:
        print(json.dumps({
            "status": "not_started",
            "message": "No evaluation run. Provide --labels and future --predictions when a model exists.",
        }, indent=2))
        return

    labels_path = Path(args.labels)
    if not labels_path.exists():
        raise SystemExit(f"Label GeoJSON not found: {labels_path}")

    result = {
        "status": "placeholder_only",
        "label_file": str(labels_path),
        "label_count": _feature_count(labels_path),
        "message": "Labels validated. No segmentation metrics were computed because no model predictions were supplied.",
    }

    if args.predictions:
        predictions_path = Path(args.predictions)
        if not predictions_path.exists():
            raise SystemExit(f"Prediction GeoJSON not found: {predictions_path}")
        result["prediction_file"] = str(predictions_path)
        result["prediction_count"] = _feature_count(predictions_path)
        result["message"] = "Inputs validated. Real IoU/F1 evaluation is intentionally not implemented yet."

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
