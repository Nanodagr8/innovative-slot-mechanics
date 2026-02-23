import json
import os
import argparse

def map_events(spine_dir):
    mapping = {}
    for filename in os.listdir(spine_dir):
        if filename.endswith('.json'):
            path = os.path.join(spine_dir, filename)
            with open(path, 'r') as f:
                data = json.load(f)
            
            skeleton_name = os.path.splitext(filename)[0]
            events = data.get('events', {})
            mapping[skeleton_name] = list(events.keys())
            
    return mapping

def main():
    parser = argparse.ArgumentParser(description='Map Spine events to engine-friendly JSON')
    parser.add_argument('--spine-dir', required=True, help='Directory containing Spine JSONs')
    parser.add_argument('--out', required=True, help='Output path for mapping JSON')
    args = parser.parse_args()
    
    mapping = map_events(args.spine_dir)
    
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, 'w') as f:
        json.dump(mapping, f, indent=2)
        
    print(f"✅ Event mapping generated: {args.out}")

if __name__ == "__main__":
    main()
