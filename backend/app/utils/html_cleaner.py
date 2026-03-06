import re
from html import unescape
from typing import Optional


def strip_html(html_text: Optional[str]) -> Optional[str]:
    if not html_text:
        return html_text

    text = re.sub(r"<script.*?>.*?</script>", "", html_text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<style.*?>.*?</style>", "", text, flags=re.IGNORECASE | re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text