"""
Blender 资产制作与导出脚本集
====================================

用途：将 Blender 作为专业晶体模型制作工具，建立标准化资产流水线。

使用方式（命令行批量执行）：

    blender --background --python init_scene.py -- arg_id=quartz
    blender --background --python generate_schematic.py -- quartz
    blender --background --python export_glb.py -- quartz
    blender --background --python check_assets.py

或在 Blender 内 Python 控制台逐脚本运行。

依赖：Blender 3.6+ 或 4.x（内置 Python API，无需额外安装）

资产元数据规范：
    每个模型必须保留 .blend 源文件并导出 .glb 用于网页展示。
    所有程序化生成模型必须标记 modelType = "procedural_schematic"。
    未经文献晶面验证的模型不得标记为 verified。

注意：本脚本仅作为命令行工具交付。
当前开发环境未启动 Blender，未在 Blender 中实际运行验证。
若需运行，请确保 Blender 已安装并将路径加入环境变量或直接使用 blender.exe 绝对路径。
"""

# 单脚本草稿占位，实际功能在子脚本中实现

if __name__ == '__main__':
    print('Blender 资产脚本集合')
    print('可用子命令：init_scene | generate_schematic | export_glb | check_assets')
    print('使用方式见 docs/BLENDER_PIPELINE.md')