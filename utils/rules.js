const { exercises } = require("../data/exercises");
const { foods } = require("../data/foods");
const { round, clamp } = require("./format");

const dayNames = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const muscleNames = {
  chest: "胸部",
  back: "背部",
  legs: "腿部",
  glutes: "臀部",
  shoulders: "肩部",
  triceps: "肱三头肌",
  biceps: "肱二头肌",
  core: "核心",
  cardio: "有氧"
};

const goalLabels = {
  fat_loss: "减脂",
  muscle_gain: "增肌",
  shape: "塑形",
  health: "保持健康"
};

const levelLabels = {
  beginner: "新手",
  novice: "初级",
  intermediate: "中级",
  advanced: "高级"
};

const locationLabels = {
  home: "居家",
  gym: "健身房",
  outdoor: "户外"
};

const equipmentLabels = {
  none: "无器械",
  dumbbell: "哑铃",
  barbell: "杠铃",
  band: "弹力带",
  machine: "健身房器械",
  mat: "瑜伽垫",
  free_weight: "自由重量",
  running: "跑步",
  walking: "快走",
  jump_rope: "跳绳",
  cycling: "骑行",
  bodyweight: "自重训练"
};

function normalizeProfile(input) {
  const weight = Number(input.weight || 60);
  const height = Number(input.height || 165);
  const age = Number(input.age || 25);
  return {
    gender: input.gender || "female",
    age,
    height,
    weight,
    targetWeight: Number(input.targetWeight || weight),
    goal: input.goal || "fat_loss",
    planStyle: input.planStyle || "auto",
    level: input.level || "beginner",
    location: input.location || "home",
    equipment: input.equipment || "none",
    weeklyDays: clamp(Number(input.weeklyDays || 3), 2, 6),
    sessionMinutes: Number(input.sessionMinutes || 30),
    activityLevel: input.activityLevel || "light",
    dietMode: input.dietMode || "takeout",
    dietPattern: input.dietPattern || "normal",
    breakfastHabit: input.breakfastHabit || "eat",
    noBreakfast: Boolean(input.noBreakfast) || input.breakfastHabit === "skip",
    avoidFoods: input.avoidFoods || "",
    injuries: input.injuries || []
  };
}

function riskCheck(profile) {
  const risks = [];
  const bmi = profile.weight / Math.pow(profile.height / 100, 2);
  if (profile.age < 18) risks.push("未成年人建议在监护人和专业人士指导下训练。");
  if (bmi >= 32) risks.push("当前 BMI 较高，建议从低冲击训练开始，并优先咨询医生或专业教练。");
  if (bmi < 18.5) risks.push("当前 BMI 偏低，不建议自行进行大热量缺口减脂。");
  if (profile.injuries.length) risks.push("已标记伤病限制，系统会避开相关动作，但疼痛时应停止训练。");
  return {
    bmi: round(bmi, 1),
    risks
  };
}

function calculateNutrition(profile) {
  const bmr =
    profile.gender === "male"
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };
  const tdee = bmr * (activityMap[profile.activityLevel] || 1.375);
  let targetCalories = tdee;
  if (profile.goal === "fat_loss") targetCalories = tdee - 400;
  if (profile.goal === "muscle_gain") targetCalories = tdee + 300;
  const minCalories = profile.gender === "male" ? 1500 : 1200;
  targetCalories = Math.max(targetCalories, minCalories);

  const proteinPerKg = profile.goal === "muscle_gain" ? 2 : profile.goal === "fat_loss" ? 1.8 : 1.5;
  const protein = profile.weight * proteinPerKg;
  const fatCalories = targetCalories * 0.25;
  const fat = fatCalories / 9;
  const carbs = (targetCalories - protein * 4 - fatCalories) / 4;

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    targetCalories: round(targetCalories),
    protein: round(protein),
    carbs: round(carbs),
    fat: round(fat),
    minCalories
  };
}

