"""
init_scene.py — 初始化 Blender 统一场景、单位、相机与命名规范

使用：
    blender --background --python init_scene.py -- arg_id=<id> out=<path>

约定：
    - 单位：米 (Blender 默认)，模型整体最大边长 = 2.0 m
    - 原点：模型几何中心位于世界原点 (0,0,0)
    - 朝向：+Y 向上（与其他 3D 工具一致；导出时可通过 GLB 转换）
    - 命名：场景物体命名为 mineral_<id>_<part>
    - 灯光：3 点照明 + 顶光
    - 相机：等距俯视
"""

import sys
import os

try:
    import bpy
except ImportError:
    bpy = None  # 允许在非 Blender 环境中导入以查看代码


def parse_args(argv):
    """提取 -- 之后的参数"""
    if '--' in argv:
        return argv[argv.index('--') + 1:]
    return []


def init_scene(arg_id: str = 'mineral', out_path: str = None):
    if bpy is None:
        print('[SKIP] bpy 未加载，当前非 Blender 环境')
        return None

    # 清空默认场景
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # 设置单位
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0

    # 相机
    cam_data = bpy.data.cameras.new('Camera')
    cam_obj = bpy.data.objects.new('Camera', cam_data)
    cam_obj.location = (4, 4, 4)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # 灯光：主光、补光、轮廓光、顶光
    lights = [
        ('KeyLight', 'AREA', (5, 5, 6), 800),
        ('FillLight', 'AREA', (-5, 3, 4), 250),
        ('RimLight', 'SPOT', (-4, -3, 5), 600),
        ('TopLight', 'AREA', (0, 0, 8), 300),
    ]
    for name, ltype, loc, energy in lights:
        ldata = bpy.data.lights.new(name, type=ltype)
        ldata.energy = energy
        lobj = bpy.data.objects.new(name, ldata)
        lobj.location = loc
        bpy.context.collection.objects.link(lobj)

    # 视口渲染设置
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.render.resolution_x = 1280
    bpy.context.scene.render.resolution_y = 960

    # 输出 .blend
    if out_path:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=out_path)
        print(f'[OK] 场景已保存：{out_path}')

    return bpy.context.scene


def main():
    args = parse_args(sys.argv)
    kwargs = {}
    for a in args:
        if '=' in a:
            k, v = a.split('=', 1)
            kwargs[k] = v
    init_scene(arg_id=kwargs.get('arg_id', 'mineral'), out_path=kwargs.get('out'))


if __name__ == '__main__':
    main()