"""
export_glb.py — 批量导出 GLB 用于网页加载

使用：
    blender --background --python export_glb.py -- <mineral_id> [output_path]

输出：
    默认输出到 public/models/<mineral_id>.glb

约束：
    - 仅导出场景中的 mineral_<id> 物体
    - Y 轴向上
    - 应用变换
    - 不打包多余灯光相机
"""

import sys
import os

try:
    import bpy
except ImportError:
    bpy = None


def parse_args(argv):
    if '--' in argv:
        rem = argv[argv.index('--') + 1:]
        return rem
    return []


def export_glb(mineral_id: str, output_path: str = None):
    if bpy is None:
        print(f'[SKIP] 非 Blender 环境，未导出 {mineral_id}')
        return None

    # 默认输出路径
    if not output_path:
        # 跳到 atlas 根目录下的 public/models
        here = os.path.dirname(os.path.abspath(__file__))
        atlas_root = os.path.dirname(here)
        output_path = os.path.join(atlas_root, 'public', 'models', f'{mineral_id}.glb')

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # 仅选择 mineral_<id> 物体
    obj_name = f'mineral_{mineral_id}'
    obj = bpy.data.objects.get(obj_name)
    if not obj:
        print(f'[ERROR] 未找到物体 {obj_name}，请先运行 generate_schematic.py')
        return None

    # 取消所有选择，仅选中目标
    for o in bpy.context.scene.objects:
        o.select_set(False)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    # 导出 GLB
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_materials='EXPORT',
    )
    print(f'[OK] GLB 已导出：{output_path}')

    # 文件检查
    if os.path.exists(output_path):
        size_kb = os.path.getsize(output_path) / 1024
        print(f'    大小：{size_kb:.1f} KB')
        if size_kb < 1:
            print('    [WARN] 文件过小，可能是空模型')
    else:
        print(f'    [ERROR] 文件未生成')

    return output_path


def main():
    args = parse_args(sys.argv)
    if not args:
        print('用法：blender --background --python export_glb.py -- <mineral_id> [output_path]')
        sys.exit(1)
    mineral_id = args[0]
    output_path = args[1] if len(args) > 1 else None
    export_glb(mineral_id, output_path)


if __name__ == '__main__':
    main()