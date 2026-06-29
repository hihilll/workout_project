# 上线架构说明

## 当前 MVP 边界

当前版本是微信原生小程序 MVP，核心数据先放在本地存储中，目的是先验证用户信息录入、规则生成、计划编辑、校验提醒、饮食计算和打卡闭环。

核心模块：

- `utils/rules.js`：训练和饮食规则引擎
- `utils/storage.js`：本地数据读写，后续可替换为云函数
- `data/exercises.js`：动作库种子数据
- `data/foods.js`：食物库种子数据
- `pages/onboarding`：用户信息录入和计划生成
- `pages/plan` / `pages/workout`：训练周计划和动作编辑
- `pages/session`：训练执行、组数完成和休息倒计时
- `pages/meal`：饮食计划和食物替换
- `pages/checkin`：每日打卡
- `pages/stats`：基础统计复盘

## 后续云开发替换点

建议新增云函数：

- `loginProfile`：初始化用户并绑定 openid
- `saveProfile`：保存用户档案
- `generatePlan`：服务端生成训练和饮食计划
- `updateWorkoutPlan`：保存用户训练编辑
- `updateMealPlan`：保存用户饮食编辑
- `saveCheckin`：保存打卡
- `generateWeeklyReport`：生成周报，可接 AI

建议云数据库集合：

- `users`
- `user_profiles`
- `exercise_library`
- `food_library`
- `user_week_plans`
- `user_workout_days`
- `user_workout_exercises`
- `user_meal_plans`
- `user_meals`
- `user_meal_foods`
- `checkins`
- `orders`

## AI 接入边界

AI 不直接决定训练结构和饮食目标。可接入场景：

- 解释计划为什么这样安排
- 解释用户修改后的影响
- 生成每周复盘文案
- 根据规则结果生成更自然的建议
- 饮食替换说明

所有 AI 输出前都应该经过规则结果约束和敏感边界提示。

## 上线前合规清单

- 小程序隐私保护指引
- 用户身体信息收集用途说明
- 健康建议免责声明
- 特殊人群风险提示
- 用户输入内容安全检查
- 头像、昵称、反馈文本内容安全检查
- 云数据库权限规则
- 数据删除与导出入口
- 微信支付和会员协议
