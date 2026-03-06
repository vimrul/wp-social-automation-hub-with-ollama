import json

from sqlalchemy.orm import Session

from app.models.ai_generation import AIGeneration
from app.models.ollama_profile import OllamaProfile
from app.models.post import Post
from app.models.prompt_template import PromptTemplate
from app.services.ollama.client import call_ollama
from app.services.ollama.output_cleaner import clean_ai_output


def build_prompt(template: PromptTemplate, post: Post):
    system_prompt = template.system_prompt or ""

    user_prompt = template.user_prompt_template.format(
        title=post.title or "",
        excerpt=post.excerpt or "",
        content=post.clean_content or "",
        url=post.external_post_url or "",
    )

    return system_prompt, user_prompt


async def generate_content_for_post(
    db: Session,
    *,
    post_id: int,
    ollama_profile_id: int,
    prompt_template_id: int,
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise ValueError("Post not found")

    profile = db.query(OllamaProfile).filter(OllamaProfile.id == ollama_profile_id).first()
    if not profile:
        raise ValueError("Ollama profile not found")

    template = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_template_id).first()
    if not template:
        raise ValueError("Prompt template not found")

    system_prompt, user_prompt = build_prompt(template, post)

    result = await call_ollama(profile, prompt=user_prompt, system_prompt=system_prompt)
    cleaned_output = clean_ai_output(result["output_text"], template.template_type)

    generation = AIGeneration(
        post_id=post.id,
        ollama_profile_id=profile.id,
        prompt_template_id=template.id,
        generation_type=template.template_type,
        request_payload_json=json.dumps(result["request_payload"]),
        response_payload_json=json.dumps(result["response_payload"]),
        output_text=cleaned_output,
        duration_ms=result["duration_ms"],
        status="success",
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)

    return generation