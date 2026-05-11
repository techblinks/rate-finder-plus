import { useParams, Navigate } from "react-router-dom";
import GuideArticleShell from "@/components/guides/GuideArticleShell";
import { SUBURB_GUIDE_BY_SLUG } from "@/data/suburbGuides";

const SuburbGuidePage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const guide = SUBURB_GUIDE_BY_SLUG[slug];
  if (!guide) return <Navigate to="/guides" replace />;
  return <GuideArticleShell guide={guide} basePath="/suburbs" />;
};

export default SuburbGuidePage;