function getWorkoutStructure(profile) {
  const days = profile.weeklyDays;
  if (profile.planStyle === "split") {
    if (days <= 2) return ["upper", "lower"];
    if (days === 3) return ["upper_push", "upper_pull", "lower"];
    if (days === 4) return ["upper_push", "lower", "upper_pull", "lower_core"];
    if (days === 5) return ["chest", "back", "legs", "shoulders", "arms_core"];
    return ["chest", "back", "legs", "shoulders", "arms_core", "cardio_core"];
  }
  if (profile.planStyle === "full_body" || profile.planStyle === "home_bodyweight") {
    if (days <= 2) return ["full_body_a", "full_body_b"];
    if (days === 3) return ["full_body_a", "full_body_b", "cardio_core"];
    if (days === 4) return ["full_body_a", "cardio", "full_body_b", "lower_core"];
    return ["full_body_a", "cardio", "full_body_b", "lower_core", "cardio_core"].slice(0, days);
  }
  if (profile.planStyle === "strength_cardio") {
    if (days <= 2) return ["full_body_a", "cardio_core"];
    if (days === 3) return ["full_body_a", "cardio", "full_body_b"];
    if (days === 4) return ["full_body_a", "cardio", "lower_core", "full_body_b"];
    return ["full_body_a", "cardio", "upper", "lower_core", "cardio_core"].slice(0, days);
  }
  if (profile.planStyle === "cardio_focus") {
    if (days <= 2) return ["cardio", "full_body_a"];
    if (days === 3) return ["cardio", "full_body_a", "cardio_core"];
    if (days === 4) return ["cardio", "full_body_a", "cardio", "lower_core"];
    return ["cardio", "full_body_a", "cardio", "lower_core", "cardio_core"].slice(0, days);
  }
  if (profile.planStyle === "light_shape") {
    if (days <= 2) return ["full_body_a", "cardio_core"];
    if (days === 3) return ["full_body_a", "lower_core", "cardio_core"];
    return ["full_body_a", "cardio_core", "lower_core", "full_body_b"].slice(0, days);
  }
  if (profile.level === "beginner" || profile.goal === "fat_loss" || profile.location !== "gym") {
    if (days <= 2) return ["full_body_a", "full_body_b"];
    if (days === 3) return ["full_body_a", "cardio_core", "full_body_b"];
    if (days === 4) return ["full_body_a", "cardio", "lower_core", "full_body_b"];
    return ["full_body_a", "cardio", "upper", "lower_core", "full_body_b"];
  }
  if (profile.goal === "muscle_gain" && profile.location === "gym") {
    if (days <= 3) return ["full_body_a", "full_body_b", "upper"];
    if (days === 4) return ["upper_push", "lower", "upper_pull", "lower_core"];
    if (days === 5) return ["chest", "back", "legs", "shoulders", "arms_core"];
    return ["chest", "back", "legs", "shoulders", "arms_core", "cardio_core"];
  }
  return ["full_body_a", "cardio_core", "full_body_b"].slice(0, days);
}

function recommendPlanOptions(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const options = [];
  let primary;
  if (profile.goal === "muscle_gain" && profile.location === "gym" && profile.weeklyDays >= 4) {
    primary = {
      id: "muscle_split",
      name: "分化力量训练",
      planStyle: "split",
      reason: "你有健身房条件且目标是增肌，分化训练更适合安排足够力量训练量。"
    };
  } else if (profile.goal === "fat_loss" && profile.location === "outdoor") {
    primary = {
      id: "fat_loss_cardio",
      name: "有氧为主 + 基础力量",
      planStyle: "cardio_focus",
      reason: "你选择户外训练，适合用快走、慢跑或骑行提高消耗，同时保留基础力量训练。"
    };
  } else if (profile.goal === "fat_loss") {
    primary = {
      id: "fat_loss_strength_cardio",
      name: "简单力量 + 有氧",
      planStyle: "strength_cardio",
      reason: "适合减脂和新手入门，既能提高消耗，也能保留肌肉，更容易长期坚持。"
    };
  } else if (profile.goal === "shape") {
    primary = {
      id: "light_shape",
      name: "轻量塑形",
      planStyle: "light_shape",
      reason: "塑形更适合稳定、不过度疲劳的训练安排，重点保持动作质量和执行率。"
    };
  } else {
    primary = {
      id: "full_body_health",
      name: "全身轻量训练",
      planStyle: "full_body",
      reason: "保持健康优先考虑低门槛、全身覆盖和稳定运动习惯。"
    };
  }
  options.push(primary);
  [
    { id: "full_body", name: "全身轻量训练", planStyle: "full_body", reason: "适合小白，每次多个部位都练一点，恢复压力较低。" },
    { id: "strength_cardio", name: "简单力量 + 有氧", planStyle: "strength_cardio", reason: "适合减脂和新手入门，力量训练保留肌肉，有氧提高消耗。" },
    { id: "cardio_focus", name: "有氧为主", planStyle: "cardio_focus", reason: "适合喜欢跑步、快走、骑行的人，提高日常消耗。" },
    { id: "split", name: "分化训练", planStyle: "split", reason: "适合增肌或有健身房条件的人，把训练量集中到不同部位。" },
    { id: "light_shape", name: "轻量塑形", planStyle: "light_shape", reason: "适合不想太累的人，训练压力低，更容易长期坚持。" },
    { id: "home_bodyweight", name: "居家无器械", planStyle: "home_bodyweight", reason: "适合器械少、时间碎片化的人，动作门槛更低。" }
  ].forEach((item) => {
    if (!options.some((option) => option.planStyle === item.planStyle)) options.push(item);
  });
  return options.map((item, index) => ({
    ...item,
    recommended: index === 0,
    weeklyDays: profile.weeklyDays,
    sessionMinutes: profile.sessionMinutes,
    goal: profile.goal,
    targetCalories: calculateNutrition(profile).targetCalories
  }));
}

