import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

// Layout / shared UI
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import CollapsibleSection from "../components/common/CollapsibleSection";

// API calls
import {
  getPostAIGenerations,
  getPostDetail,
  getPostLatestAI,
} from "../api/posts";
import { getSourceSites } from "../api/sourceSites";
import { getOllamaProfiles } from "../api/ollamaProfiles";
import { getPromptTemplates } from "../api/promptTemplates";
import { generateAIContent } from "../api/aiGenerations";

// Types
import type { AIGenerationItem, PostDetail } from "../types/post";
import type { SourceSite } from "../types/sourceSite";
import type { OllamaProfile } from "../types/ollamaProfile";
import type { PromptTemplate } from "../types/promptTemplate";

/**
 * Latest AI values can come in different shapes from the API.
 * Sometimes it is plain text, sometimes an object with metadata,
 * sometimes null/undefined.
 */
type LatestAIValue =
  | string
  | {
      generation_id?: number;
      output_text?: string;
      generated_at?: string;
      prompt_template_id?: number;
      ollama_profile_id?: number;
      hashtags?: string;
    }
  | null
  | undefined;

/**
 * Simplified structure for the "latest AI" response used in this page.
 */
type LatestAISimple = {
  twitter_summary?: LatestAIValue;
  facebook_summary?: LatestAIValue;
  hashtags?: LatestAIValue;
};

/**
 * Format a date safely for display.
 * Falls back to the raw value if parsing fails.
 */
function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

/**
 * Extract user-visible text from a "latest AI" field.
 * Supports plain string values and object-based values.
 */
function extractLatestText(value: LatestAIValue): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return value.output_text || value.hashtags || JSON.stringify(value, null, 2);
  }

  return "";
}

/**
 * Build a compact metadata line for a latest AI item.
 * Example:
 * Generation #12 • Template 4 • Profile 2 • 3/12/2026, 2:20 PM
 */
function extractLatestMeta(value: LatestAIValue): string {
  if (!value || typeof value !== "object") return "";

  const parts: string[] = [];

  if (value.generation_id) parts.push(`Generation #${value.generation_id}`);
  if (value.prompt_template_id) parts.push(`Template ${value.prompt_template_id}`);
  if (value.ollama_profile_id) parts.push(`Profile ${value.ollama_profile_id}`);
  if (value.generated_at) parts.push(formatDate(value.generated_at));

  return parts.join(" • ");
}

