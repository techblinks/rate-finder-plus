import { Link } from "react-router-dom";
import { SeoHead } from "@/components/seo/SeoHead";

const NotFound = () => (
  <>
    <SeoHead
      title="Page Not Found | Zune Calculator"
      description="The page you're looking for doesn't exist."
      canonical="/"
    />
    <div className="page-shell py-20 text-center">
      <h1 className="mb-3">Page not found</h1>
      <p className="mb-6 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/" className="link-accent text-[15px] font-medium">
        Return to homepage
      </Link>
    </div>
  </>
);

export default NotFound;
