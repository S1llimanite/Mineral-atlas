# 系统架构

## 概况

薄片矿物数字图鉴采用分层架构，便于在不重写界面的情况下从静态数据升级为带数据库与后端的完整平台。

```
┌──────────────────────────────────────────┐
│ 浏览器（客户端）                          │
│  Next.js App Router + React 组件          │
│  ┌─────────────────────────────────────┐ │
│  │ 页面层                               │ │
│  │  / /minerals /minerals/[id]         │ │
│  │  /identify /compare                 │ │
│  ├─────────────────────────────────────┤ │
│  │ 组件层                               │ │
│  │  CrystalViewer (React Three Fiber) │ │
│  │  StatusBadge                         │ │
│  ├─────────────────────────────────────┤ │
│  │ 业务逻辑层 (src/lib)                 │ │
│  │  mineralStore.ts (查询/鉴定评分)     │ │
│  │  crystalGeometry.ts (程序化几何)     │ │
│  ├─────────────────────────────────────┤ │
│  │ 数据层 (src/data)                    │ │
│  │  minerals.ts (9 种矿物)              │ │
│  │  references.ts (6 份标准文献)         │ │
│  └─────────────────────────────────────┘ │
│           ▲                              │
│           │ 未来接入                     │
│  ┌────────┴─────────────────────────┐    │
│  │ API 层 (FastAPI，规划中)         │    │
│  │  /api/minerals, /api/identify    │    │
│  └────────┬─────────────────────────┘    │
│           │                              │
│  ┌────────┴─────────────────────────┐    │
│  │ 持久化 (PostgreSQL)            │    │
│  │  Mineral / CrystalProperty      │    │
│  │  OpticalProperty / Reference    │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘

并行：
┌──────────────────────────────────────────┐
│ Blender 资产流水线（独立工具链）            │
│  init_scene.py → generate_schematic.py    │
│  → export_glb.py → check_assets.py         │
│  → public/models/*.glb                     │
└──────────────────────────────────────────┘
```

## 模块说明

### 前端
- **App Router**：采用 Next.js 14 App Router，所有页面与详情页采用静态生成（`generateStaticParams`）。
- **CrystalViewer**：React Three Fiber Canvas + OrbitControls，客户组件，由动态导入避免 SSR WebGL 问题（Next.js 默认对 client 组件处理）。
- **状态管理**：MVP 阶段无状态管理库，使用 React 内置 useState；后续如需多视图共享可引入 Zustand。

### 数据层
- **静态数据（当前）**：9 种矿物数据嵌入 `src/data/minerals.ts`，所有字段已结构化。
- **未来升级路径**：
  1. 将 `mineralStore.ts` 内部函数改为从 API 获取数据（保持函数签名不变）
  2. 启动 FastAPI 服务提供 `/api/minerals` 等端点
  3. PostgreSQL 接 SQLAlchemy ORM 与 Alembic 迁移
  4. 所有页面无需改动，仅替换数据来源

### 三维资产
- **当前**：CrystalViewer 内的程序化几何构造器在浏览器实时生成示意模型
- **未来**：Blender 制作精确晶形后导出 GLB，CrystalViewer 改为从 `useLoader(GLTFLoader, url)` 加载
- **回退**：WebGL 不可用 / GLB 加载失败 → 自动回退到程序化几何或提示信息

## 鉴定工作台规则评分

```
对每个矿物 M：
  对每个用户过滤条件 C：
    若 M 的对应字段包含 C 的关键词：matched += 1
    否则若字段存在但不包含：unmatched += 1
    否则（字段缺失或描述不明确）：missing += 1
  score = matched / total_criteria × 100
候选入选项：score > 0 或 unmatched.length === 0
```

非 AI 模型，所有匹配/不匹配项均可在结果中逐条查看。

## 数据完整性约束

所有矿物数据必须满足：
- `dataStatus` 不为 `verified` → 不许宣称数据已审核
- `crystalModel.modelType = 'procedural_schematic'` → 永远不能升级为 verified，须 Blender 制作并经人工审核
- 光学属性缺值时显式标记"待补充"或采用 missing 状态，禁止用空字符串或 0 冒充

## 关键扩展点

1. 添加新矿物：在 `src/data/minerals.ts` 追加对象（数据结构已稳定）
2. 替换 GLB 模型：在 `CrystalViewer` 中加 `useLoader` 分支并 `loadGLB`
3. 接入数据库：在 `mineralStore.ts` 中将数据源改为 fetch
4. 添加显微照片：扩展 `assets.micrographs` 数组并加 XPL/PPL 切换 UI
5. 自定义分类树：编辑 `CLASSIFICATION_TREE`