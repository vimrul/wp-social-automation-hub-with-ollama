import { useParams } from "react-router-dom";
import PageHeader from "../components/layout/PageHeader";

export default function PostDetailPage() {
  const { postId } = useParams();

  return (
    <div>
      <PageHeader
        title={`Post Detail #${postId ?? ""}`}
        description="Detailed view of a single post."
      />
      <div className="card">
        Post detail page is ready for next step.
      </div>
    </div>
  );
}