function titleForType(type) {
  const map = {
    full_body_a: "全身力量 A",
    full_body_b: "全身力量 B",
    cardio_core: "低强度有氧与核心",
    cardio: "低强度有氧",
    lower_core: "下肢与核心",
    upper: "上肢训练",
    upper_push: "上肢推训练",
    upper_pull: "上肢拉训练",
    lower: "下肢训练",
    chest: "胸部训练",
    back: "背部训练",
    legs: "腿部训练",
    shoulders: "肩部训练",
    arms_core: "手臂与核心"
  };
  return map[type] || "训练日";
}

function preferredTypes(type) {
  const map = {
    full_body_a: ["lower", "push", "pull", "core"],
    full_body_b: ["lower", "pull", "push", "core"],
    cardio_core: ["cardio", "core", "core"],
    cardio: ["cardio"],
    lower_core: ["lower", "lower", "core"],
    upper: ["push", "pull", "push", "pull"],
    upper_push: ["push", "push", "core"],
    upper_pull: ["pull", "pull", "core"],
    lower: ["lower", "lower", "lower"],
    chest: ["push", "push", "push"],
    back: ["pull", "pull", "pull"],
    legs: ["lower", "lower", "lower"],
    shoulders: ["push", "push", "core"],
    arms_core: ["push", "pull", "core"]
  };
  return map[type] || ["lower", "push", "pull", "core"];
}

function canUseExercise(exercise, profile, desiredType) {
  const equipmentOk =
    exercise.equipment.includes(profile.equipment) ||
    exercise.equipment.includes("none") ||
    (profile.location === "gym" && exercise.equipment.includes("machine"));
  const injuryOk = !(exercise.avoidIf || []).some((tag) => profile.injuries.includes(tag));
  return (
    exercise.type === desiredType &&
    exercise.locations.includes(profile.location) &&
    equipmentOk &&
    exercise.levels.includes(profile.level) &&
    exercise.goals.includes(profile.goal) &&
    injuryOk
  );
}

const exerciseSelectionPriority = {
  dumbbell_sumo_squat: 100,
  dumbbell_goblet_squat: 98,
  dumbbell_floor_press: 100,
  dumbbell_press: 98,
  dumbbell_supported_row: 100,
  dumbbell_row: 98,
  dumbbell_hip_thrust: 94,
  dumbbell_russian_twist: 90,
  dumbbell_dead_bug: 88,
  dumbbell_side_bend: 80,
  dumbbell_farmer_walk: 96,
  dumbbell_thruster: 94
};

function pickExercise(type, profile, usedIds) {
  let candidates = exercises.filter((exercise) => canUseExercise(exercise, profile, type));
  if (!candidates.length) {
    candidates = exercises.filter((exercise) => exercise.type === type && exercise.locations.includes(profile.location));
  }
  if (!candidates.length) {
    candidates = exercises.filter((exercise) => exercise.type === type);
  }
  const fresh = candidates
    .filter((exercise) => !usedIds.includes(exercise.id))
    .sort((a, b) => {
      const exactEquipmentDiff = Number(b.equipment.includes(profile.equipment)) - Number(a.equipment.includes(profile.equipment));
      if (exactEquipmentDiff) return exactEquipmentDiff;
      return (exerciseSelectionPriority[b.id] || 0) - (exerciseSelectionPriority[a.id] || 0);
    })[0];
  return fresh || candidates[0];
}

