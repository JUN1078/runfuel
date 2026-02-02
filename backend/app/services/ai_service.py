import base64
import json

from openai import AsyncOpenAI

from app.config import get_settings

settings = get_settings()

_client = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


SYSTEM_PROMPTS = {
    "deficit": (
        "You are a nutrition analyst for a runner on a calorie deficit. "
        "Identify food items, estimate portions and calories accurately. "
        "Flag calorie-dense foods and suggest lighter alternatives when appropriate."
    ),
    "performance": (
        "You are a nutrition analyst for a runner focused on performance. "
        "Identify food items, estimate portions and calories accurately. "
        "Pay special attention to carbohydrate content for optimal fueling."
    ),
    "bulking": (
        "You are a nutrition analyst for a runner focused on building mass. "
        "Identify food items, estimate portions and calories accurately. "
        "Note if portions seem too small for bulking goals."
    ),
}

ANALYSIS_PROMPT_BASE = (
    "Return a JSON object with:\n"
    '{"items": [{"name": "food name", "portion": "estimated portion size", '
    '"calories": number, "protein_g": number, "carbs_g": number, '
    '"fat_g": number, "fiber_g": number, "confidence": 0.0-1.0, '
    '"health_rating": "healthy" or "average" or "unhealthy"}], '
    '"total_calories": number, "meal_notes": "brief note about the meal", '
    '"health_evaluation": "healthy" or "average" or "unhealthy", '
    '"health_tip": "one sentence tip about this meal for a runner"}\n\n'
    "Health rating rules:\n"
    '- "healthy": whole foods, lean protein, vegetables, fruits, whole grains, good balance\n'
    '- "average": mixed quality, some processed foods, acceptable but could be better\n'
    '- "unhealthy": highly processed, excessive sugar/fat, fried foods, poor nutritional value'
)

PHOTO_ANALYSIS_PROMPT = "Analyze this food photo. " + ANALYSIS_PROMPT_BASE

PHOTO_TEXT_ANALYSIS_PROMPT = (
    "Analyze this food photo. The user also described the food as: \"{description}\"\n"
    "Use the photo as the primary source and the text description to improve accuracy of "
    "portion sizes, ingredients, and calorie estimates. " + ANALYSIS_PROMPT_BASE
)

TEXT_ANALYSIS_PROMPT = (
    "Analyze the following food description and estimate calories and macros as accurately as possible. "
    + ANALYSIS_PROMPT_BASE
    + "\n\nFood description: {description}"
)


async def analyze_food_photo(image_bytes: bytes, user_goal: str) -> dict:
    """Send food photo to OpenAI Vision, return structured analysis."""
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    system_prompt = SYSTEM_PROMPTS.get(user_goal, SYSTEM_PROMPTS["performance"])

    response = await _get_client().chat.completions.create(
        model=settings.OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PHOTO_ANALYSIS_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        },
                    },
                ],
            },
        ],
        max_tokens=1000,
    )

    return json.loads(response.choices[0].message.content)


async def analyze_food_photo_with_text(
    image_bytes: bytes, description: str, user_goal: str
) -> dict:
    """Send food photo + text description to OpenAI Vision for stronger analysis."""
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    system_prompt = SYSTEM_PROMPTS.get(user_goal, SYSTEM_PROMPTS["performance"])
    prompt = PHOTO_TEXT_ANALYSIS_PROMPT.format(description=description)

    response = await _get_client().chat.completions.create(
        model=settings.OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        },
                    },
                ],
            },
        ],
        max_tokens=1000,
    )

    return json.loads(response.choices[0].message.content)


async def analyze_food_text(description: str, user_goal: str) -> dict:
    """Analyze food from a text description, return structured analysis."""
    system_prompt = SYSTEM_PROMPTS.get(user_goal, SYSTEM_PROMPTS["performance"])
    prompt = TEXT_ANALYSIS_PROMPT.format(description=description)

    response = await _get_client().chat.completions.create(
        model=settings.OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
        max_tokens=1000,
    )

    return json.loads(response.choices[0].message.content)
