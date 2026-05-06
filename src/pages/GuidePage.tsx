import { useParams, Navigate } from "react-router-dom";
import GuideArticleShell from "@/components/guides/GuideArticleShell";
import { findGuide } from "@/data/allGuides";

const GuidePage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const guide = findGuide(slug);
  if (!guide) return <Navigate to="/guides" replace />;
  return <GuideArticleShell guide={guide} />;
};

export default GuidePage;