function buildWorkoutExercises(type, profile) {
  const usedIds = [];
  const maxByMinutes = profile.sessionMinutes <= 20 ? 3 : profile.sessionMinutes <= 35 ? 4 : 5;
  return preferredTypes(type)
    .slice(0, maxByMinutes)
    .map((exerciseType, index) => {
      const exercise = pickExercise(exerciseType, profile, usedIds);
      usedIds.push(exercise.id);
      const intensityOffset = profile.level === "beginner" ? -1 : profile.level === "advanced" ? 1 : 0;
      const sets = Math.max(1, exercise.defaultSets + intensityOffset);
      return {
        id: `${type}_${exercise.id}_${index}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        muscleGroups: exercise.muscleGroups,
        sets,
        reps: exercise.defaultReps,
        weight: "",
        restSeconds: exercise.defaultRest,
        instruction: exercise.instruction,
        sortOrder: index + 1,
        isCustom: false
      };
    });
}

function warmupTypes(type) {
  const map = {
    full_body_a: ["general", "lower", "upper"],
    full_body_b: ["general", "lower", "upper"],
    cardio_core: ["cardio", "ankle", "core"],
    cardio: ["cardio", "ankle"],
    lower_core: ["general", "lower", "core"],
    upper: ["general", "upper", "back"],
    upper_push: ["general", "shoulder", "push"],
    upper_pull: ["general", "shoulder", "pull"],
    lower: ["general", "lower", "glute"],
    chest: ["general", "shoulder", "push"],
    back: ["general", "shoulder", "pull"],
    legs: ["general", "lower", "glute"],
    shoulders: ["general", "shoulder", "upper"],
    arms_core: ["general", "shoulder", "core"]
  };
  return map[type] || ["general", "lower", "upper"];
}

function warmupPoolByKind(kind) {
  const map = {
    general: ["warmup_march", "warmup_joint_circle"],
    cardio: ["warmup_light_walk", "warmup_march", "warmup_jumping_jack_low"],
    ankle: ["warmup_ankle_circle", "warmup_leg_swing"],
    shoulder: ["warmup_dumbbell_halo", "warmup_shoulder_circle", "warmup_scapular_pushup", "warmup_band_pull_apart"],
    upper: ["warmup_dumbbell_halo", "warmup_shoulder_circle", "warmup_joint_circle"],
    push: ["warmup_dumbbell_halo", "warmup_scapular_pushup", "warmup_shoulder_circle"],
    pull: ["warmup_band_pull_apart", "warmup_cat_cow", "warmup_shoulder_circle"],
    back: ["warmup_cat_cow", "warmup_band_pull_apart"],
    lower: ["warmup_dumbbell_rdl", "warmup_hip_circle", "warmup_leg_swing", "warmup_bodyweight_squat"],
    glute: ["warmup_glute_bridge", "warmup_hip_circle"],
    core: ["warmup_cat_cow", "warmup_joint_circle"]
  };
  return map[kind] || map.general;
}

function canUseWarmup(exercise, profile) {
  const equipmentOk =
    exercise.equipment.includes(profile.equipment) ||
    exercise.equipment.includes("none") ||
    (profile.location === "gym" && exercise.equipment.includes("machine"));
  const injuryOk = !(exercise.avoidIf || []).some((tag) => profile.injuries.includes(tag));
  return (
    exercise.type === "warmup" &&
    exercise.locations.includes(profile.location) &&
    equipmentOk &&
    exercise.levels.includes(profile.level) &&
    exercise.goals.includes(profile.goal) &&
    injuryOk
  );
}

function pickWarmup(kind, profile, usedIds) {
  const preferredIds = warmupPoolByKind(kind);
  let candidates = preferredIds.map((id) => exercises.find((item) => item.id === id)).filter(Boolean);
  candidates = candidates.filter((item) => canUseWarmup(item, profile));
  if (!candidates.length) {
    candidates = exercises.filter((item) => item.type === "warmup" && canUseWarmup(item, profile));
  }
  if (!candidates.length) {
    candidates = exercises.filter((item) => item.type === "warmup");
  }
  const fresh = candidates.find((item) => !usedIds.includes(item.id));
  return fresh || candidates[0];
}

function buildWarmupExercises(type, rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const usedIds = [];
  const count = profile.sessionMinutes <= 20 ? 2 : 3;
  return warmupTypes(type)
    .slice(0, count)
    .map((kind, index) => {
      const exercise = pickWarmup(kind, profile, usedIds);
      usedIds.push(exercise.id);
      return {
        id: `${type}_warmup_${exercise.id}_${index}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        muscleGroups: exercise.muscleGroups,
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        weight: "",
        restSeconds: exercise.defaultRest,
        instruction: exercise.instruction,
        sortOrder: index + 1,
        isWarmup: true,
        isCustom: false
      };
    });
}

function stretchTypes(type) {
  const map = {
    full_body_a: ["upper", "lower", "back"],
    full_body_b: ["lower", "back", "upper"],
    cardio_core: ["calf", "lower", "core"],
    cardio: ["calf", "lower"],
    lower_core: ["lower", "glute", "core"],
    upper: ["upper", "back", "shoulder"],
    upper_push: ["chest", "shoulder", "triceps"],
    upper_pull: ["back", "shoulder", "biceps"],
    lower: ["quad", "hamstring", "glute"],
    chest: ["chest", "shoulder", "triceps"],
    back: ["back", "shoulder", "biceps"],
    legs: ["quad", "hamstring", "glute"],
    shoulders: ["shoulder", "upper", "triceps"],
    arms_core: ["biceps", "triceps", "core"]
  };
  return map[type] || ["upper", "lower", "back"];
}

function stretchPoolByKind(kind) {
  const map = {
    upper: ["stretch_shoulder_cross_body", "stretch_chest_wall"],
    lower: ["stretch_hamstring_standing", "stretch_quad_standing"],
    back: ["stretch_child_pose", "stretch_cat_cow_hold"],
    calf: ["stretch_calf_wall", "stretch_hamstring_standing"],
    core: ["stretch_cobra", "stretch_child_pose"],
    chest: ["stretch_chest_wall", "stretch_triceps_overhead"],
    shoulder: ["stretch_shoulder_cross_body", "stretch_triceps_overhead"],
    triceps: ["stretch_triceps_overhead", "stretch_shoulder_cross_body"],
    biceps: ["stretch_biceps_wall", "stretch_shoulder_cross_body"],
    quad: ["stretch_quad_standing", "stretch_hip_flexor_lunge"],
    hamstring: ["stretch_hamstring_standing", "stretch_seated_forward_fold"],
    glute: ["stretch_figure_four", "stretch_hip_flexor_lunge"]
  };
  return map[kind] || map.upper;
}

