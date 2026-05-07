// This is your RULE-BASED personalization system.
// No AI cost. Instant. Based on proven fitness science.

type ProfileInput = {
  weight_kg: number
  height_cm: number
  age: number
  gender: 'male' | 'female' | 'other'
  lifestyle: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active'
  fitness_goal: 'build_muscle' | 'lose_fat' | 'lean_bulk' | 'athletic_body' | 'maintain_fitness'
  body_type: 'ectomorph' | 'mesomorph' | 'endomorph'
}

type Goals = {
  daily_calorie_goal: number
  daily_protein_goal_g: number
  daily_carb_goal_g: number
  daily_fat_goal_g: number
}

// Activity multipliers (Harris-Benedict equation)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

// Calorie adjustments by goal
const GOAL_CALORIE_ADJUSTMENT = {
  build_muscle:    +300,   // Slight surplus
  lose_fat:        -500,   // Deficit
  lean_bulk:       +200,   // Small surplus
  athletic_body:   +100,   // Maintenance+
  maintain_fitness: 0,     // Exact maintenance
}

export function calculateGoals(profile: ProfileInput): Goals {
  // Step 1: Calculate BMR (Basal Metabolic Rate)
  // Mifflin-St Jeor Equation — most accurate for general population
  let bmr: number
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5
  } else {
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161
  }

  // Step 2: Apply activity multiplier
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.lifestyle]

  // Step 3: Apply goal adjustment
  const calories = Math.round(tdee + GOAL_CALORIE_ADJUSTMENT[profile.fitness_goal])

  // Step 4: Calculate macros
  // Protein: 2g per kg body weight for muscle goals, 1.6g for others
  const proteinMultiplier = ['build_muscle', 'lean_bulk', 'athletic_body'].includes(profile.fitness_goal) ? 2.0 : 1.6
  const protein = Math.round(profile.weight_kg * proteinMultiplier)

  // Fat: 25% of calories
  const fat = Math.round((calories * 0.25) / 9)

  // Carbs: remaining calories
  const proteinCalories = protein * 4
  const fatCalories = fat * 9
  const carbs = Math.round((calories - proteinCalories - fatCalories) / 4)

  return {
    daily_calorie_goal:   calories,
    daily_protein_goal_g: protein,
    daily_carb_goal_g:    carbs,
    daily_fat_goal_g:     fat,
  }
}