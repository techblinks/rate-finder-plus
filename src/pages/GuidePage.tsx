import { useParams, Navigate } from "react-router-dom";
import GuideArticleShell from "@/components/guides/GuideArticleShell";
import { getGuide } from "@/data/guides";

const GuidePage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const guide = getGuide(slug);
  if (!guide) return <Navigate to="/guides" replace />;
  return <GuideArticleShell guide={guide} />;
};

export default GuidePage;
