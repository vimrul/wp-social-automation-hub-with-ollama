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
  getPostPublishLogs,
} from "../api/posts";
import { getSourceSites } from "../api/sourceSites";
import { getOllamaProfiles } from "../api/ollamaProfiles";
import { getPromptTemplates } from "../api/promptTemplates";
import { getSocialAccounts } from "../api/socialAccounts";
import { generateAIContent } from "../api/aiGenerations";
import { publishPost } from "../api/publishing";

// Types
import type { AIGenerationItem, PostDetail } from "../types/post";
import type { SourceSite } from "../types/sourceSite";
import type { OllamaProfile } from "../types/ollamaProfile";
import type { PromptTemplate } from "../types/promptTemplate";
import type { SocialAccount } from "../types/socialAccount";

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

type LatestAISimple = {
  twitter_summary?: LatestAIValue;
  facebook_summary?: LatestAIValue;
  hashtags?: LatestAIValue;
};

type GenerationType = "" | "twitter" | "facebook" | "hashtags";

type PublishLogItem = {
  id: number;
  post_id: number;
  social_account_id?: number | null;
  platform: string;
  status: string;
  published_id?: string | null;
  published_url?: string | null;
  content_text?: string | null;
  hashtags?: string | null;
  error_message?: string | null;
  created_at: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function extractLatestText(value: LatestAIValue): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return value.output_text || value.hashtags || JSON.stringify(value, null, 2);
  }

  return "";
}

function extractLatestMeta(value: LatestAIValue): string {
  if (!value || typeof value !== "object") return "";

  const parts: string[] = [];

  if (value.generation_id) parts.push(`Generation #${value.generation_id}`);
  if (value.prompt_template_id) parts.push(`Template ${value.prompt_template_id}`);
  if (value.ollama_profile_id) parts.push(`Profile ${value.ollama_profile_id}`);
  if (value.generated_at) parts.push(formatDate(value.generated_at));

  return parts.join(" • ");
}

function publishTone(status?: string) {
  return status === "success" ? "success" : "danger";
}