export default function PostDetailPage() {
  /**
   * Read postId from the route.
   * Example route: /posts/:postId
   */
  const { postId } = useParams();
  const numericPostId = Number(postId);

  // -----------------------------
  // Page loading / error state
  // -----------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -----------------------------
  // Main data state
  // -----------------------------
  const [post, setPost] = useState<PostDetail | null>(null);
  const [generations, setGenerations] = useState<AIGenerationItem[]>([]);
  const [latestAI, setLatestAI] = useState<LatestAISimple | null>(null);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [profiles, setProfiles] = useState<OllamaProfile[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  // -----------------------------
  // Form selections for AI actions
  // -----------------------------
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [twitterTemplateId, setTwitterTemplateId] = useState("");
  const [facebookTemplateId, setFacebookTemplateId] = useState("");
  const [hashtagTemplateId, setHashtagTemplateId] = useState("");

  // -----------------------------
  // AI generation feedback state
  // -----------------------------
  const [generationLoading, setGenerationLoading] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const [generationError, setGenerationError] = useState("");

  /**
   * Load everything required for this page in parallel:
   * - Post detail
   * - AI generation history
   * - Latest AI outputs
   * - Source sites
   * - Ollama profiles
   * - Prompt templates
   */
  const loadPageData = async () => {
    if (!numericPostId || Number.isNaN(numericPostId)) {
      throw new Error("Invalid post id.");
    }

    const [
      detailData,
      generationsData,
      latestAIData,
      sitesData,
      profilesData,
      templatesData,
    ] = await Promise.all([
      getPostDetail(numericPostId),
      getPostAIGenerations(numericPostId),
      getPostLatestAI(numericPostId),
      getSourceSites(),
      getOllamaProfiles(),
      getPromptTemplates(),
    ]);

    // Set base data into state
    setPost(detailData.post);
    setGenerations(generationsData);
    setLatestAI((latestAIData.latest || detailData.latest_ai || null) as LatestAISimple);
    setSites(sitesData);
    setProfiles(profilesData);
    setTemplates(templatesData);

    /**
     * Auto-select a default active Ollama profile if none is selected.
     * Priority:
     * 1. default + active
     * 2. first active
     * 3. first profile in the list
     */
    if (!selectedProfileId) {
      const defaultProfile =
        profilesData.find((profile) => profile.is_default && profile.is_active) ||
        profilesData.find((profile) => profile.is_active) ||
        profilesData[0];

      if (defaultProfile) {
        setSelectedProfileId(String(defaultProfile.id));
      }
    }

    /**
     * Auto-select a Twitter template if not selected.
     * Priority:
     * 1. active twitter summary template
     * 2. any active twitter template
     */
    if (!twitterTemplateId) {
      const twitterTemplate =
        templatesData.find(
          (template) =>
            template.is_active &&
            template.platform === "twitter" &&
            (template.template_type === "twitter_summary" ||
              template.template_type === "summary")
        ) || templatesData.find((template) => template.is_active && template.platform === "twitter");

      if (twitterTemplate) {
        setTwitterTemplateId(String(twitterTemplate.id));
      }
    }

    /**
     * Auto-select a Facebook template if not selected.
     * Priority:
     * 1. active facebook summary template
     * 2. any active facebook template
     */
    if (!facebookTemplateId) {
      const facebookTemplate =
        templatesData.find(
          (template) =>
            template.is_active &&
            template.platform === "facebook" &&
            (template.template_type === "facebook_summary" ||
              template.template_type === "summary")
        ) || templatesData.find((template) => template.is_active && template.platform === "facebook");

      if (facebookTemplate) {
        setFacebookTemplateId(String(facebookTemplate.id));
      }
    }

    /**
     * Auto-select a hashtag template if not selected.
     * Priority:
     * 1. active hashtag template
     * 2. any active template
     */
    if (!hashtagTemplateId) {
      const hashtagTemplate =
        templatesData.find(
          (template) => template.is_active && template.template_type === "hashtags"
        ) || templatesData.find((template) => template.is_active);

      if (hashtagTemplate) {
        setHashtagTemplateId(String(hashtagTemplate.id));
      }
    }
  };

  /**
   * Load page data on first render and whenever the post ID changes.
   */
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        await loadPageData();
      } catch (err) {
        console.error(err);
        setError("Failed to load post detail.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [numericPostId]);

  /**
   * Resolve source site name from source_site_id.
   */
  const siteName = useMemo(() => {
    if (!post) return "-";

    return (
      sites.find((site) => site.id === post.source_site_id)?.name ||
      String(post.source_site_id)
    );
  }, [post, sites]);

  /**
   * Choose the best available content field for preview.
   */
  const contentHtml = post?.cleaned_content || post?.content || post?.raw_content || "";

  /**
   * Prepare tags for display in the UI.
   */
  const tagsText = useMemo(() => {
    if (!post) return "-";

    if (Array.isArray(post.tag_names) && post.tag_names.length > 0) {
      return post.tag_names.join(", ");
    }

    if ((post as any).tags_json) {
      return String((post as any).tags_json);
    }

    if (Array.isArray(post.tags)) {
      return JSON.stringify(post.tags, null, 2);
    }

    return "-";
  }, [post]);

  /**
   * Prepare categories for display in the UI.
   */
  const categoriesText = useMemo(() => {
    if (!post) return "-";

    if (Array.isArray(post.category_names) && post.category_names.length > 0) {
      return post.category_names.join(", ");
    }

    if ((post as any).categories_json) {
      return String((post as any).categories_json);
    }

    if (Array.isArray(post.categories)) {
      return JSON.stringify(post.categories, null, 2);
    }

    return "-";
  }, [post]);

  /**
   * Filter active templates usable for Twitter content generation.
   */
  const twitterTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.is_active &&
        (template.platform === "twitter" ||
          template.platform === "generic" ||
          template.platform === null)
    );
  }, [templates]);

  /**
   * Filter active templates usable for Facebook content generation.
   */
  const facebookTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.is_active &&
        (template.platform === "facebook" ||
          template.platform === "generic" ||
          template.platform === null)
    );
  }, [templates]);

  /**
   * Filter active templates usable for hashtag generation.
   */
  const hashtagTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.is_active &&
        (template.template_type === "hashtags" ||
          template.platform === "generic" ||
          template.platform === null)
    );
  }, [templates]);

  /**
   * Only show active Ollama profiles in the dropdown.
   */
  const activeProfiles = useMemo(() => {
    return profiles.filter((profile) => profile.is_active);
  }, [profiles]);

  /**
   * Trigger AI generation for the selected prompt template and profile.
   * Re-loads page data after success so latest outputs/history refresh immediately.
   */
  const handleGenerate = async (
    promptTemplateIdValue: string,
    label: string
  ) => {
    try {
      setGenerationLoading(true);
      setGenerationError("");
      setGenerationMessage("");

      if (!numericPostId || Number.isNaN(numericPostId)) {
        throw new Error("Invalid post id.");
      }

      if (!selectedProfileId) {
        throw new Error("Please select an Ollama profile.");
      }

      if (!promptTemplateIdValue) {
        throw new Error(`Please select a ${label} prompt template.`);
      }

      const result = await generateAIContent({
        post_id: numericPostId,
        ollama_profile_id: Number(selectedProfileId),
        prompt_template_id: Number(promptTemplateIdValue),
      });

      setGenerationMessage(result.message || `${label} generated successfully.`);
      await loadPageData();
    } catch (err) {
      console.error(err);
      setGenerationError(
        err instanceof Error ? err.message : `Failed to generate ${label}.`
      );
    } finally {
      setGenerationLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Post Detail #${postId ?? ""}`}
        description="Detailed view of a single post."
      />

      {/* Loading state */}
      {loading ? <Loader /> : null}

      {/* Error state */}
      {!loading && error ? (
        <EmptyState title="Unable to load post detail" description={error} />
      ) : null}

      {/* Main page content */}
      {!loading && !error && post ? (
        <div className="detail-stack">
          {/* -------------------------
              Main Post Information
             ------------------------- */}
          <div className="card">
            <div className="detail-top">
              <div>
                <h2 className="detail-title">{post.title}</h2>
                <p className="muted detail-subtitle">{post.slug}</p>
              </div>
              <StatusBadge label={post.status || "unknown"} tone="default" />
            </div>

            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <span className="detail-meta-label">Source Site</span>
                <span>{siteName}</span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Published At</span>
                <span>
                  {formatDate((post as any).original_published_at || post.published_at)}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Fetched At</span>
                <span>
                  {formatDate(
                    (post as any).last_fetched_at || post.fetched_at || post.created_at
                  )}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Author</span>
                <span>{post.author_name || "-"}</span>
              </div>
            </div>

            {/* -------------------------
                AI Actions Panel
               ------------------------- */}
            <div className="detail-section">
              <h3>AI Actions</h3>

              <div className="ai-panel">
                <div className="form-field">
                  <label>Ollama Profile</label>
                  <select
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                  >
                    <option value="">Select profile</option>
                    {activeProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} ({profile.model_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Twitter generation */}
                <div className="ai-action-row">
                  <div className="form-field">
                    <label>Twitter Template</label>
                    <select
                      value={twitterTemplateId}
                      onChange={(e) => setTwitterTemplateId(e.target.value)}
                    >
                      <option value="">Select template</option>
                      {twitterTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary ai-generate-btn"
                    disabled={generationLoading}
                    onClick={() => void handleGenerate(twitterTemplateId, "Twitter summary")}
                  >
                    {generationLoading ? "Generating..." : "Generate Twitter"}
                  </button>
                </div>

                {/* Facebook generation */}
                <div className="ai-action-row">
                  <div className="form-field">
                    <label>Facebook Template</label>
                    <select
                      value={facebookTemplateId}
                      onChange={(e) => setFacebookTemplateId(e.target.value)}
                    >
                      <option value="">Select template</option>
                      {facebookTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary ai-generate-btn"
                    disabled={generationLoading}
                    onClick={() => void handleGenerate(facebookTemplateId, "Facebook summary")}
                  >
                    {generationLoading ? "Generating..." : "Generate Facebook"}
                  </button>
                </div>

                {/* Hashtag generation */}
                <div className="ai-action-row">
                  <div className="form-field">
                    <label>Hashtag Template</label>
                    <select
                      value={hashtagTemplateId}
                      onChange={(e) => setHashtagTemplateId(e.target.value)}
                    >
                      <option value="">Select template</option>
                      {hashtagTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary ai-generate-btn"
                    disabled={generationLoading}
                    onClick={() => void handleGenerate(hashtagTemplateId, "hashtags")}
                  >
                    {generationLoading ? "Generating..." : "Generate Hashtags"}
                  </button>
                </div>

                {/* Success / error messages */}
                {generationMessage ? (
                  <div className="inline-message inline-message-success">
                    {generationMessage}
                  </div>
                ) : null}

                {generationError ? (
                  <div className="inline-message inline-message-error">
                    {generationError}
                  </div>
                ) : null}
              </div>
            </div>

            {/* External original post link */}
            {post.external_post_url ? (
              <div className="detail-links">
                <a
                  href={post.external_post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="table-link"
                >
                  Open Original Post
                </a>
              </div>
            ) : null}

            {/* Excerpt */}
            {post.excerpt ? (
              <CollapsibleSection title="Excerpt">
                <p className="detail-paragraph">{post.excerpt}</p>
              </CollapsibleSection>
            ) : null}

            {/* Featured image */}
            {post.featured_image_url ? (
              <CollapsibleSection title="Featured Image">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="detail-image"
                />
              </CollapsibleSection>
            ) : null}

            {/* Categories */}
            <CollapsibleSection title="Categories">
              <pre className="json-preview">{categoriesText}</pre>
            </CollapsibleSection>

            {/* Tags */}
            <CollapsibleSection title="Tags">
              <pre className="json-preview">{tagsText}</pre>
            </CollapsibleSection>

            {/* Main article/content preview */}
            <CollapsibleSection title="Content Preview">
              {contentHtml ? (
                <div
                  className="content-preview"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="muted">No content available.</p>
              )}
            </CollapsibleSection>
          </div>

          {/* -------------------------
              Latest AI Outputs
             ------------------------- */}
          <div className="detail-grid-2">
            <div className="card">
              <h3>Latest Twitter Generation</h3>
              <p className="detail-paragraph">
                {extractLatestText(latestAI?.twitter_summary) ||
                  "No latest Twitter generation found."}
              </p>

              {extractLatestMeta(latestAI?.twitter_summary) ? (
                <p className="muted small-text">
                  {extractLatestMeta(latestAI?.twitter_summary)}
                </p>
              ) : null}
            </div>

            <div className="card">
              <h3>Latest Facebook Generation</h3>
              <p className="detail-paragraph">
                {extractLatestText(latestAI?.facebook_summary) ||
                  "No latest Facebook generation found."}
              </p>

              {extractLatestMeta(latestAI?.facebook_summary) ? (
                <p className="muted small-text">
                  {extractLatestMeta(latestAI?.facebook_summary)}
                </p>
              ) : null}
            </div>
          </div>

          {/* Latest hashtags */}
          <div className="card">
            <CollapsibleSection title="Latest Hashtags">
              <pre className="json-preview">
                {extractLatestText(latestAI?.hashtags) || "-"}
              </pre>
            </CollapsibleSection>
          </div>

          {/* -------------------------
              AI Generation History
             ------------------------- */}
          <div className="card">
            <CollapsibleSection title="AI Generation History">
              {generations.length === 0 ? (
                <p className="muted">No AI generations found for this post.</p>
              ) : (
                <div className="generation-list">
                  {generations.map((item, index) => (
                    <div key={item.id ?? index} className="generation-card">
                      <div className="generation-head">
                        <div>
                          <div className="table-strong">
                            {item.platform || item.generation_type || "AI Output"}
                          </div>
                          <div className="muted small-text">
                            {formatDate(item.created_at)}
                          </div>
                        </div>

                        <StatusBadge
                          label={item.status || "done"}
                          tone={item.status === "failed" ? "danger" : "success"}
                        />
                      </div>

                      <div className="generation-meta">
                        <span>Model: {item.model_name || "-"}</span>
                        <span>Template ID: {item.prompt_template_id ?? "-"}</span>
                      </div>

                      <div className="detail-section">
                        <h4>Generated Text</h4>
                        <p className="detail-paragraph">
                          {(item as any).generated_text ||
                            (item as any).output_text ||
                            "-"}
                        </p>
                      </div>

                      <div className="detail-section">
                        <h4>Hashtags</h4>
                        <pre className="json-preview">{item.hashtags || "-"}</pre>
                      </div>

                      {item.error_message ? (
                        <div className="detail-section">
                          <h4>Error</h4>
                          <pre className="json-preview">{item.error_message}</pre>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>
          </div>
        </div>
      ) : null}
    </div>
  );
}