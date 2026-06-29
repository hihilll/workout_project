# 内容库说明

## 当前规模

- 动作库：124 个动作，覆盖徒手、哑铃、弹力带、杠铃、健身房器械、核心、有氧和训练后拉伸，其中包含 37 个哑铃动作。
- 食物库：74 个条目，覆盖蛋白质、主食、蔬菜、脂肪、常见外卖/食堂组合。

## 动作字段

每个动作包含：

- `id`：稳定唯一标识
- `name`：动作名称
- `type`：动作模式，当前支持 `warmup`、`stretch`、`lower`、`push`、`pull`、`core`、`cardio`
- `phase`：动作阶段，当前支持 `warmup`、`strength`、`cardio`、`stretch`
- `muscleGroups`：目标肌群
- `locations`：适用地点，当前支持 `home`、`gym`、`outdoor`
- `equipment`：器械条件，当前支持 `none`、`dumbbell`、`band`、`barbell`、`machine`
- `levels`：适用水平，当前支持 `beginner`、`novice`、`intermediate`、`advanced`
- `goals`：适用目标，当前支持 `fat_loss`、`muscle_gain`、`shape`、`health`
- `defaultSets`、`defaultReps`、`defaultRest`：默认训练参数
- `avoidIf`：伤病或风险标签
- `alternatives`：替代动作 id
- `instruction`：动作要点
- `lowImpact`：是否适合低冲击筛选

## 食物字段

每个食物包含：

- `id`：稳定唯一标识
- `name`：食物名称
- `type`：营养分类，当前支持 `protein`、`carb`、`vegetable`、`fat`、`mixed`
- `calories`、`protein`、`carbs`、`fat`：按 `unit` 计量的营养数据
- `unit`：当前主要为 `100g`、`100ml`、`个`
- `tags`：适用场景，如 `breakfast`、`canteen`、`takeout`、`home`、`snack`、`convenience`

## 注意

当前营养数据用于计划生成和产品测试，属于估算值。正式上线前建议：

- 统一数据来源。
- 增加数据来源字段和版本字段。
- 区分生重、熟重、带油烹饪和外卖估算。
- 增加后台内容管理能力，避免每次改库都发版。
