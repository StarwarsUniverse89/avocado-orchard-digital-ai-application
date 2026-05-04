import json

def load_orchards():
    with open("ml/datasets/orchards.json") as f:
        return json.load(f)

def get_orchard_by_id(orchard_id):
    orchards = load_orchards()
    for o in orchards:
        if o["id"] == orchard_id:
            return o
    return None