function normalizePlatform(value?: string | null) {
  return (value || "").toLowerCase();
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const numericPostId = Number(postId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [post, setPost] = useState<PostDetail | null>(null);
  const [generations, setGenerations] = useState<AIGenerationItem[]>([]);
  const [latestAI, setLatestAI] = useState<LatestAISimple | null>(null);
  const [publishLogs, setPublishLogs] = useState<PublishLogItem[]>([]);
  const [sites, setSites] = useState<SourceSite[]>([]);
  const [profiles, setProfiles] = useState<OllamaProfile[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [twitterTemplateId, setTwitterTemplateId] = useState("");
  const [facebookTemplateId, setFacebookTemplateId] = useState("");
  const [hashtagTemplateId, setHashtagTemplateId] = useState("");

  const [selectedSocialAccountId, setSelectedSocialAccountId] = useState("");
  const [publishContentOverride, setPublishContentOverride] = useState("");
  const [publishHashtagsOverride, setPublishHashtagsOverride] = useState("");
  const [useManualPublishText, setUseManualPublishText] = useState(false);
  const [useManualPublishHashtags, setUseManualPublishHashtags] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishError, setPublishError] = useState("");
  const [publishResultUrl, setPublishResultUrl] = useState("");

  const [generationLoadingType, setGenerationLoadingType] =
    useState<GenerationType>("");
  const [generationMessage, setGenerationMessage] = useState("");
  const [generationError, setGenerationError] = useState("");

  const loadPageData = async () => {
    if (!numericPostId || Number.isNaN(numericPostId)) {
      throw new Error("Invalid post id.");
    }

    const [
      detailData,
      generationsData,
      latestAIData,
      publishLogsData,
      sitesData,
      profilesData,
      templatesData,
      socialAccountsData,
    ] = await Promise.all([
      getPostDetail(numericPostId),
      getPostAIGenerations(numericPostId),
      getPostLatestAI(numericPostId),
      getPostPublishLogs(numericPostId),
      getSourceSites(),
      getOllamaProfiles(),
      getPromptTemplates(),
      getSocialAccounts(),
    ]);

    setPost(detailData.post);
    setGenerations(generationsData);
    setLatestAI((latestAIData.latest || detailData.latest_ai || null) as LatestAISimple);
    setPublishLogs((publishLogsData || []) as PublishLogItem[]);
    setSites(sitesData);
    setProfiles(profilesData);
    setTemplates(templatesData);
    setSocialAccounts(socialAccountsData);

    if (!selectedProfileId) {
      const defaultProfile =
        profilesData.find((profile) => profile.is_default && profile.is_active) ||
        profilesData.find((profile) => profile.is_active) ||
        profilesData[0];

      if (defaultProfile) {
        setSelectedProfileId(String(defaultProfile.id));
      }
    }

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

    if (!hashtagTemplateId) {
      const hashtagTemplate =
        templatesData.find(
          (template) => template.is_active && template.template_type === "hashtags"
        ) || templatesData.find((template) => template.is_active);

      if (hashtagTemplate) {
        setHashtagTemplateId(String(hashtagTemplate.id));
      }
    }

    if (!selectedSocialAccountId) {
      const defaultAccount =
        socialAccountsData.find(
          (account) =>
            account.is_active && account.source_site_id === detailData.post.source_site_id
        ) ||
        socialAccountsData.find((account) => account.is_active) ||
        socialAccountsData[0];

      if (defaultAccount) {
        setSelectedSocialAccountId(String(defaultAccount.id));
      }
    }
  };

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

  const siteName = useMemo(() => {
    if (!post) return "-";

    return (
      sites.find((site) => site.id === post.source_site_id)?.name ||
      String(post.source_site_id)
    );
  }, [post, sites]);

  const socialAccountMap = useMemo(() => {
    return new Map(socialAccounts.map((account) => [account.id, account]));
  }, [socialAccounts]);

  const selectedSocialAccount = useMemo(() => {
    if (!selectedSocialAccountId) return null;
    return socialAccounts.find((account) => account.id === Number(selectedSocialAccountId)) || null;
  }, [selectedSocialAccountId, socialAccounts]);

  const contentHtml = post?.cleaned_content || (post as any)?.content || post?.raw_content || "";

  const tagsText = useMemo(() => {
    if (!post) return "-";

    if (Array.isArray((post as any).tag_names) && (post as any).tag_names.length > 0) {
      return (post as any).tag_names.join(", ");
    }

    if ((post as any).tags_json) {
      return String((post as any).tags_json);
    }

    if (Array.isArray((post as any).tags)) {
      return JSON.stringify((post as any).tags, null, 2);
    }

    return "-";
  }, [post]);

  const categoriesText = useMemo(() => {
    if (!post) return "-";

    if (
      Array.isArray((post as any).category_names) &&
      (post as any).category_names.length > 0
    ) {
      return (post as any).category_names.join(", ");
    }

    if ((post as any).categories_json) {
      return String((post as any).categories_json);
    }

    if (Array.isArray((post as any).categories)) {
      return JSON.stringify((post as any).categories, null, 2);
    }

    return "-";
  }, [post]);

  const twitterTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.is_active &&
        (template.platform === "twitter" ||
          template.platform === "generic" ||
          template.platform === null)
    );
  }, [templates]);

  const facebookTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.is_active &&
        (template.platform === "facebook" ||
          template.platform === "generic" ||
          template.platform === null)
    );
  }, [templates]);

  const hashtagTemplates = useMemo(() => {
    return templates.filter(
      (template) =>
        template.is_active &&
        (template.template_type === "hashtags" ||
          template.platform === "generic" ||
          template.platform === null)
    );
  }, [templates]);

  const activeProfiles = useMemo(() => {
    return profiles.filter((profile) => profile.is_active);
  }, [profiles]);

  const activeSocialAccounts = useMemo(() => {
    return socialAccounts.filter((account) => account.is_active);
  }, [socialAccounts]);

  const latestPlatformText = useMemo(() => {
    const platform = normalizePlatform(selectedSocialAccount?.platform);

    if (platform === "facebook") {
      return extractLatestText(latestAI?.facebook_summary);
    }

    if (platform === "twitter" || platform === "x") {
      return extractLatestText(latestAI?.twitter_summary);
    }

    return "";
  }, [selectedSocialAccount, latestAI]);

  const latestHashtagText = useMemo(() => {
    return extractLatestText(latestAI?.hashtags);
  }, [latestAI]);

  const effectivePublishText = useMemo(() => {
    if (useManualPublishText) {
      return publishContentOverride.trim();
    }
    return latestPlatformText.trim();
  }, [useManualPublishText, publishContentOverride, latestPlatformText]);

  const effectivePublishHashtags = useMemo(() => {
    if (useManualPublishHashtags) {
      return publishHashtagsOverride.trim();
    }
    return latestHashtagText.trim();
  }, [useManualPublishHashtags, publishHashtagsOverride, latestHashtagText]);

  const finalPublishPreview = useMemo(() => {
    const base = effectivePublishText.trim();
    const tags = effectivePublishHashtags.trim();

    if (base && tags) return `${base}\n\n${tags}`;
    if (base) return base;
    return tags;
  }, [effectivePublishText, effectivePublishHashtags]);

  const lastPublishLog = publishLogs.length > 0 ? publishLogs[0] : null;

  const handleGenerate = async (
    promptTemplateIdValue: string,
    label: string,
    generationType: Exclude<GenerationType, "">
  ) => {
    try {
      setGenerationLoadingType(generationType);
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
      setGenerationLoadingType("");
    }
  };

  const handlePublish = async () => {
    try {
      setPublishLoading(true);
      setPublishError("");
      setPublishMessage("");
      setPublishResultUrl("");

      if (!numericPostId || Number.isNaN(numericPostId)) {
        throw new Error("Invalid post id.");
      }

      if (!selectedSocialAccountId) {
        throw new Error("Please select a social account.");
      }

      if (!finalPublishPreview.trim()) {
        throw new Error("Nothing to publish. Generate content or enter manual text first.");
      }

      const result = await publishPost({
        post_id: numericPostId,
        social_account_id: Number(selectedSocialAccountId),
        content_text: effectivePublishText || undefined,
        hashtags: effectivePublishHashtags || undefined,
      });

      setPublishMessage(result.message || "Published successfully.");
      setPublishResultUrl(result.published_url || "");
      await loadPageData();
    } catch (err) {
      console.error(err);
      setPublishError(err instanceof Error ? err.message : "Failed to publish post.");
      await loadPageData();
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Post Detail #${postId ?? ""}`}
        description="Detailed view of a single post."
      />

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <EmptyState title="Unable to load post detail" description={error} />
      ) : null}

      {!loading && !error && post ? (
        <div className="detail-stack">
          <div className="card">
            <div className="detail-top">
              <div>
                <h2 className="detail-title">{post.title}</h2>
                <p className="muted detail-subtitle">{post.slug}</p>
              </div>
              <StatusBadge label={(post as any).status || "unknown"} tone="default" />
            </div>

            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <span className="detail-meta-label">Source Site</span>
                <span>{siteName}</span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Published At</span>
                <span>
                  {formatDate((post as any).original_published_at || (post as any).published_at)}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Fetched At</span>
                <span>
                  {formatDate(
                    (post as any).last_fetched_at ||
                      (post as any).fetched_at ||
                      (post as any).created_at
                  )}
                </span>
              </div>

              <div className="detail-meta-item">
                <span className="detail-meta-label">Author</span>
                <span>{(post as any).author_name || "-"}</span>
              </div>
            </div>

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
                    disabled={generationLoadingType === "twitter"}
                    onClick={() =>
                      void handleGenerate(twitterTemplateId, "Twitter summary", "twitter")
                    }
                  >
                    {generationLoadingType === "twitter"
                      ? "Generating..."
                      : "Generate Twitter"}
                  </button>
                </div>

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
                    disabled={generationLoadingType === "facebook"}
                    onClick={() =>
                      void handleGenerate(
                        facebookTemplateId,
                        "Facebook summary",
                        "facebook"
                      )
                    }
                  >
                    {generationLoadingType === "facebook"
                      ? "Generating..."
                      : "Generate Facebook"}
                  </button>
                </div>

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
                    disabled={generationLoadingType === "hashtags"}
                    onClick={() =>
                      void handleGenerate(hashtagTemplateId, "hashtags", "hashtags")
                    }
                  >
                    {generationLoadingType === "hashtags"
                      ? "Generating..."
                      : "Generate Hashtags"}
                  </button>
                </div>

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

            <div className="detail-section">
              <h3>Publish</h3>

              <div className="publish-panel">
                <div className="form-field">
                  <label>Social Account</label>
                  <select
                    value={selectedSocialAccountId}
                    onChange={(e) => setSelectedSocialAccountId(e.target.value)}
                  >
                    <option value="">Select social account</option>
                    {activeSocialAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.platform})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSocialAccount ? (
                  <div className="publish-context-card">
                    <div className="publish-context-row">
                      <span className="detail-meta-label">Selected Platform</span>
                      <span>{selectedSocialAccount.platform}</span>
                    </div>
                    <div className="publish-context-row">
                      <span className="detail-meta-label">Selected Account</span>
                      <span>{selectedSocialAccount.name}</span>
                    </div>
                    <div className="publish-context-row">
                      <span className="detail-meta-label">Default Content Source</span>
                      <span>
                        {normalizePlatform(selectedSocialAccount.platform) === "facebook"
                          ? "Latest Facebook generation"
                          : normalizePlatform(selectedSocialAccount.platform) === "twitter" ||
                            normalizePlatform(selectedSocialAccount.platform) === "x"
                          ? "Latest Twitter generation"
                          : "No platform-specific generator"}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="publish-toggle-grid">
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={useManualPublishText}
                      onChange={(e) => setUseManualPublishText(e.target.checked)}
                    />
                    Use manual content text
                  </label>

                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={useManualPublishHashtags}
                      onChange={(e) => setUseManualPublishHashtags(e.target.checked)}
                    />
                    Use manual hashtags
                  </label>
                </div>

                <div className="form-field">
                  <label>
                    Content Text {useManualPublishText ? "(manual)" : "(auto from latest generation)"}
                  </label>
                  <textarea
                    rows={6}
                    value={useManualPublishText ? publishContentOverride : latestPlatformText}
                    onChange={(e) => setPublishContentOverride(e.target.value)}
                    placeholder="Leave auto mode on to use generated content."
                    disabled={!useManualPublishText}
                  />
                </div>

                <div className="form-field">
                  <label>
                    Hashtags {useManualPublishHashtags ? "(manual)" : "(auto from latest hashtags)"}
                  </label>
                  <textarea
                    rows={3}
                    value={useManualPublishHashtags ? publishHashtagsOverride : latestHashtagText}
                    onChange={(e) => setPublishHashtagsOverride(e.target.value)}
                    placeholder="Leave auto mode on to use generated hashtags."
                    disabled={!useManualPublishHashtags}
                  />
                </div>

                <div className="detail-section">
                  <h4>Final Publish Preview</h4>
                  <pre className="publish-preview-box">
                    {finalPublishPreview || "Nothing to publish yet."}
                  </pre>
                </div>

                <div className="publish-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={publishLoading || !selectedSocialAccountId || !finalPublishPreview.trim()}
                    onClick={() => void handlePublish()}
                  >
                    {publishLoading ? "Publishing..." : "Publish Now"}
                  </button>
                </div>

                {publishMessage ? (
                  <div className="inline-message inline-message-success">
                    {publishMessage}
                    {publishResultUrl ? (
                      <>
                        {" "}
                        <a
                          href={publishResultUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="table-link"
                        >
                          Open Published Post
                        </a>
                      </>
                    ) : null}
                  </div>
                ) : null}

                {publishError ? (
                  <div className="inline-message inline-message-error">
                    {publishError}
                  </div>
                ) : null}

                {lastPublishLog ? (
                  <div className="publish-last-result">
                    <div className="publish-last-result-head">
                      <h4>Last Publish Result</h4>
                      <StatusBadge
                        label={lastPublishLog.status || "unknown"}
                        tone={publishTone(lastPublishLog.status) as "success" | "danger"}
                      />
                    </div>
                    <p className="muted small-text">{formatDate(lastPublishLog.created_at)}</p>
                    {lastPublishLog.published_url ? (
                      <a
                        href={lastPublishLog.published_url}
                        target="_blank"
                        rel="noreferrer"
                        className="table-link"
                      >
                        {lastPublishLog.published_url}
                      </a>
                    ) : null}
                    {lastPublishLog.error_message ? (
                      <pre className="json-preview">{lastPublishLog.error_message}</pre>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {(post as any).external_post_url ? (
              <div className="detail-links">
                <a
                  href={(post as any).external_post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="table-link"
                >
                  Open Original Post
                </a>
              </div>
            ) : null}

            {(post as any).excerpt ? (
              <CollapsibleSection title="Excerpt">
                <p className="detail-paragraph">{(post as any).excerpt}</p>
              </CollapsibleSection>
            ) : null}

            {(post as any).featured_image_url ? (
              <CollapsibleSection title="Featured Image">
                <img
                  src={(post as any).featured_image_url}
                  alt={(post as any).title}
                  className="detail-image"
                />
              </CollapsibleSection>
            ) : null}

            <CollapsibleSection title="Categories">
              <pre className="json-preview">{categoriesText}</pre>
            </CollapsibleSection>

            <CollapsibleSection title="Tags">
              <pre className="json-preview">{tagsText}</pre>
            </CollapsibleSection>

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

          <div className="card">
            <CollapsibleSection title="Latest Hashtags">
              <pre className="json-preview">
                {extractLatestText(latestAI?.hashtags) || "-"}
              </pre>
            </CollapsibleSection>
          </div>

          <div className="card">
            <CollapsibleSection title="Publish History">
              {publishLogs.length === 0 ? (
                <p className="muted">No publish history found for this post.</p>
              ) : (
                <div className="generation-list">
                  {publishLogs.map((item) => {
                    const account =
                      item.social_account_id != null
                        ? socialAccountMap.get(item.social_account_id)
                        : undefined;

                    return (
                      <div key={item.id} className="generation-card">
                        <div className="generation-head">
                          <div>
                            <div className="table-strong">
                              {item.platform || "unknown"}
                            </div>
                            <div className="muted small-text">
                              {formatDate(item.created_at)}
                            </div>
                          </div>

                          <StatusBadge
                            label={item.status || "unknown"}
                            tone={publishTone(item.status) as "success" | "danger"}
                          />
                        </div>

                        <div className="generation-meta">
                          <span>
                            Social Account:{" "}
                            {account
                              ? `${account.name} (${account.platform})`
                              : item.social_account_id ?? "-"}
                          </span>
                          <span>Published ID: {item.published_id || "-"}</span>
                        </div>

                        {item.published_url ? (
                          <div className="detail-section">
                            <h4>Published URL</h4>
                            <a
                              href={item.published_url}
                              target="_blank"
                              rel="noreferrer"
                              className="table-link"
                            >
                              {item.published_url}
                            </a>
                          </div>
                        ) : null}

                        {item.content_text ? (
                          <div className="detail-section">
                            <h4>Content Text</h4>
                            <p className="detail-paragraph">{item.content_text}</p>
                          </div>
                        ) : null}

                        {item.hashtags ? (
                          <div className="detail-section">
                            <h4>Hashtags</h4>
                            <pre className="json-preview">{item.hashtags}</pre>
                          </div>
                        ) : null}

                        {item.error_message ? (
                          <div className="detail-section">
                            <h4>Error</h4>
                            <pre className="json-preview">{item.error_message}</pre>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CollapsibleSection>
          </div>

          <div className="card">
            <CollapsibleSection title="AI Generation History">
              {generations.length === 0 ? (
                <p className="muted">No AI generations found for this post.</p>
              ) : (
                <div className="generation-list">
                  {generations.map((item, index) => (
                    <div key={(item as any).id ?? index} className="generation-card">
                      <div className="generation-head">
                        <div>
                          <div className="table-strong">
                            {(item as any).platform ||
                              (item as any).generation_type ||
                              "AI Output"}
                          </div>
                          <div className="muted small-text">
                            {formatDate((item as any).created_at)}
                          </div>
                        </div>

                        <StatusBadge
                          label={(item as any).status || "done"}
                          tone={(item as any).status === "failed" ? "danger" : "success"}
                        />
                      </div>

                      <div className="generation-meta">
                        <span>Model: {(item as any).model_name || "-"}</span>
                        <span>Template ID: {(item as any).prompt_template_id ?? "-"}</span>
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
                        <pre className="json-preview">{(item as any).hashtags || "-"}</pre>
                      </div>

                      {(item as any).error_message ? (
                        <div className="detail-section">
                          <h4>Error</h4>
                          <pre className="json-preview">{(item as any).error_message}</pre>
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