function exercise(
  id,
  name,
  type,
  muscleGroups,
  locations,
  equipment,
  levels,
  goals,
  defaultSets,
  defaultReps,
  defaultRest,
  avoidIf,
  alternatives,
  instruction
) {
  const phase =
    type === "warmup" ? "warmup" : type === "stretch" ? "stretch" : type === "cardio" ? "cardio" : "strength";
  const lowImpact =
    phase === "warmup" ||
    phase === "stretch" ||
    type === "core" ||
    ["chair_squat", "wall_sit", "glute_bridge", "brisk_walk", "cycling", "elliptical"].includes(id);
  return {
    id,
    name,
    type,
    muscleGroups,
    locations,
    equipment,
    levels,
    goals,
    defaultSets,
    defaultReps,
    defaultRest,
    avoidIf,
    alternatives,
    instruction,
    phase,
    lowImpact
  };
}

const allLocations = ["home", "gym", "outdoor"];
const homeGym = ["home", "gym"];
const allGoals = ["fat_loss", "muscle_gain", "shape", "health"];
const beginnerPlus = ["beginner", "novice", "intermediate"];
const novicePlus = ["novice", "intermediate", "advanced"];

const exercises = [
  exercise("warmup_march", "原地踏步热身", "warmup", ["cardio"], allLocations, ["none"], beginnerPlus, allGoals, 1, "60秒", 0, [], ["warmup_light_walk", "warmup_jumping_jack_low"], "保持身体直立，手臂自然摆动，逐渐提高心率。"),
  exercise("warmup_light_walk", "轻快走", "warmup", ["cardio"], allLocations, ["none"], beginnerPlus, allGoals, 1, "3-5分钟", 0, [], ["warmup_march", "brisk_walk"], "用能轻松说话的速度快走，让身体进入运动状态。"),
  exercise("warmup_joint_circle", "全身关节环绕", "warmup", ["shoulders", "legs"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每处20秒", 0, [], ["warmup_march"], "依次活动肩、髋、膝、踝，动作轻柔，不要甩动关节。"),
  exercise("warmup_shoulder_circle", "肩部环绕", "warmup", ["shoulders"], allLocations, ["none"], beginnerPlus, allGoals, 1, "前后各30秒", 0, [], ["warmup_band_pull_apart", "warmup_scapular_pushup"], "手臂自然放松，肩关节向前和向后缓慢画圈。"),
  exercise("warmup_scapular_pushup", "肩胛俯卧撑", "warmup", ["chest", "shoulders", "back"], homeGym, ["none"], beginnerPlus, allGoals, 1, "10-12次", 0, ["shoulder_pain", "wrist_pain"], ["warmup_shoulder_circle"], "保持俯撑姿势，只做肩胛前伸和后缩，用于激活胸背肩。"),
  exercise("warmup_band_pull_apart", "弹力带拉开", "warmup", ["back", "shoulders"], homeGym, ["band"], beginnerPlus, allGoals, 1, "12-15次", 0, ["shoulder_pain"], ["warmup_shoulder_circle", "band_face_pull"], "双手握住弹力带向两侧拉开，感受上背和后肩发力。"),
  exercise("warmup_dumbbell_halo", "轻哑铃绕头", "warmup", ["shoulders", "core"], homeGym, ["dumbbell"], beginnerPlus, allGoals, 1, "每方向8次", 0, ["shoulder_pain", "wrist_pain"], ["warmup_shoulder_circle"], "双手托住轻重量哑铃绕头缓慢移动，保持核心稳定，用于活动肩关节。"),
  exercise("warmup_dumbbell_rdl", "轻哑铃髋铰链", "warmup", ["glutes", "legs", "back"], homeGym, ["dumbbell"], beginnerPlus, allGoals, 1, "10次", 0, [], ["warmup_hip_circle", "romanian_deadlift"], "使用轻重量哑铃练习髋部后移，背部保持平直，为臀腿训练建立发力感觉。"),
  exercise("warmup_cat_cow", "猫牛式", "warmup", ["back", "core"], homeGym, ["none"], beginnerPlus, allGoals, 1, "8-10次", 0, [], ["warmup_joint_circle"], "四点支撑，缓慢拱背和塌背，活动脊柱和核心。"),
  exercise("warmup_hip_circle", "髋关节环绕", "warmup", ["glutes", "legs"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, [], ["warmup_leg_swing", "warmup_bodyweight_squat"], "扶墙或自然站立，单腿屈膝向外画圈，活动髋部。"),
  exercise("warmup_leg_swing", "前后摆腿", "warmup", ["legs", "glutes"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧12次", 0, [], ["warmup_hip_circle", "warmup_bodyweight_squat"], "扶住稳定物，前后摆腿，幅度逐渐增加，避免猛甩。"),
  exercise("warmup_bodyweight_squat", "徒手深蹲热身", "warmup", ["legs", "glutes"], homeGym, ["none"], beginnerPlus, allGoals, 1, "10-12次", 0, ["knee_pain"], ["chair_squat", "warmup_hip_circle"], "用较慢速度完成深蹲，重点活动髋膝踝，不追求疲劳感。"),
  exercise("warmup_glute_bridge", "臀桥激活", "warmup", ["glutes", "core"], homeGym, ["none"], beginnerPlus, allGoals, 1, "12次", 0, [], ["glute_bridge", "warmup_hip_circle"], "仰卧屈膝，收紧臀部抬起髋部，唤醒臀部发力。"),
  exercise("warmup_ankle_circle", "踝关节环绕", "warmup", ["legs"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, [], ["warmup_march", "warmup_light_walk"], "单脚脚尖点地，缓慢环绕踝关节，适合跑步和有氧前使用。"),
  exercise("warmup_jumping_jack_low", "低冲击开合步", "warmup", ["cardio", "legs"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 1, "45秒", 0, ["knee_pain"], ["warmup_march", "warmup_light_walk"], "左右交替侧点步并配合手臂上举，低冲击提高心率。"),
  exercise("stretch_chest_wall", "墙边胸部拉伸", "stretch", ["chest", "shoulders"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, ["shoulder_pain"], ["stretch_shoulder_cross_body"], "前臂扶墙，身体缓慢向外转动，感受胸部前侧舒展。"),
  exercise("stretch_shoulder_cross_body", "肩部横向拉伸", "stretch", ["shoulders"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, ["shoulder_pain"], ["stretch_triceps_overhead"], "一侧手臂横跨胸前，另一手轻扶上臂，缓慢拉近身体。"),
  exercise("stretch_triceps_overhead", "肱三头肌拉伸", "stretch", ["triceps", "shoulders"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, ["shoulder_pain"], ["stretch_shoulder_cross_body"], "单臂屈肘置于头后，另一手轻扶肘部向内靠近。"),
  exercise("stretch_biceps_wall", "肱二头肌墙边拉伸", "stretch", ["biceps", "chest"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, ["shoulder_pain"], ["stretch_chest_wall"], "手掌扶墙，手臂伸直，身体缓慢向反方向转动。"),
  exercise("stretch_child_pose", "婴儿式背部拉伸", "stretch", ["back", "shoulders"], homeGym, ["none"], beginnerPlus, allGoals, 1, "40秒", 0, [], ["stretch_cat_cow_hold"], "跪坐后双手向前延伸，臀部靠近脚跟，放松背部。"),
  exercise("stretch_cat_cow_hold", "猫牛式舒缓", "stretch", ["back", "core"], homeGym, ["none"], beginnerPlus, allGoals, 1, "8次", 0, [], ["stretch_child_pose"], "四点支撑缓慢拱背和塌背，配合呼吸放松脊柱。"),
  exercise("stretch_cobra", "眼镜蛇式腹部拉伸", "stretch", ["core"], homeGym, ["none"], beginnerPlus, allGoals, 1, "30秒", 0, [], ["stretch_child_pose"], "俯卧后以前臂或手掌轻撑上身，保持腹部舒展，不要过度挤压腰部。"),
  exercise("stretch_quad_standing", "站姿大腿前侧拉伸", "stretch", ["legs"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, ["knee_pain"], ["stretch_hip_flexor_lunge"], "扶稳后屈膝握住脚踝，膝盖并拢，感受大腿前侧舒展。"),
  exercise("stretch_hamstring_standing", "站姿大腿后侧拉伸", "stretch", ["legs", "glutes"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, [], ["stretch_seated_forward_fold"], "一脚向前伸出并微微屈膝，髋部后移，保持背部平直。"),
  exercise("stretch_seated_forward_fold", "坐姿腿后侧拉伸", "stretch", ["legs", "glutes"], homeGym, ["none"], beginnerPlus, allGoals, 1, "40秒", 0, [], ["stretch_hamstring_standing"], "坐姿伸腿，髋部向前折叠，保持背部自然延展。"),
  exercise("stretch_hip_flexor_lunge", "跪姿髋屈肌拉伸", "stretch", ["glutes", "legs"], homeGym, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, ["knee_pain"], ["stretch_quad_standing"], "单膝跪地，骨盆轻微后收并向前移动，感受髋部前侧舒展。"),
  exercise("stretch_figure_four", "仰卧臀部拉伸", "stretch", ["glutes"], homeGym, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, [], ["stretch_hip_flexor_lunge"], "仰卧将一侧脚踝搭在另一侧膝盖上，双手轻拉支撑腿靠近身体。"),
  exercise("stretch_calf_wall", "墙边小腿拉伸", "stretch", ["legs"], allLocations, ["none"], beginnerPlus, allGoals, 1, "每侧30秒", 0, [], ["stretch_hamstring_standing"], "双手扶墙，一脚向后踩实，脚跟贴地，感受小腿后侧舒展。"),

  exercise("chair_squat", "坐姿起立", "lower", ["legs", "glutes"], homeGym, ["none"], ["beginner"], ["fat_loss", "shape", "health"], 3, "10-12", 60, [], ["bodyweight_squat", "wall_sit"], "从椅子坐姿站起，再缓慢坐回，保持膝盖方向稳定。"),
  exercise("bodyweight_squat", "徒手深蹲", "lower", ["legs", "glutes"], homeGym, ["none"], ["beginner", "novice"], ["fat_loss", "shape", "health"], 3, "12-15", 60, ["knee_pain"], ["chair_squat", "wall_sit"], "双脚与肩同宽，屈髋屈膝下蹲，膝盖方向跟随脚尖。"),
  exercise("wall_sit", "靠墙静蹲", "lower", ["legs", "glutes"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 3, "30秒", 60, [], ["chair_squat", "glute_bridge"], "背部贴墙，膝盖不要内扣，保持稳定呼吸。"),
  exercise("glute_bridge", "臀桥", "lower", ["glutes", "core"], homeGym, ["none"], beginnerPlus, allGoals, 3, "12-15", 60, [], ["single_leg_glute_bridge", "hip_thrust"], "仰卧屈膝，收紧臀部抬髋，顶端停顿 1 秒。"),
  exercise("single_leg_glute_bridge", "单腿臀桥", "lower", ["glutes", "core"], homeGym, ["none"], ["novice", "intermediate"], ["fat_loss", "shape", "muscle_gain"], 3, "每侧10-12", 75, [], ["glute_bridge", "hip_thrust"], "单脚支撑抬髋，保持骨盆水平，避免身体旋转。"),
  exercise("hip_thrust", "臀推", "lower", ["glutes", "legs"], homeGym, ["none"], ["novice", "intermediate"], ["shape", "muscle_gain"], 4, "10-12", 90, [], ["glute_bridge", "single_leg_glute_bridge"], "肩背靠在稳固支撑上，髋部向上推起，顶端收紧臀部。"),
  exercise("reverse_lunge", "后撤箭步蹲", "lower", ["legs", "glutes"], homeGym, ["none"], ["novice", "intermediate"], ["fat_loss", "shape", "health"], 3, "每侧10", 75, ["knee_pain"], ["bodyweight_squat", "chair_squat"], "向后撤步下蹲，前侧膝盖稳定，重心保持在身体中间。"),
  exercise("step_up", "台阶踏上", "lower", ["legs", "glutes"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 3, "每侧10-12", 60, ["knee_pain"], ["chair_squat", "glute_bridge"], "单脚踏上稳固台阶，身体直立，控制下放。"),
  exercise("side_lunge", "侧向弓步", "lower", ["legs", "glutes"], homeGym, ["none"], ["novice", "intermediate"], ["fat_loss", "shape"], 3, "每侧8-10", 75, ["knee_pain"], ["bodyweight_squat", "reverse_lunge"], "向侧方迈步下蹲，另一侧腿伸直，保持脚尖和膝盖同向。"),
  exercise("standing_calf_raise", "站姿提踵", "lower", ["legs"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health", "muscle_gain"], 3, "15-20", 45, [], ["dumbbell_calf_raise"], "脚跟缓慢抬起并控制下放，感受小腿发力。"),
  exercise("donkey_kick", "跪姿后踢腿", "lower", ["glutes"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 3, "每侧12-15", 45, [], ["glute_bridge", "fire_hydrant"], "四点支撑，单腿向后上方踢起，骨盆保持稳定。"),
  exercise("fire_hydrant", "跪姿侧抬腿", "lower", ["glutes"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 3, "每侧12-15", 45, [], ["donkey_kick", "glute_bridge"], "四点支撑，单腿向侧方抬起，避免腰部代偿。"),

  exercise("dumbbell_goblet_squat", "哑铃杯式深蹲", "lower", ["legs", "glutes"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain", "fat_loss"], 4, "8-12", 90, ["knee_pain"], ["bodyweight_squat", "leg_press"], "双手托住哑铃贴近胸前，下蹲时保持躯干稳定。"),
  exercise("dumbbell_reverse_lunge", "哑铃后撤箭步蹲", "lower", ["legs", "glutes"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain", "fat_loss"], 3, "每侧8-10", 90, ["knee_pain"], ["reverse_lunge", "dumbbell_goblet_squat"], "双手持哑铃，向后撤步下蹲，控制膝盖轨迹。"),
  exercise("romanian_deadlift", "哑铃罗马尼亚硬拉", "lower", ["glutes", "legs", "back"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain"], 3, "8-12", 90, [], ["glute_bridge", "leg_press"], "髋部向后折叠，背部保持平直，感受臀腿后侧拉伸。"),
  exercise("dumbbell_step_up", "哑铃台阶踏上", "lower", ["legs", "glutes"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain", "fat_loss"], 3, "每侧8-10", 90, ["knee_pain"], ["step_up", "dumbbell_goblet_squat"], "双手持哑铃踏上台阶，控制身体稳定。"),
  exercise("dumbbell_calf_raise", "哑铃提踵", "lower", ["legs"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain", "health"], 3, "12-20", 60, [], ["standing_calf_raise"], "双手持哑铃，脚跟抬起至最高点后缓慢下放。"),
  exercise("dumbbell_sumo_squat", "哑铃相扑深蹲", "lower", ["glutes", "legs"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain", "fat_loss", "health"], 3, "10-15", 75, ["knee_pain"], ["dumbbell_goblet_squat", "bodyweight_squat"], "双脚略宽于肩，脚尖适度外展，双手持哑铃下蹲，重点感受臀部与大腿内侧发力。"),
  exercise("dumbbell_split_squat", "哑铃分腿蹲", "lower", ["legs", "glutes"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain", "fat_loss"], 3, "每侧8-12", 90, ["knee_pain"], ["dumbbell_reverse_lunge", "dumbbell_step_up"], "双脚前后站立，垂直下蹲并保持躯干稳定，前侧脚掌均匀受力。"),
  exercise("dumbbell_single_leg_rdl", "单腿哑铃硬拉", "lower", ["glutes", "legs", "core"], homeGym, ["dumbbell"], ["novice", "intermediate", "advanced"], ["shape", "muscle_gain"], 3, "每侧8-10", 90, [], ["romanian_deadlift", "dumbbell_split_squat"], "单腿支撑，髋部向后折叠，哑铃沿支撑腿下放，保持骨盆尽量水平。"),
  exercise("dumbbell_hip_thrust", "哑铃臀推", "lower", ["glutes", "legs"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 4, "10-15", 75, [], ["glute_bridge", "hip_thrust"], "将哑铃稳定放在髋部，肩背靠稳固支撑，抬髋至躯干与大腿接近一条直线。"),
  exercise("dumbbell_lateral_lunge", "哑铃侧向弓步", "lower", ["legs", "glutes"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "fat_loss"], 3, "每侧8-10", 75, ["knee_pain"], ["side_lunge", "dumbbell_reverse_lunge"], "双手持哑铃向侧方迈步，屈髋下蹲，另一侧腿伸直，膝盖保持与脚尖同向。"),

  exercise("barbell_squat", "杠铃深蹲", "lower", ["legs", "glutes"], ["gym"], ["barbell"], novicePlus, ["shape", "muscle_gain"], 4, "6-10", 120, ["knee_pain"], ["smith_squat", "leg_press"], "杠铃稳定置于上背，核心收紧，控制下蹲深度并保持膝盖方向稳定。"),
  exercise("barbell_deadlift", "杠铃硬拉", "lower", ["glutes", "legs", "back"], ["gym"], ["barbell"], ["intermediate", "advanced"], ["muscle_gain"], 4, "5-8", 150, [], ["romanian_deadlift", "barbell_squat"], "杠铃贴近小腿，背部保持平直，以髋膝协同伸展完成动作。"),
  exercise("leg_press", "腿举", "lower", ["legs", "glutes"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 4, "10-12", 90, ["knee_pain"], ["bodyweight_squat", "chair_squat"], "脚掌踩稳，膝盖方向与脚尖一致，不要完全锁死膝盖。"),
  exercise("leg_extension", "坐姿腿屈伸", "lower", ["legs"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-15", 75, ["knee_pain"], ["leg_press", "bodyweight_squat"], "调整器械轴心对齐膝关节，控制伸膝和下放速度。"),
  exercise("seated_leg_curl", "坐姿腿弯举", "lower", ["legs"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-15", 75, [], ["romanian_deadlift", "glute_bridge"], "脚跟向后下方弯曲，感受大腿后侧发力。"),
  exercise("hip_abductor", "髋外展机", "lower", ["glutes"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "12-15", 60, [], ["fire_hydrant", "donkey_kick"], "膝盖向外打开，顶端短暂停顿，避免身体前后晃动。"),
  exercise("smith_squat", "史密斯深蹲", "lower", ["legs", "glutes"], ["gym"], ["machine"], novicePlus, ["shape", "muscle_gain"], 4, "8-12", 90, ["knee_pain"], ["leg_press", "dumbbell_goblet_squat"], "站位稳定，核心收紧，控制下蹲深度。"),

  exercise("wall_push_up", "推墙俯卧撑", "push", ["chest", "triceps", "shoulders"], homeGym, ["none"], ["beginner"], ["fat_loss", "shape", "health"], 3, "12-15", 60, [], ["incline_push_up", "kneeling_push_up"], "双手扶墙，身体成直线，适合低强度入门。"),
  exercise("incline_push_up", "上斜俯卧撑", "push", ["chest", "triceps", "shoulders"], homeGym, ["none"], ["beginner", "novice"], ["fat_loss", "shape", "health"], 3, "10-12", 60, ["shoulder_pain"], ["wall_push_up", "kneeling_push_up"], "双手撑在桌沿或固定高台，控制身体下放。"),
  exercise("kneeling_push_up", "跪姿俯卧撑", "push", ["chest", "triceps", "shoulders"], homeGym, ["none"], ["beginner", "novice"], ["fat_loss", "shape", "health"], 3, "8-10", 75, ["shoulder_pain", "wrist_pain"], ["incline_push_up", "wall_push_up"], "膝盖支撑，核心收紧，动作过程不要塌腰。"),
  exercise("push_up", "俯卧撑", "push", ["chest", "triceps", "shoulders"], homeGym, ["none"], ["novice", "intermediate"], allGoals, 3, "8-12", 75, ["shoulder_pain", "wrist_pain"], ["incline_push_up", "kneeling_push_up"], "身体保持一条直线，下放时肘部自然打开。"),
  exercise("close_grip_push_up", "窄距俯卧撑", "push", ["triceps", "chest"], homeGym, ["none"], ["intermediate", "advanced"], ["shape", "muscle_gain"], 3, "6-10", 90, ["shoulder_pain", "wrist_pain"], ["push_up", "triceps_dip_chair"], "双手距离略窄，肘部贴近身体，控制下放。"),
  exercise("pike_push_up", "折刀俯卧撑", "push", ["shoulders", "triceps"], homeGym, ["none"], ["intermediate", "advanced"], ["shape", "muscle_gain"], 3, "6-10", 90, ["shoulder_pain", "wrist_pain"], ["dumbbell_shoulder_press", "incline_push_up"], "髋部抬高，头部向双手之间下放，强化肩部。"),
  exercise("triceps_dip_chair", "椅上臂屈伸", "push", ["triceps", "chest"], homeGym, ["none"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "8-12", 75, ["shoulder_pain", "wrist_pain"], ["push_up", "kneeling_push_up"], "双手撑椅边，身体靠近椅子下放，肩部不适时停止。"),

  exercise("dumbbell_press", "哑铃卧推", "push", ["chest", "triceps", "shoulders"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain"], 4, "8-12", 90, ["shoulder_pain"], ["push_up", "machine_chest_press"], "肩胛稳定，推起时不要耸肩，控制下放。"),
  exercise("incline_dumbbell_press", "上斜哑铃卧推", "push", ["chest", "shoulders", "triceps"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain"], 3, "8-12", 90, ["shoulder_pain"], ["dumbbell_press", "machine_chest_press"], "凳面上斜，推起时保持手腕稳定，感受上胸发力。"),
  exercise("dumbbell_fly", "哑铃飞鸟", "push", ["chest"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "10-15", 75, ["shoulder_pain"], ["dumbbell_press", "cable_fly"], "手肘微屈，像抱圆桶一样打开和合拢双臂。"),
  exercise("dumbbell_shoulder_press", "哑铃肩推", "push", ["shoulders", "triceps"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain"], 3, "8-12", 90, ["shoulder_pain"], ["lateral_raise", "machine_shoulder_press"], "核心收紧，推起时不要过度后仰。"),
  exercise("lateral_raise", "侧平举", "push", ["shoulders"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 3, "12-15", 60, ["shoulder_pain"], ["dumbbell_shoulder_press"], "手肘微屈，抬到肩高附近即可。"),
  exercise("front_raise", "哑铃前平举", "push", ["shoulders"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-12", 60, ["shoulder_pain"], ["lateral_raise"], "手臂向前抬至肩高，控制下放，不要耸肩。"),
  exercise("overhead_triceps_extension", "哑铃颈后臂屈伸", "push", ["triceps"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "10-12", 75, ["shoulder_pain", "wrist_pain"], ["triceps_dip_chair", "rope_pushdown"], "双手持哑铃置于头后，伸肘上举，保持上臂稳定。"),
  exercise("dumbbell_floor_press", "哑铃地板卧推", "push", ["chest", "triceps", "shoulders"], homeGym, ["dumbbell"], beginnerPlus, allGoals, 3, "8-12", 75, ["shoulder_pain"], ["dumbbell_press", "push_up"], "仰卧地面屈膝，手肘接近地面后推起哑铃，适合没有训练凳时练习胸部。"),
  exercise("dumbbell_squeeze_press", "哑铃对握卧推", "push", ["chest", "triceps"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "10-12", 75, ["shoulder_pain"], ["dumbbell_press", "dumbbell_floor_press"], "两只哑铃靠近并保持内收发力，完成卧推动作，控制下放速度。"),
  exercise("arnold_press", "阿诺德推举", "push", ["shoulders", "triceps"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "8-12", 90, ["shoulder_pain"], ["dumbbell_shoulder_press", "lateral_raise"], "从掌心朝向身体开始，推起时缓慢外旋手臂，动作范围以肩部舒适为准。"),
  exercise("dumbbell_kickback", "哑铃俯身臂屈伸", "push", ["triceps"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 3, "每侧10-15", 60, ["wrist_pain"], ["overhead_triceps_extension", "rope_pushdown"], "髋部折叠，上臂贴近躯干，伸直肘部并控制回收，避免甩动。"),

  exercise("barbell_bench_press", "杠铃卧推", "push", ["chest", "triceps", "shoulders"], ["gym"], ["barbell"], novicePlus, ["shape", "muscle_gain"], 4, "6-10", 120, ["shoulder_pain"], ["dumbbell_press", "machine_chest_press"], "肩胛稳定收紧，杠铃控制下放至胸部附近，再平稳推起。"),
  exercise("barbell_overhead_press", "杠铃推举", "push", ["shoulders", "triceps"], ["gym"], ["barbell"], ["novice", "intermediate", "advanced"], ["shape", "muscle_gain"], 4, "6-10", 120, ["shoulder_pain"], ["dumbbell_shoulder_press", "machine_shoulder_press"], "核心收紧，杠铃从肩部上方推起，避免腰部过度后仰。"),
  exercise("machine_chest_press", "器械推胸", "push", ["chest", "triceps"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 4, "8-12", 90, ["shoulder_pain"], ["dumbbell_press", "push_up"], "调整座椅高度，让把手大致与胸中部齐平。"),
  exercise("pec_deck", "蝴蝶机夹胸", "push", ["chest"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-15", 75, ["shoulder_pain"], ["dumbbell_fly", "cable_fly"], "肩胛稳定，双臂向中间合拢，控制回放。"),
  exercise("cable_fly", "绳索夹胸", "push", ["chest"], ["gym"], ["machine"], ["novice", "intermediate", "advanced"], ["shape", "muscle_gain"], 3, "12-15", 75, ["shoulder_pain"], ["pec_deck", "dumbbell_fly"], "身体略前倾，双手向胸前合拢，保持胸部发力。"),
  exercise("machine_shoulder_press", "器械肩推", "push", ["shoulders", "triceps"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "8-12", 90, ["shoulder_pain"], ["dumbbell_shoulder_press", "lateral_raise"], "调整座椅，推起时不要锁死肘关节。"),
  exercise("rope_pushdown", "绳索下压", "push", ["triceps"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-15", 60, ["wrist_pain"], ["overhead_triceps_extension", "triceps_dip_chair"], "肘部固定在身体两侧，向下伸肘并分开绳索。"),

  exercise("prone_y_raise", "俯卧 Y 字上举", "pull", ["back", "shoulders"], homeGym, ["none"], ["beginner", "novice"], ["fat_loss", "shape", "health"], 3, "10-12", 60, ["shoulder_pain"], ["band_row", "dumbbell_row"], "俯卧收紧背部，双臂呈 Y 字缓慢上举，感受上背发力。"),
  exercise("superman", "超人式", "pull", ["back", "glutes"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 3, "12-15", 45, [], ["bird_dog", "prone_y_raise"], "俯卧同时抬起手臂和腿部，避免过度抬头。"),
  exercise("band_row", "弹力带划船", "pull", ["back", "biceps"], homeGym, ["band"], beginnerPlus, allGoals, 3, "12-15", 60, [], ["dumbbell_row", "lat_pulldown"], "肩胛骨向后收，肘部贴近身体向后拉。"),
  exercise("band_lat_pulldown", "弹力带下拉", "pull", ["back", "biceps"], homeGym, ["band"], beginnerPlus, ["shape", "muscle_gain", "health"], 3, "12-15", 60, [], ["band_row", "lat_pulldown"], "弹力带固定在高处，肘部向身体两侧下拉。"),
  exercise("band_face_pull", "弹力带面拉", "pull", ["back", "shoulders"], homeGym, ["band"], beginnerPlus, ["shape", "health"], 3, "12-15", 60, ["shoulder_pain"], ["prone_y_raise", "cable_face_pull"], "弹力带拉向面部，肘部打开，感受上背和后三角。"),
  exercise("dumbbell_supported_row", "支撑式单臂哑铃划船", "pull", ["back", "biceps"], homeGym, ["dumbbell"], beginnerPlus, allGoals, 3, "每侧10-12", 75, [], ["dumbbell_row", "band_row"], "一手扶住稳固支撑，另一手将哑铃拉向髋部，保持背部平直并减少身体旋转。"),
  exercise("dumbbell_row", "哑铃划船", "pull", ["back", "biceps"], homeGym, ["dumbbell"], novicePlus, ["shape", "muscle_gain", "health", "fat_loss"], 3, "10-12", 75, [], ["dumbbell_supported_row", "band_row", "lat_pulldown"], "保持背部平直，向髋部方向拉起哑铃。"),
  exercise("dumbbell_reverse_fly", "哑铃反向飞鸟", "pull", ["back", "shoulders"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain", "health"], 3, "12-15", 60, ["shoulder_pain"], ["band_face_pull", "cable_face_pull"], "髋部折叠，双臂向两侧打开，感受后肩和上背。"),
  exercise("dumbbell_curl", "哑铃弯举", "pull", ["biceps"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-12", 60, ["wrist_pain"], ["hammer_curl", "band_row"], "上臂保持稳定，控制哑铃上举和下放，不要借力甩动。"),
  exercise("hammer_curl", "锤式弯举", "pull", ["biceps"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-12", 60, ["wrist_pain"], ["dumbbell_curl"], "掌心相对握哑铃弯举，保持手腕中立。"),
  exercise("dumbbell_pullover", "哑铃仰卧上拉", "pull", ["back", "chest", "core"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "10-12", 75, ["shoulder_pain"], ["dumbbell_row", "band_lat_pulldown"], "仰卧后双手托住哑铃，缓慢向头后下放并拉回胸部上方，避免腰部过度拱起。"),
  exercise("dumbbell_shrug", "哑铃耸肩", "pull", ["back", "shoulders"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "muscle_gain"], 3, "12-15", 60, [], ["dumbbell_reverse_fly", "cable_face_pull"], "双手自然持哑铃，肩膀垂直向上抬起并缓慢下放，不要向前后绕肩。"),
  exercise("dumbbell_concentration_curl", "哑铃集中弯举", "pull", ["biceps"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "每侧10-12", 60, ["wrist_pain"], ["dumbbell_curl", "hammer_curl"], "坐姿将上臂靠近大腿内侧，控制哑铃弯举，避免身体借力。"),
  exercise("renegade_row", "哑铃俯撑划船", "pull", ["back", "core", "biceps"], homeGym, ["dumbbell"], ["intermediate", "advanced"], ["shape", "muscle_gain", "fat_loss"], 3, "每侧6-10", 90, ["shoulder_pain", "wrist_pain"], ["dumbbell_row", "plank"], "双手支撑哑铃保持俯撑姿势，交替划船，减少身体左右旋转。"),

  exercise("barbell_row", "杠铃俯身划船", "pull", ["back", "biceps"], ["gym"], ["barbell"], ["novice", "intermediate", "advanced"], ["shape", "muscle_gain"], 4, "6-10", 120, [], ["dumbbell_row", "seated_row"], "髋部后移保持背部平直，将杠铃拉向腹部并控制下放。"),
  exercise("lat_pulldown", "高位下拉", "pull", ["back", "biceps"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 4, "8-12", 90, [], ["band_row", "dumbbell_row"], "挺胸下拉至上胸附近，避免身体大幅后仰。"),
  exercise("seated_row", "坐姿划船", "pull", ["back", "biceps"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 4, "8-12", 90, [], ["dumbbell_row", "band_row"], "挺胸收肩胛，手柄拉向腹部，控制回放。"),
  exercise("cable_face_pull", "绳索面拉", "pull", ["back", "shoulders"], ["gym"], ["machine"], beginnerPlus, ["shape", "health"], 3, "12-15", 60, ["shoulder_pain"], ["band_face_pull", "dumbbell_reverse_fly"], "绳索拉向眉眼高度，肘部打开，保持肩胛稳定。"),
  exercise("assisted_pull_up", "辅助引体向上", "pull", ["back", "biceps"], ["gym"], ["machine"], ["novice", "intermediate"], ["shape", "muscle_gain"], 3, "6-10", 90, ["shoulder_pain"], ["lat_pulldown", "seated_row"], "使用辅助重量，向上拉至下巴接近横杆，控制下放。"),
  exercise("machine_row", "器械划船", "pull", ["back", "biceps"], ["gym"], ["machine"], beginnerPlus, ["shape", "muscle_gain"], 3, "10-12", 90, [], ["seated_row", "dumbbell_row"], "胸部贴垫，肩胛向后收，肘部向后拉。"),

  exercise("dead_bug", "死虫", "core", ["core"], homeGym, ["none"], ["beginner", "novice"], ["fat_loss", "shape", "health"], 3, "每侧10次", 45, [], ["bird_dog", "plank"], "腰背贴近地面，缓慢伸展对侧手脚。"),
  exercise("bird_dog", "鸟狗", "core", ["core", "back"], homeGym, ["none"], ["beginner", "novice"], ["fat_loss", "shape", "health"], 3, "每侧10次", 45, [], ["dead_bug", "plank"], "四点支撑，对侧手脚伸直，保持骨盆稳定。"),
  exercise("plank", "平板支撑", "core", ["core"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape", "health"], 3, "20-40秒", 45, ["shoulder_pain"], ["dead_bug", "bird_dog"], "肘部在肩下方，收紧腹部和臀部，不要塌腰。"),
  exercise("side_plank", "侧平板支撑", "core", ["core"], homeGym, ["none"], ["novice", "intermediate"], ["fat_loss", "shape", "health"], 2, "每侧20-30秒", 45, ["shoulder_pain"], ["plank", "dead_bug"], "侧向支撑，保持头、躯干和腿成一条直线。"),
  exercise("crunch", "卷腹", "core", ["core"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape"], 3, "12-15", 45, [], ["dead_bug", "reverse_crunch"], "上背部离地即可，避免用手拉脖子。"),
  exercise("reverse_crunch", "反向卷腹", "core", ["core"], homeGym, ["none"], beginnerPlus, ["fat_loss", "shape"], 3, "10-12", 45, [], ["dead_bug", "crunch"], "骨盆向上卷起，控制下放，不要借助惯性。"),
  exercise("mountain_climber", "登山跑", "core", ["core", "cardio"], homeGym, ["none"], ["novice", "intermediate"], ["fat_loss", "health"], 3, "30秒", 45, ["shoulder_pain", "wrist_pain"], ["brisk_walk", "dead_bug"], "俯撑姿势交替提膝，核心收紧，速度按能力控制。"),
  exercise("russian_twist", "俄罗斯转体", "core", ["core"], homeGym, ["none"], ["novice", "intermediate"], ["fat_loss", "shape"], 3, "每侧12次", 45, [], ["crunch", "side_plank"], "坐姿身体后倾，躯干左右旋转，保持腹部发力。"),
  exercise("hollow_hold", "空心支撑", "core", ["core"], homeGym, ["none"], ["intermediate", "advanced"], ["shape", "health"], 3, "20-30秒", 60, [], ["dead_bug", "plank"], "腰背贴地，手脚离地保持张力。"),
  exercise("dumbbell_russian_twist", "哑铃俄罗斯转体", "core", ["core"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "fat_loss"], 3, "每侧10-12", 60, [], ["russian_twist", "side_plank"], "坐姿略微后倾，双手托住轻重量哑铃左右转动躯干，保持腹部持续发力。"),
  exercise("dumbbell_side_bend", "哑铃侧屈", "core", ["core"], homeGym, ["dumbbell"], beginnerPlus, ["shape", "health"], 3, "每侧10-15", 60, [], ["side_plank", "dumbbell_russian_twist"], "单手持哑铃沿身体侧面缓慢下放并回正，避免身体前后晃动。"),
  exercise("dumbbell_dead_bug", "哑铃死虫", "core", ["core"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["shape", "health", "muscle_gain"], 3, "每侧8-10", 60, [], ["dead_bug", "plank"], "仰卧双手稳定托住轻重量哑铃，交替伸展单腿，保持腰背贴近地面。"),

  exercise("brisk_walk", "快走", "cardio", ["cardio"], allLocations, ["none"], beginnerPlus, ["fat_loss", "health"], 1, "15-30分钟", 0, [], ["cycling", "elliptical"], "保持能说短句但略喘的强度，注意补水。"),
  exercise("jogging", "慢跑", "cardio", ["cardio"], ["outdoor", "gym"], ["none"], ["novice", "intermediate"], ["fat_loss", "health"], 1, "15-30分钟", 0, ["knee_pain"], ["brisk_walk", "elliptical"], "以可持续完成的配速慢跑，避免一开始冲太快。"),
  exercise("jump_rope", "跳绳", "cardio", ["cardio", "legs"], ["home", "outdoor"], ["none"], ["novice", "intermediate"], ["fat_loss", "health"], 1, "5-15分钟", 0, ["knee_pain"], ["brisk_walk", "cycling"], "保持轻盈落地，分组完成，膝盖不适时停止。"),
  exercise("cycling", "骑车", "cardio", ["cardio"], ["gym", "outdoor"], ["machine"], beginnerPlus, ["fat_loss", "health"], 1, "20-30分钟", 0, [], ["brisk_walk", "elliptical"], "保持稳定踏频，强度以可持续完成为准。"),
  exercise("elliptical", "椭圆机", "cardio", ["cardio"], ["gym"], ["machine"], beginnerPlus, ["fat_loss", "health"], 1, "20-30分钟", 0, [], ["brisk_walk", "cycling"], "保持上身稳定，低冲击完成有氧训练。"),
  exercise("stair_climber", "爬楼机", "cardio", ["cardio", "legs", "glutes"], ["gym"], ["machine"], ["novice", "intermediate"], ["fat_loss", "health"], 1, "10-20分钟", 0, ["knee_pain"], ["elliptical", "brisk_walk"], "保持身体直立，避免用手臂支撑过多体重。"),
  exercise("rowing_machine", "划船机", "cardio", ["cardio", "back", "legs"], ["gym"], ["machine"], ["novice", "intermediate"], ["fat_loss", "health"], 1, "10-20分钟", 0, [], ["cycling", "elliptical"], "先蹬腿再拉手柄，回程时控制节奏。"),
  exercise("dance_cardio", "燃脂操", "cardio", ["cardio"], ["home"], ["none"], beginnerPlus, ["fat_loss", "health"], 1, "15-25分钟", 0, ["knee_pain"], ["brisk_walk", "mountain_climber"], "选择低冲击动作版本，保持稳定呼吸。"),
  exercise("dumbbell_farmer_walk", "哑铃农夫走", "cardio", ["core", "shoulders", "cardio"], homeGym, ["dumbbell"], beginnerPlus, allGoals, 3, "每组30-60秒", 45, [], ["brisk_walk", "dumbbell_shrug"], "双手持哑铃自然行走，保持身体直立和核心稳定，避免耸肩或身体左右摆动。"),
  exercise("dumbbell_thruster", "哑铃深蹲推举", "cardio", ["legs", "glutes", "shoulders", "cardio"], homeGym, ["dumbbell"], ["novice", "intermediate"], ["fat_loss", "shape"], 3, "8-12", 75, ["knee_pain", "shoulder_pain"], ["dumbbell_goblet_squat", "dumbbell_farmer_walk"], "双手持哑铃完成深蹲，起身时顺势推举，使用可控重量并保持动作连贯。")
];

module.exports = {
  exercises
};