function canUseStretch(exercise, profile) {
  const injuryOk = !(exercise.avoidIf || []).some((tag) => profile.injuries.includes(tag));
  return (
    exercise.type === "stretch" &&
    exercise.locations.includes(profile.location) &&
    exercise.levels.includes(profile.level) &&
    exercise.goals.includes(profile.goal) &&
    injuryOk
  );
}

function pickStretch(kind, profile, usedIds) {
  const preferredIds = stretchPoolByKind(kind);
  let candidates = preferredIds.map((id) => exercises.find((item) => item.id === id)).filter(Boolean);
  candidates = candidates.filter((item) => canUseStretch(item, profile));
  if (!candidates.length) {
    candidates = exercises.filter((item) => item.type === "stretch" && canUseStretch(item, profile));
  }
  if (!candidates.length) {
    candidates = exercises.filter((item) => item.type === "stretch");
  }
  const fresh = candidates.find((item) => !usedIds.includes(item.id));
  return fresh || candidates[0];
}

function buildStretchExercises(type, rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const usedIds = [];
  const count = profile.sessionMinutes <= 20 ? 2 : 3;
  return stretchTypes(type)
    .slice(0, count)
    .map((kind, index) => {
      const exercise = pickStretch(kind, profile, usedIds);
      usedIds.push(exercise.id);
      return {
        id: `${type}_stretch_${exercise.id}_${index}`,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        type: exercise.type,
        muscleGroups: exercise.muscleGroups,
        sets: exercise.defaultSets,
        reps: exercise.defaultReps,
        weight: "",
        restSeconds: exercise.defaultRest,
        instruction: exercise.instruction,
        sortOrder: index + 1,
        isStretch: true,
        isCustom: false
      };
    });
}

function ensureWorkoutWarmups(plan, rawProfile) {
  if (!plan || !Array.isArray(plan.days)) return plan;
  const profile = normalizeProfile(rawProfile || {});
  return {
    ...plan,
    days: plan.days.map((day) => {
      if (!day || day.isRestDay) {
        return {
          ...day,
          warmups: [],
          stretches: []
        };
      }
      const warmups = Array.isArray(day.warmups) ? day.warmups : buildWarmupExercises(day.trainingType, profile);
      const stretches = Array.isArray(day.stretches) ? day.stretches : buildStretchExercises(day.trainingType, profile);
      return {
        ...day,
        warmups,
        stretches,
        exercises: day.exercises || []
      };
    })
  };
}

function buildWorkoutDayFromType(dayIndex, type, rawProfile, overrides = {}) {
  const profile = normalizeProfile(rawProfile);
  if (type === "rest") {
    return {
      id: overrides.id || `day_${dayIndex + 1}`,
      dayOfWeek: dayIndex,
      dayName: dayNames[dayIndex],
      title: overrides.title || "休息",
      trainingType: "rest",
      isRestDay: true,
      sortOrder: dayIndex + 1,
      warmups: [],
      stretches: [],
      exercises: []
    };
  }
  return {
    id: overrides.id || `day_${dayIndex + 1}`,
    dayOfWeek: dayIndex,
    dayName: dayNames[dayIndex],
    title: overrides.title || titleForType(type),
    trainingType: type,
    isRestDay: false,
    sortOrder: dayIndex + 1,
    warmups: buildWarmupExercises(type, profile),
    stretches: buildStretchExercises(type, profile),
    exercises: buildWorkoutExercises(type, profile)
  };
}

function generateWorkoutPlan(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const structure = getWorkoutStructure(profile);
  const workoutDays = [];
  let structureIndex = 0;
  for (let i = 0; i < 7; i += 1) {
    const shouldTrain = structureIndex < structure.length && spreadTrainingDay(i, structureIndex, structure.length);
    if (shouldTrain) {
      const trainingType = structure[structureIndex];
      workoutDays.push({
        id: `day_${i + 1}`,
        dayOfWeek: i,
        dayName: dayNames[i],
        title: titleForType(trainingType),
        trainingType,
        isRestDay: false,
        sortOrder: i + 1,
        warmups: buildWarmupExercises(trainingType, profile),
        stretches: buildStretchExercises(trainingType, profile),
        exercises: buildWorkoutExercises(trainingType, profile)
      });
      structureIndex += 1;
    } else {
      workoutDays.push({
        id: `day_${i + 1}`,
        dayOfWeek: i,
        dayName: dayNames[i],
        title: "休息",
        trainingType: "rest",
        isRestDay: true,
        sortOrder: i + 1,
        warmups: [],
        stretches: [],
        exercises: []
      });
    }
  }
  const validation = validateWorkoutPlan(workoutDays, profile);
  return {
    id: `plan_${Date.now()}`,
    goal: profile.goal,
    goalLabel: goalLabels[profile.goal],
    level: profile.level,
    location: profile.location,
    planStyle: profile.planStyle,
    weeklyDays: profile.weeklyDays,
    sessionMinutes: profile.sessionMinutes,
    days: workoutDays,
    warnings: validation.warnings,
    volume: validation.volume,
    createdAt: Date.now()
  };
}

