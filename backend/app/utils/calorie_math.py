from decimal import Decimal


def calculate_bmr(gender: str, weight_kg: float, height_cm: float, age: int) -> Decimal:
    """Mifflin-St Jeor equation."""
    if gender == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
    return Decimal(str(round(bmr, 2)))


ACTIVITY_MULTIPLIERS = {
    ("1-2", "easy"): Decimal("1.375"),
    ("1-2", "moderate"): Decimal("1.40"),
    ("1-2", "hard"): Decimal("1.45"),
    ("1-2", "very_hard"): Decimal("1.50"),
    ("3-4", "easy"): Decimal("1.55"),
    ("3-4", "moderate"): Decimal("1.60"),
    ("3-4", "hard"): Decimal("1.65"),
    ("3-4", "very_hard"): Decimal("1.725"),
    ("5-6", "easy"): Decimal("1.65"),
    ("5-6", "moderate"): Decimal("1.725"),
    ("5-6", "hard"): Decimal("1.80"),
    ("5-6", "very_hard"): Decimal("1.90"),
    ("7+", "easy"): Decimal("1.725"),
    ("7+", "moderate"): Decimal("1.80"),
    ("7+", "hard"): Decimal("1.90"),
    ("7+", "very_hard"): Decimal("1.95"),
}


def calculate_tdee(bmr: Decimal, frequency: str, intensity: str) -> Decimal:
    multiplier = ACTIVITY_MULTIPLIERS.get((frequency, intensity), Decimal("1.55"))
    return (bmr * multiplier).quantize(Decimal("0.01"))


GOAL_MODIFIERS = {
    "deficit": Decimal("-400"),
    "performance": Decimal("0"),
    "bulking": Decimal("+400"),
}

INTAKE_FLOOR = {
    "male": Decimal("1500"),
    "female": Decimal("1200"),
}


def calculate_daily_target(
    tdee: Decimal,
    goal: str,
    gender: str,
    is_long_run_day: bool = False,
    weekly_mileage_km: float = 0,
) -> Decimal:
    """
    Apply goal modifier with safety rules:
    1. No aggressive deficit on long-run days (cap at -200)
    2. Auto-adjust on high mileage weeks (>60km: reduce deficit by half)
    3. Never go below intake floor
    """
    modifier = GOAL_MODIFIERS.get(goal, Decimal("0"))

    if is_long_run_day and goal == "deficit":
        modifier = max(modifier, Decimal("-200"))

    if weekly_mileage_km > 60 and goal == "deficit":
        modifier = modifier / 2

    target = tdee + modifier
    floor = INTAKE_FLOOR.get(gender, Decimal("1200"))
    return max(target, floor).quantize(Decimal("0.01"))
