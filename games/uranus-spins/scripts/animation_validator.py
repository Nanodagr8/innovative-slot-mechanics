import json
import os
import argparse

def validate_spine_json(filepath, rules):
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    errors = []
    
    # Check animations
    animations = data.get('animations', {})
    required_anims = rules.get('required_animations', [])
    for anim in required_anims:
        if anim not in animations:
            errors.append(f"Missing required animation: {anim}")
            
    # Check events
    # Spine JSON format: events: { "event_name": { ... } }
    defined_events = data.get('events', {})
    required_events = rules.get('required_events', [])
    for event in required_events:
        if event not in defined_events:
            errors.append(f"Missing required event: {event}")
            
    return errors

def main():
    parser = argparse.ArgumentParser(description='Validate Spine JSONs')
    parser.add_argument('--spine-dir', required=True, help='Directory containing Spine JSONs')
    parser.add_argument('--rules', required=True, help='Path to animation_rules.json')
    args = parser.parse_args()
    
    with open(args.rules, 'r') as f:
        rules = json.load(f)
        
    all_errors = {}
    for filename in os.listdir(args.spine_dir):
        if filename.endswith('.json'):
            path = os.path.join(args.spine_dir, filename)
            errors = validate_spine_json(path, rules)
            if errors:
                all_errors[filename] = errors
                
    if all_errors:
        print("❌ Validation Errors Found:")
        for file, errors in all_errors.items():
            print(f"\n[{file}]")
            for err in errors:
                print(f"  - {err}")
        exit(1)
    else:
        print("✅ All Spine JSONs validated successfully!")

if __name__ == "__main__":
    main()
