
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
}) {
  return (
    <div className="repo-card">
      <div className="repo-card-top">
        <div className="repo-icon">
          <GitBranch size={21} />
        </div>

        <span className="repo-status">Public</span>

        <a href="#" className="repo-open-link" aria-label="Open repository">
          <ArrowUpRight size={18} />
        </a>
      </div>

      <h3>{name}</h3>

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
