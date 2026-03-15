import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/common/Loader";
import { getMyProfile, updateMyProfile, type AuthUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

export default function ProfilePage() {
  const { refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getMyProfile();
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setPhotoUrl(data.photo_url || "");
        setGitUrl(data.git_url || "");
        setLinkedinUrl(data.linkedin_url || "");
        setXUrl(data.x_url || "");
        setFacebookUrl(data.facebook_url || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateMyProfile({
        full_name: fullName,
        phone: phone || undefined,
        photo_url: photoUrl || undefined,
        git_url: gitUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        x_url: xUrl || undefined,
        facebook_url: facebookUrl || undefined,
      });

      setProfile(updated);
      setMessage("Profile updated successfully.");
      await refreshMe();
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your basic profile information."
      />

      {loading ? <Loader /> : null}

      {!loading && error ? (
        <div className="inline-message inline-message-error">{error}</div>
      ) : null}

      {!loading && profile ? (
        <div className="card">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-field">
              <label>Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input value={profile.email} disabled />
            </div>

            <div className="form-field">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-field">
              <label>Role</label>
              <input value={profile.role} disabled />
            </div>

            <div className="form-field form-field-full">
              <label>Photo URL</label>
              <input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
            </div>

            <div className="form-field form-field-full">
              <label>Git URL</label>
              <input value={gitUrl} onChange={(e) => setGitUrl(e.target.value)} />
            </div>

            <div className="form-field form-field-full">
              <label>LinkedIn URL</label>
              <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
            </div>

            <div className="form-field form-field-full">
              <label>X URL</label>
              <input value={xUrl} onChange={(e) => setXUrl(e.target.value)} />
            </div>

            <div className="form-field form-field-full">
              <label>Facebook URL</label>
              <input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />
            </div>

            {message ? (
              <div className="inline-message inline-message-success">{message}</div>
            ) : null}

            {error ? (
              <div className="inline-message inline-message-error">{error}</div>
            ) : null}

            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
