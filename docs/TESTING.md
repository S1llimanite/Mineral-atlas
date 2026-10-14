# 测试方法与验证结果

## 测试策略

### 1. 数据完整性单元测试

校验 `MINERALS` 数组中每条矿物记录：
- `id` 唯一、非空、小写
- `nameCN`, `nameEN`, `formula` 非空
- `dataStatus` 在合法枚举内
- `crystal.system` 在合法枚举内
- 若晶系含"等轴"，`opticType` 应为"均质体"
- `birefringence` 字段若存在必须含数值
- `lastReviewed` 必须是 YYYY-MM-DD 格式

### 2. 鉴定评分函数测试

针对 `identifyMinerals()` 验证：
- 仅低突起 + 无多色性 → 应保留石英、斜长石、钾长石，方解石也匹配（低-中突起包含低）
- 闪突起 → 仅方解石匹配
- 等轴晶系 → 仅石榴子石匹配
- 4 条筛选全设 → 候选集大幅缩小

### 3. 来源引用解析测试

校验 `PROPERTY_SOURCES` 数组：
- 每条 `referenceId` 在 `REFERENCES` 中存在
- 每条 `property` 路径对应矿物对象中的真实字段

## 运行方式

```bash
npm test
```

## 编写中的测试

- CrystalViewer 客户端组件的渲染测试（需 jsdom + WebGL mock）
- 鉴定工作台交互流程测试
- 路由静态生成测试

## 当前验证状态

| 项 | 状态 |
|---|---|
| 矿物数据自洽性 | ✅ 由数据生成脚本把关 |
| 鉴定函数行为 | ✅ 已编写 case
| Blender 脚本 | ❌ 未实际运行（环境无 Blender）|
| 三维浏览器加载 | ⏳ 待首启 dev server 验证 |
| 路由静态生成 | ⏳ 待 build 验证 |

未来任何项的"已通过"必须有运行日志或截图佐证，禁止口头宣称。