function spreadTrainingDay(dayIndex, structureIndex, total) {
  const patterns = {
    2: [0, 3],
    3: [0, 2, 4],
    4: [0, 1, 3, 5],
    5: [0, 1, 2, 4, 5],
    6: [0, 1, 2, 3, 4, 5]
  };
  return (patterns[total] || patterns[3])[structureIndex] === dayIndex;
}

function validateWorkoutPlan(days, profile) {
  const volume = {};
  const warnings = [];
  let trainingDays = 0;
  days.forEach((day) => {
    if (!day.isRestDay) trainingDays += 1;
    day.exercises.forEach((exercise) => {
      exercise.muscleGroups.forEach((group) => {
        volume[group] = (volume[group] || 0) + Number(exercise.sets || 0);
      });
    });
  });

  if (!volume.legs && !volume.glutes) warnings.push("本周没有明显下肢训练，建议至少保留 4-8 组轻量臀腿训练或安排低强度有氧。");
  if (!volume.back) warnings.push("本周背部训练量偏低，建议加入划船、下拉或弹力带拉类动作。");
  if (!volume.core) warnings.push("本周核心训练量偏低，建议加入死虫、鸟狗或平板支撑。");
  if (trainingDays > 5 && profile.level === "beginner") warnings.push("新手每周训练天数较多，如疲劳明显可减少 1 天。");

  for (let i = 1; i < days.length; i += 1) {
    const prevTypes = new Set(days[i - 1].exercises.flatMap((item) => item.muscleGroups));
    const currTypes = new Set(days[i].exercises.flatMap((item) => item.muscleGroups));
    const overlap = [...currTypes].filter((item) => prevTypes.has(item) && item !== "core" && item !== "cardio");
    if (overlap.length && !days[i].isRestDay && !days[i - 1].isRestDay) {
      warnings.push(`${days[i - 1].dayName} 和 ${days[i].dayName} 有连续相同肌群训练，注意恢复。`);
      break;
    }
  }

  return {
    warnings,
    volume: Object.keys(volume).map((key) => ({
      key,
      name: muscleNames[key] || key,
      sets: volume[key]
    }))
  };
}

function chooseFoodsByType(type, profile) {
  const avoid = profile.avoidFoods || "";
  const tag = profile.dietMode === "canteen" ? "canteen" : profile.dietMode === "home" ? "home" : profile.dietMode === "mixed" ? "" : "takeout";
  return foods.filter(
    (food) =>
      food.type === type &&
      !avoid.includes(food.name) &&
      (!tag ||
        food.tags.includes(tag) ||
        food.tags.includes("home") ||
        food.tags.includes("breakfast") ||
        food.tags.includes("snack") ||
        food.tags.includes("convenience"))
  );
}

function macroForFood(food, amount) {
  const ratio = Number(amount || 0) / 100;
  const unitRatio = food.unit === "个" ? Number(amount || 0) : ratio;
  const factor = food.unit === "个" ? unitRatio : ratio;
  return {
    calories: round(food.calories * factor, 1),
    protein: round(food.protein * factor, 1),
    carbs: round(food.carbs * factor, 1),
    fat: round(food.fat * factor, 1)
  };
}

