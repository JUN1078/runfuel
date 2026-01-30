import base64
import json

from openai import AsyncOpenAI

from app.config import get_settings

settings = get_settings()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

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

ANALYSIS_PROMPT = (
    "Analyze this food photo. Return a JSON object with:\n"
    '{"items": [{"name": "food name", "portion": "estimated portion size", '
    '"calories": number, "protein_g": number, "carbs_g": number, '
    '"fat_g": number, "fiber_g": number, "confidence": 0.0-1.0}], '
    '"total_calories": number, "meal_notes": "brief note about the meal"}'
)


async def analyze_food_photo(image_bytes: bytes, user_goal: str) -> dict:
    """Send food photo to OpenAI Vision, return structured analysis."""
    base64_image = base64.b64encode(image_bytes).decode("utf-8")

    system_prompt = SYSTEM_PROMPTS.get(user_goal, SYSTEM_PROMPTS["performance"])

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": ANALYSIS_PROMPT},
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
