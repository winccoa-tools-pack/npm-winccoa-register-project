#!/usr/bin/env python3
"""
Generate `actions_payload.json` from .github/repository.settings.yml
This script is small and safe to run in CI; writes actions_payload.json when
an `actions_permissions` block is present.
"""
import json
import sys
from pathlib import Path

try:
    import yaml
except Exception:
    print("Missing PyYAML; ensure 'pyyaml' is installed in the runner", file=sys.stderr)
    raise

cfg_path = Path('.github/repository.settings.yml')
if not cfg_path.exists():
    sys.exit(0)

cfg = yaml.safe_load(cfg_path.read_text(encoding='utf-8')) or {}
ap = cfg.get('actions_permissions')
if not ap:
    # nothing to do
    sys.exit(0)

out = {}
if 'enabled' in ap:
    out['enabled'] = bool(ap['enabled'])
if 'allowed_actions' in ap:
    out['allowed_actions'] = ap['allowed_actions']
if isinstance(ap.get('selected_actions'), dict) and 'apps' in ap.get('selected_actions'):
    out['selected_actions'] = {'apps': ap['selected_actions']['apps']}

Path('actions_payload.json').write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
print('WROTE actions_payload.json')