function mealFood(food, amount) {
  const macro = macroForFood(food, amount);
  return {
    id: `${food.id}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    foodId: food.id,
    foodName: food.name,
    amount,
    unit: food.unit,
    ...macro,
    isCustom: false
  };
}

function foodById(id, fallback) {
  return foods.find((item) => item.id === id) || fallback || foods[0];
}

function buildMealFoods(type, index, profile, pools) {
  const { proteins, solidProteins, carbs, vegetables, fats } = pools;
  const fatLoss = profile.goal === "fat_loss";
  const muscleGain = profile.goal === "muscle_gain";

  if (type === "breakfast") {
    if (profile.dietMode === "canteen") {
      return [
        mealFood(foodById("egg", proteins[0]), 2),
        mealFood(foodById("steamed_bun", carbs[0]), fatLoss ? 60 : 90),
        mealFood(foodById("soy_milk", proteins[0]), 250)
      ];
    }
    if (profile.dietMode === "takeout") {
      return [
        mealFood(foodById("oatmeal_bowl", foods.find((item) => item.type === "mixed")), fatLoss ? 240 : 320),
        mealFood(foodById("egg", proteins[0]), 1)
      ];
    }
    return [
      mealFood(foodById("egg", proteins[0]), 2),
      mealFood(foodById("oats", carbs[0]), 40),
      mealFood(foodById("milk", proteins[0]), 250)
    ];
  }

  if (type === "snack") {
    if (muscleGain) {
      return [
        mealFood(foodById("greek_yogurt", proteins[0]), 180),
        mealFood(foodById("banana", carbs[0]), 100),
        mealFood(foodById("nuts", fats[0]), 10)
      ];
    }
    return [
      mealFood(foodById("yogurt", proteins[0]), 150),
      mealFood(foodById("apple", carbs[0]), 100)
    ];
  }

  if (profile.dietMode === "takeout") {
    const lunch = index % 2 === 0;
    if (fatLoss) {
      return [
        mealFood(foodById(lunch ? "light_salad" : "malatang_plain", foods.find((item) => item.type === "mixed")), lunch ? 360 : 420),
        mealFood(foodById("yogurt", proteins[0]), 120)
      ];
    }
    return [
      mealFood(foodById(lunch ? "chicken_rice_bowl" : "beef_rice_bowl", foods.find((item) => item.type === "mixed")), muscleGain ? 420 : 340),
      mealFood(foodById("cucumber", vegetables[0]), 100)
    ];
  }

  if (profile.dietMode === "canteen") {
    return [
      mealFood(foodById("rice", carbs[0]), fatLoss ? 120 : 180),
      mealFood(foodById(index % 2 === 0 ? "chicken_leg" : "fish", solidProteins[index % solidProteins.length] || proteins[0]), muscleGain ? 190 : 150),
      mealFood(foodById(index % 2 === 0 ? "cabbage" : "tomato", vegetables[index % vegetables.length]), 220)
    ];
  }

  return [
    mealFood(foodById(index % 2 === 0 ? "brown_rice" : "sweet_potato", carbs[0]), fatLoss ? 140 : 200),
    mealFood(solidProteins[index % solidProteins.length] || proteins[index % proteins.length], muscleGain ? 190 : 160),
    mealFood(vegetables[index % vegetables.length] || foods.find((item) => item.type === "vegetable"), 200),
    ...(muscleGain ? [mealFood(fats[0] || foodById("nuts"), 10)] : [])
  ];
}

function generateMealPlan(rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const nutrition = calculateNutrition(profile);
  const distribution = profile.noBreakfast
    ? [
        ["lunch", "午餐", 0.45],
        ["dinner", "晚餐", 0.4],
        ["snack", "加餐", 0.15]
      ]
    : [
        ["breakfast", "早餐", 0.25],
        ["lunch", "午餐", 0.35],
        ["dinner", "晚餐", 0.3],
        ["snack", "加餐", 0.1]
      ];
  const proteins = chooseFoodsByType("protein", profile);
  const solidProteins = proteins.filter(
    (item) =>
      item.tags.some((tag) => ["canteen", "takeout", "home"].includes(tag)) &&
      !["milk", "low_fat_milk", "soy_milk", "yogurt", "greek_yogurt", "egg", "egg_white", "protein_powder"].includes(item.id)
  );
  const carbs = chooseFoodsByType("carb", profile);
  const vegetables = chooseFoodsByType("vegetable", profile);
  const fats = chooseFoodsByType("fat", profile);

  const pools = {
    proteins,
    solidProteins,
    carbs,
    vegetables,
    fats
  };

  const meals = distribution.map(([type, name, ratio], index) => {
    const targetCalories = round(nutrition.targetCalories * ratio);
    const items = buildMealFoods(type, index, profile, pools);
    return {
      id: `meal_${type}`,
      mealType: type,
      mealName: name,
      targetCalories,
      foods: items,
      sortOrder: index + 1
    };
  });

  fitMealsToTarget(meals, nutrition);
  const totals = calculateMealTotals(meals);
  const validation = validateMealPlan(totals, nutrition, profile);
  return {
    id: `meal_plan_${Date.now()}`,
    targetCalories: nutrition.targetCalories,
    targetProtein: nutrition.protein,
    targetCarbs: nutrition.carbs,
    targetFat: nutrition.fat,
    bmr: nutrition.bmr,
    tdee: nutrition.tdee,
    meals,
    totals,
    warnings: validation.warnings,
    createdAt: Date.now()
  };
}

function fitMealsToTarget(meals, nutrition) {
  const totals = calculateMealTotals(meals);
  if (!totals.calories) return;
  const factor = clamp(nutrition.targetCalories / totals.calories, 0.75, 1.55);
  meals.forEach((meal) => {
    meal.foods.forEach((item) => {
      const source = foods.find((food) => food.id === item.foodId);
      if (!source || source.type === "vegetable" || source.unit === "个") return;
      const nextAmount = Math.max(20, Math.round((Number(item.amount) * factor) / 10) * 10);
      const macro = macroForFood(source, nextAmount);
      item.amount = nextAmount;
      item.calories = macro.calories;
      item.protein = macro.protein;
      item.carbs = macro.carbs;
      item.fat = macro.fat;
    });
  });
}

function calculateMealTotals(meals) {
  const totals = meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((food) => {
        acc.calories += Number(food.calories || 0);
        acc.protein += Number(food.protein || 0);
        acc.carbs += Number(food.carbs || 0);
        acc.fat += Number(food.fat || 0);
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return {
    calories: round(totals.calories, 1),
    protein: round(totals.protein, 1),
    carbs: round(totals.carbs, 1),
    fat: round(totals.fat, 1)
  };
}

function validateMealPlan(totals, target, profile) {
  const warnings = [];
  const calorieGap = totals.calories - target.targetCalories;
  if (calorieGap > target.targetCalories * 0.12) {
    warnings.push(`当前热量超出目标 ${round(calorieGap)} kcal，建议减少主食、油脂或高热量组合餐。`);
  } else if (calorieGap < -target.targetCalories * 0.12) {
    warnings.push(`当前热量低于目标 ${round(Math.abs(calorieGap))} kcal，长期过低可能影响训练状态和恢复。`);
  }
  if (totals.calories < target.minCalories) {
    warnings.push("当前摄入低于最低保护热量，不建议长期执行。");
  }
  if (totals.protein < target.protein * 0.9) {
    warnings.push("蛋白质偏低，建议增加鸡蛋、鱼虾、瘦肉、豆腐、牛奶或无糖酸奶。");
  } else if (totals.protein > target.protein * 1.35) {
    warnings.push("蛋白质明显高于目标，若总热量也偏高，可以适当减少肉类或蛋白粉份量。");
  }
  if (totals.carbs < target.carbs * 0.75) {
    warnings.push("碳水偏低，可能影响训练表现，可增加米饭、红薯、燕麦、玉米等主食。");
  } else if (totals.carbs > target.carbs * 1.25) {
    warnings.push("碳水偏高，建议优先调整米饭、面条、盖饭或甜食份量。");
  }
  if (totals.fat < target.fat * 0.65) {
    warnings.push("脂肪摄入偏低，可少量加入坚果、牛油果、橄榄油或鱼类。");
  } else if (totals.fat > target.fat * 1.35) {
    warnings.push("脂肪摄入偏高，建议减少油炸、肥肉、坚果或高油外卖。");
  }
  if (profile.goal === "fat_loss" && totals.calories > target.targetCalories * 1.15) {
    warnings.push("减脂目标下当前热量偏高，建议减少油脂、甜饮或主食份量。");
  }
  return {
    warnings
  };
}

function recalculateMealPlan(plan, profile) {
  const normalized = normalizeProfile(profile);
  const nutrition = calculateNutrition(normalized);
  const totals = calculateMealTotals(plan.meals);
  const validation = validateMealPlan(totals, nutrition, normalized);
  return {
    ...plan,
    targetCalories: nutrition.targetCalories,
    targetProtein: nutrition.protein,
    targetCarbs: nutrition.carbs,
    targetFat: nutrition.fat,
    bmr: nutrition.bmr,
    tdee: nutrition.tdee,
    totals,
    warnings: validation.warnings,
    updatedAt: Date.now()
  };
}

function recalculateWorkoutPlan(plan, profile) {
  const normalized = normalizeProfile(profile);
  const planWithWarmups = ensureWorkoutWarmups(plan, normalized);
  const validation = validateWorkoutPlan(planWithWarmups.days, normalized);
  return {
    ...planWithWarmups,
    warnings: validation.warnings,
    volume: validation.volume,
    updatedAt: Date.now()
  };
}

function getExerciseAlternatives(exerciseId, profile) {
  const current = exercises.find((item) => item.id === exerciseId);
  if (!current) return [];
  const normalized = normalizeProfile(profile);
  const alternativeIds = current.alternatives || [];
  const direct = alternativeIds.map((id) => exercises.find((item) => item.id === id)).filter(Boolean);
  const sameType = exercises.filter((item) => item.type === current.type && item.id !== current.id && canUseExercise(item, normalized, current.type));
  return [...direct, ...sameType].filter((item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index);
}

function getFoodAlternatives(foodId, profile) {
  const current = foods.find((item) => item.id === foodId);
  if (!current) return [];
  return chooseFoodsByType(current.type, normalizeProfile(profile)).filter((item) => item.id !== foodId);
}

module.exports = {
  dayNames,
  goalLabels,
  levelLabels,
  locationLabels,
  equipmentLabels,
  recommendPlanOptions,
  normalizeProfile,
  riskCheck,
  calculateNutrition,
  generateWorkoutPlan,
  validateWorkoutPlan,
  recalculateWorkoutPlan,
  ensureWorkoutWarmups,
  buildWarmupExercises,
  buildStretchExercises,
  buildWorkoutDayFromType,
  generateMealPlan,
  calculateMealTotals,
  validateMealPlan,
  recalculateMealPlan,
  getExerciseAlternatives,
  getFoodAlternatives,
  macroForFood,
  muscleNames
};
