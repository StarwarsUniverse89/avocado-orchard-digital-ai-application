"""Prepare orchard boundary labels for future segmentation model training.

This module is intentionally lightweight. It does not train a model; it converts
archived orchard/manual boundaries into ML-ready GeoJSON and export metadata.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple


REPO_ROOT = Path(__file__).resolve().parents[2]
ARCHIVE_FILE = REPO_ROOT / "backend" / "data" / "orchard_archive" / "archive.json"
EXPORT_DIR = REPO_ROOT / "backend" / "data" / "ml_exports"


def _utc_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _archive_records(archive_file: Path = ARCHIVE_FILE) -> List[Dict[str, Any]]:
    raw = _read_json(archive_file, {})
    if isinstance(raw, dict):
        return [value for value in raw.values() if isinstance(value, dict)]
    if isinstance(raw, list):
        return [value for value in raw if isinstance(value, dict)]
    return []


def _normalize_polygon(record: Dict[str, Any]) -> List[List[float]]:
    """Return polygon ring as GeoJSON coordinates: [[lng, lat], ...]."""
    polygon = record.get("polygon") or record.get("boundary_coordinates") or []
    normalized: List[List[float]] = []

    for point in polygon:
        if not isinstance(point, list) or len(point) < 2:
            continue
        first = float(point[0])
        second = float(point[1])

        # Manual boundaries are stored as [lng, lat]. Older archive boundaries
        # are stored as [lat, lng]. Longitude in this app is around -102.
        if abs(first) <= 90 and abs(second) > 90:
            lat, lng = first, second
        else:
            lng, lat = first, second
        normalized.append([round(lng, 6), round(lat, 6)])

    if normalized and normalized[0] != normalized[-1]:
        normalized.append(normalized[0])
    return normalized


def _metadata(record: Dict[str, Any]) -> Dict[str, Any]:
    return record.get("manual_metadata") or record


def boundary_to_feature(record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    ring = _normalize_polygon(record)
    if len(ring) < 4:
        return None

    metadata = _metadata(record)
    label_type = record.get("label_type") or "orchard_block"
    review_status = "needs_review" if label_type == "needs_review" else "accepted"
    if label_type == "non_orchard":
        review_status = "non_orchard"

    return {
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [ring],
        },
        "properties": {
            "archive_id": record.get("archive_id") or record.get("boundary_id") or record.get("orchard_id"),
            "label_type": label_type,
            "crop_type": metadata.get("crop_type", "avocado"),
            "municipality_id": record.get("municipality_id"),
            "estimated_hectares": metadata.get("estimated_hectares"),
            "tree_count_estimate": metadata.get("tree_count_estimate") or metadata.get("estimated_tree_count"),
            "boundary_source": record.get("boundary_source", "human_labeled"),
            "ml_training_label": bool(record.get("ml_training_label", True)),
            "review_status": review_status,
        },
    }


def build_feature_collection(records: Optional[Iterable[Dict[str, Any]]] = None) -> Dict[str, Any]:
    source_records = list(records) if records is not None else _archive_records()
    features = [
        feature for feature in (boundary_to_feature(record) for record in source_records)
        if feature is not None
    ]
    return {
        "type": "FeatureCollection",
        "name": "human_labeled_avocado_orchard_boundaries",
        "features": features,
    }


def dataset_envelope(records: Optional[Iterable[Dict[str, Any]]] = None) -> Dict[str, Any]:
    feature_collection = build_feature_collection(records)
    return {
        "dataset_id": f"orchard_boundaries_{_utc_timestamp()}",
        "label_type": "orchard_boundary_segmentation",
        "total_examples": len(feature_collection["features"]),
        "format": "geojson",
        "examples": feature_collection["features"],
    }


def summarize_dataset(records: Optional[Iterable[Dict[str, Any]]] = None, export_dir: Path = EXPORT_DIR) -> Dict[str, Any]:
    feature_collection = build_feature_collection(records)
    features = feature_collection["features"]
    accepted = sum(1 for feature in features if feature["properties"].get("review_status") == "accepted")
    needs_review = sum(1 for feature in features if feature["properties"].get("review_status") == "needs_review")
    non_orchard = sum(1 for feature in features if feature["properties"].get("review_status") == "non_orchard")
    municipalities = sorted({
        feature["properties"].get("municipality_id")
        for feature in features
        if feature["properties"].get("municipality_id")
    })
    latest = latest_export(export_dir)

    return {
        "total_human_labeled_boundaries": len(features),
        "total_labels": len(features),
        "accepted_labels": accepted,
        "needs_review_labels": needs_review,
        "non_orchard_labels": non_orchard,
        "municipalities_covered": municipalities,
        "latest_export": latest,
        "ready_for_training": accepted >= 10 and needs_review == 0,
        "recommended_next_step": (
            "Export GeoJSON and begin training dataset preparation once review labels are resolved."
            if features else
            "Create or archive human-labeled orchard boundaries before export."
        ),
    }


def export_dataset(export_dir: Path = EXPORT_DIR) -> Dict[str, Any]:
    export_dir.mkdir(parents=True, exist_ok=True)
    timestamp = _utc_timestamp()
    dataset_id = f"orchard_boundaries_{timestamp}"
    geojson_path = export_dir / f"{dataset_id}.geojson"
    metadata_path = export_dir / f"{dataset_id}.metadata.json"

    feature_collection = build_feature_collection()
    summary = summarize_dataset(export_dir=export_dir)
    current_export = {
        "dataset_id": dataset_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "total_examples": len(feature_collection["features"]),
        "format": "geojson",
        "geojson_file": geojson_path.name,
        "metadata_file": metadata_path.name,
        "geojson_path": str(geojson_path),
        "metadata_path": str(metadata_path),
    }
    summary["latest_export"] = current_export

    metadata = {
        "dataset_id": dataset_id,
        "label_type": "orchard_boundary_segmentation",
        "format": "geojson",
        "geojson_file": geojson_path.name,
        "metadata_file": metadata_path.name,
        "total_examples": len(feature_collection["features"]),
        "created_at": current_export["created_at"],
        "source_archive": str(ARCHIVE_FILE.relative_to(REPO_ROOT)),
        "summary": summary,
        "note": "Dataset export for training dataset preparation only; no model training was run.",
    }

    with geojson_path.open("w", encoding="utf-8") as handle:
        json.dump(feature_collection, handle, indent=2)
    with metadata_path.open("w", encoding="utf-8") as handle:
        json.dump(metadata, handle, indent=2)

    return {
        **metadata,
        "geojson_path": str(geojson_path),
        "metadata_path": str(metadata_path),
    }


def list_exports(export_dir: Path = EXPORT_DIR) -> List[Dict[str, Any]]:
    if not export_dir.exists():
        return []

    exports: List[Dict[str, Any]] = []
    for metadata_path in sorted(export_dir.glob("orchard_boundaries_*.metadata.json"), reverse=True):
        metadata = _read_json(metadata_path, {})
        geojson_name = metadata.get("geojson_file") or metadata_path.name.replace(".metadata.json", ".geojson")
        geojson_path = export_dir / geojson_name
        exports.append({
            "dataset_id": metadata.get("dataset_id", metadata_path.stem.replace(".metadata", "")),
            "created_at": metadata.get("created_at"),
            "total_examples": metadata.get("total_examples", 0),
            "format": metadata.get("format", "geojson"),
            "geojson_file": geojson_name,
            "metadata_file": metadata_path.name,
            "geojson_path": str(geojson_path),
            "metadata_path": str(metadata_path),
        })
    return exports


def latest_export(export_dir: Path = EXPORT_DIR) -> Optional[Dict[str, Any]]:
    exports = list_exports(export_dir)
    return exports[0] if exports else None


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare orchard boundary ML label dataset.")
    parser.add_argument("--export", action="store_true", help="Write GeoJSON and metadata export files.")
    parser.add_argument("--summary", action="store_true", help="Print dataset summary.")
    args = parser.parse_args()

    if args.export:
        print(json.dumps(export_dataset(), indent=2))
    else:
        print(json.dumps(summarize_dataset(), indent=2))


if __name__ == "__main__":
    main()
