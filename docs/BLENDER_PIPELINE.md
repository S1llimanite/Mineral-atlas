# Blender 资产流水线

## 0. 当前状态声明

⚠ **当前 Blender 脚本作为命令行工具完整交付，但开发环境未实际运行 Blender 验证。**

网页 3D 模型当前由 React Three Fiber 程序化生成器实时构造（标记为 `procedural_schematic`）。
要运行 Blender 流水线，需先安装 Blender 3.6+ 或 4.x。

## 1. 工具链

- **Blender** 3.6 LTS / 4.x （独立安装，非 npm 包）
- 输出格式：`.blend`（源文件）+ `.glb`（网页资产）
- 单位：米，模型整体最大边长 = 2.0 m
- 朝向：+Y 向上

## 2. 脚本说明

### `blender/init_scene.py`
初始化标准场景：单位、相机、4 点照明、EEVEE 渲染设置。

```bash
blender --background --python blender/init_scene.py -- arg_id=quartz out=blender/output/quartz.blend
```

### `blender/generate_schematic.py`
根据矿物 ID 生成示意几何体，含 9 种矿物的配置。

```bash
blender --background --python blender/generate_schematic.py -- quartz
```

生成的物体属性：
- `modelType = "procedural_schematic"`
- `mineralId = <id>`
- `reviewStatus = "schematic"`

### `blender/export_glb.py`
仅导出 `mineral_<id>` 物体为 GLB，应用变换，Y 轴向上。

```bash
blender --background --python blender/export_glb.py -- quartz
# 或自定义输出路径
blender --background --python blender/export_glb.py -- quartz /path/to/output.glb
```

### `blender/check_assets.py`
扫描所有矿物 ID 的 GLB 和 `.blend` 文件是否存在、有效，输出 `assets_manifest.json`。
不依赖 Blender，可作为纯 Python 脚本运行：

```bash
python blender/check_assets.py
```

## 3. 完整流程（单矿物）

```bash
# 1. 初始化场景并保存
blender --background --python blender/init_scene.py -- arg_id=quartz out=blender/output/quartz.blend

# 2. 打开场景生成示意几何（合并到一个命令更省事）
blender blender/output/quartz.blend --background --python blender/generate_schematic.py -- quartz

# 3. 重新打开并导出 GLB
blender blender/output/quartz.blend --background --python blender/export_glb.py -- quartz

# 4. 检查所有资产状态
python blender/check_assets.py
```

## 4. 资产元数据规范

每个模型必须记录：

| 字段 | 必填 | 说明 |
|---|---|---|
| id | ✅ | 资产 ID |
| mineralId | ✅ | 关联矿物 ID |
| modelType | ✅ | procedural_schematic / blender_ideal / verified_reconstruction |
| filePath | ✅ | /models/<id>.glb |
| generator | ✅ | 作者或脚本 |
| reviewStatus | ✅ | 数据状态 |
| notes | — | 限制说明 |

## 5. 模型类型与状态转换

```
procedural_schematic      → 程序化几何示意
   ↓ Blender 人工精修
blender_ideal              → 理想晶形（手工制作）
   ↓ 经文献晶面数值验证
verified_reconstruction    → 经验证的晶面重建
```

✗ 不允许直接从 `procedural_schematic` 跳到 `verified_reconstruction`。

## 6. 命名约定

```
blender/
  output/
    quartz.blend         # Blender 源文件
    quartz.glb           # 同名导出（如有）
  init_scene.py
  generate_schematic.py
  export_glb.py
  check_assets.py
  assets_manifest.json   # 自动生成的清单

public/
  models/
    quartz.glb           # 网页加载的 GLB
```

## 7. 网页端接入

`CrystalViewer` 组件当前预留加载分支：

```typescript
// 当模型存在 GLB 文件时
if (m.assets.crystalModel?.filePath) {
  return <GLTFModel url={m.assets.crystalModel.filePath} />;
}
// 否则使用程序化生成器
return <ProceduralCrystal mineral={m} />;
```

未来 Blender 模型制作完成后，仅需在 `minerals.ts` 中将 `filePath` 指向 `/models/quartz.glb`，
即可自动切换到加载真实模型。

## 8. 验证清单

在 Blender 实际运行脚本后，应逐项检查：

- [ ] `mineral_<id>` 物体存在于场景
- [ ] 物体属性包含 modelType、mineralId、reviewStatus
- [ ] 模型最大边长接近 2.0 m
- [ ] 模型原点在世界原点
- [ ] 导出 GLB 文件大小 > 1 KB
- [ ] 浏览器可加载该 GLB 并正常渲染
- [ ] `check_assets.py` 报告该矿物无 issue

任何一项失败应明确报告，不得掩盖。

## 9. 故障排查

| 现象 | 可能原因 | 处理 |
|---|---|---|
| `[ERROR] bmesh not found` | Blender 内置模块，需在 Blender Python 解释器中运行 | 用 `blender --python` 而非系统 python |
| GLB 文件 0 字节 | 物体未选中 | 检查 `use_selection=True` 与 `obj.select_set(True)` |
| 网页加载报错 | GLB 损坏 | 用 https://gltf-viewer.donmccurdy.com/ 验证 |