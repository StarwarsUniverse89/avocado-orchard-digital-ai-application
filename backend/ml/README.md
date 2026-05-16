# Operational ML Dataset Preparation

This folder contains the lightweight preparation layer for future avocado orchard boundary segmentation models.

The current system does **not** train or fine-tune a model. It prepares a structured ML label archive from operational orchard boundaries so a future training pipeline can consume clean GeoJSON labels.

## Feedback Loop

```text
AI prediction -> human correction -> archived label -> GeoJSON dataset -> future model improvement
```

## Data Source

The dataset builder reads archived orchard/manual boundaries from:

```text
backend/data/orchard_archive/archive.json
```

Records with older `boundary_coordinates` fields and newer manual `polygon` fields are both normalized into GeoJSON Polygon features.

## Export Dataset

```bash
python backend/ml/prepare_dataset.py --export
```

This writes:

```text
backend/data/ml_exports/orchard_boundaries_<timestamp>.geojson
backend/data/ml_exports/orchard_boundaries_<timestamp>.metadata.json
```

## API Endpoints

```text
POST /api/v1/ml/training-dataset/export-orchard-boundaries
GET  /api/v1/ml/training-dataset/exports
GET  /api/v1/ml/training-dataset/summary
GET  /api/v1/ml/training-dataset/orchard-boundaries
GET  /api/v1/ml/training-dataset/orchard-boundaries.geojson
```

## Placeholders

`train_segmentation_placeholder.py` and `evaluate_segmentation_placeholder.py` intentionally do not train or evaluate a real model. They validate dataset files and define the future CLI surface for model work without adding heavy ML dependencies.
