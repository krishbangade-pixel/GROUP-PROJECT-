
export default function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  color = "purple",
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>

        <div className={`stat-icon ${color}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-card-bottom">
        <span className="stat-change">{change}</span>
        <span className="stat-description">{description}</span>
      </div>
    </div>
  );
}
