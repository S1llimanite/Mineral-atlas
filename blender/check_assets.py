"""
check_assets.py — 检查模型文件是否存在、是否有效，输出版本清单

使用：
    blender --background --python check_assets.py
    （或在 Python 中直接调用 check_assets()）

不依赖 Blender：可仅作为文件系统检查器运行。
"""

import os
import json
import sys


def atlas_root():
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.dirname(here)


def check_assets():
    root = atlas_root()
    models_dir = os.path.join(root, 'public', 'models')
    blend_dir = os.path.join(root, 'blender', 'output')
    assets_manifest_path = os.path.join(root, 'blender', 'assets_manifest.json')

    manifest = {
        'generated_at': None,
        'models': [],
        'missing': [],
        'warnings': [],
    }

    # 9 种代表矿物 ID
    mineral_ids = [
        'quartz', 'plagioclase', 'k-feldspar', 'biotite', 'hornblende',
        'clinopyroxene', 'olivine', 'calcite', 'garnet',
    ]

    for mid in mineral_ids:
        glb = os.path.join(models_dir, f'{mid}.glb')
        blend = os.path.join(blend_dir, f'{mid}.blend')

        entry = {
            'id': mid,
            'glb': None,
            'blend': None,
            'glb_size_kb': 0,
            'issues': [],
        }

        if os.path.exists(glb):
            entry['glb'] = glb
            entry['glb_size_kb'] = round(os.path.getsize(glb) / 1024, 1)
        else:
            entry['issues'].append('GLB 缺失（当前网页使用程序化生成器替代）')

        if os.path.exists(blend):
            entry['blend'] = blend
        else:
            entry['issues'].append('Blender 源文件未制作')

        manifest['models'].append(entry)
        if not entry['glb'] and not entry['blend']:
            manifest['missing'].append(mid)

    # 写入清单
    os.makedirs(blend_dir, exist_ok=True)
    import datetime
    manifest['generated_at'] = datetime.datetime.now().isoformat()
    with open(assets_manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return manifest


if __name__ == '__main__':
    check_assets()