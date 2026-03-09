import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import {
  getPostAIGenerations,
  getPostDetail,
  getPostLatestAI,
} from "../api/posts";
import { getSourceSites } from "../api/sourceSites";
import type { AIGenerationItem, PostDetail } from "../types/post";
import type { SourceSite } from "../types/sourceSite";

type LatestAISimple = {
  twitter_summary?: string | null;
  facebook_summary?: string | null;
  hashtags?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const numericPostId = Number(postId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [post, setPost] = useState<PostDetail | null>(null);
  const [generations, setGenerations] = useState<AIGenerationItem[]>([]);
  const [latestAI, setLatestAI] = useState<LatestAISimple | null>(null);
  const [sites, setSites] = useState<SourceSite[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError("");

        if (!numericPostId || Number.isNaN(numericPostId)) {
          throw new Error("Invalid post id.");
        }

        const [detailData, generationsData, latestAIData, sitesData] = await Promise.all([
          getPostDetail(numericPostId),
          getPostAIGenerations(numericPostId),
          getPostLatestAI(numericPostId),
          getSourceSites(),
        ]);

        setPost(detailData.post);
        setGenerations(generationsData);
        setLatestAI(latestAIData.latest || detailData.latest_ai || null);
        setSites(sitesData);
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
    return sites.find((site) => site.id === post.source_site_id)?.name || String(post.source_site_id);
  }, [post, sites]);

  const contentHtml =
    post?.cleaned_content ||
    post?.content ||
    post?.raw_content ||
    "";

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
              <StatusBadge label={post.status || "unknown"} tone="default" />
            </div>

            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <span className="detail-meta-label">Source Site</span>
                <span>{siteName}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Published At</span>
                <span>{formatDate((post as any).original_published_at || post.published_at)}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Fetched At</span>
                <span>{formatDate((post as any).last_fetched_at || post.fetched_at || post.created_at)}</span>
              </div>
              <div className="detail-meta-item">
                <span className="detail-meta-label">Author</span>
                <span>{post.author_name || "-"}</span>
              </div>
            </div>

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

            {post.excerpt ? (
              <div className="detail-section">
                <h3>Excerpt</h3>
                <p className="detail-paragraph">{post.excerpt}</p>
              </div>
            ) : null}

            {post.featured_image_url ? (
              <div className="detail-section">
                <h3>Featured Image</h3>
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="detail-image"
                />
              </div>
            ) : null}

            <div className="detail-section">
              <h3>Categories</h3>
              <pre className="json-preview">{categoriesText}</pre>
            </div>

            <div className="detail-section">
              <h3>Tags</h3>
              <pre className="json-preview">{tagsText}</pre>
            </div>

            <div className="detail-section">
              <h3>Content Preview</h3>
              {contentHtml ? (
                <div
                  className="content-preview"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <p className="muted">No content available.</p>
              )}
            </div>
          </div>

          <div className="detail-grid-2">
            <div className="card">
              <h3>Latest Twitter Generation</h3>
              <p className="detail-paragraph">
                {latestAI?.twitter_summary || "No latest Twitter generation found."}
              </p>
            </div>

            <div className="card">
              <h3>Latest Facebook Generation</h3>
              <p className="detail-paragraph">
                {latestAI?.facebook_summary || "No latest Facebook generation found."}
              </p>
            </div>
          </div>

          <div className="card">
            <h3>Latest Hashtags</h3>
            <pre className="json-preview">{latestAI?.hashtags || "-"}</pre>
          </div>

          <div className="card">
            <h3>AI Generation History</h3>

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
                      <p className="detail-paragraph">{item.generated_text || "-"}</p>
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
          </div>
        </div>
      ) : null}
    </div>
  );
}