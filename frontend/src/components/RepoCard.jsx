
import { Link } from "react-router-dom";
import {
  GitBranch,
  Star,
  GitFork,
  Clock3,
  ArrowUpRight,
  Code2,
} from "lucide-react";

export default function RepoCard({
  name,
  description,
  language,
  stars,
  forks,
  updated,
  url,
}) {
  return (
    <div className="repo-card">
      <div className="repo-card-top">
        <div className="repo-icon">
          <GitBranch size={21} />
        </div>

        <span className="repo-status">Public</span>

        <a
          href={url || "#"}
          className="repo-open-link"
          aria-label="Open repository"
          {...(url
            ? { target: "_blank", rel: "noopener noreferrer" }
            : { onClick: (event) => event.preventDefault() })}
        >
          <ArrowUpRight size={18} />
        </a>
      </div>

      <Link
        to={`/search?repo=${encodeURIComponent(name)}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <h3 style={{ cursor: "pointer" }}>{name}</h3>
      </Link>

      <p className="repo-description">
        {description || "No description available for this repository."}
      </p>

      <div className="repo-language">
        <Code2 size={15} />
        <span>{language || "Not specified"}</span>
      </div>

      <div className="repo-card-footer">
        <span>
          <Star size={15} />
          {stars ?? 0}
        </span>

        <span>
          <GitFork size={15} />
          {forks ?? 0}
        </span>

        <span>
          <Clock3 size={15} />
          {updated || "Recently"}
        </span>
      </div>
    </div>
  );
}
