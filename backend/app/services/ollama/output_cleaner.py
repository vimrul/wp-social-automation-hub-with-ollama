import re


def clean_ai_output(text: str, generation_type: str) -> str:
    if not text:
        return text

    cleaned = text.strip()

    # Remove wrapping quotes for full-text outputs
    if generation_type in {"twitter_summary", "facebook_summary"}:
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1].strip()

        if cleaned.startswith("“") and cleaned.endswith("”"):
            cleaned = cleaned[1:-1].strip()

    # Remove common assistant fluff if it appears
    fluff_patterns = [
        r"^here'?s (a )?(possible )?(twitter/x|twitter|facebook) post:\s*",
        r"^here'?s a caption:\s*",
        r"^feel free to adjust.*$",
    ]

    for pattern in fluff_patterns:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE | re.MULTILINE).strip()

    # Normalize extra blank lines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()

    # Hashtag normalization
    if generation_type == "hashtags":
        lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
        hashtag_lines = [line for line in lines if line.startswith("#")]
        if hashtag_lines:
            cleaned = "\n".join(hashtag_lines[:5])

    return cleaned
