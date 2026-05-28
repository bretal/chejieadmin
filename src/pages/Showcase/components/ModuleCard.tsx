import ScrollingTags from './ScrollingTags';

type ModuleCardProps = {
  icon?: string;
  title: string;
  desc: string;
  tags: string[];
  className?: string;
};

export default function ModuleCard({
  // icon,
  title,
  desc,
  tags,
  className = '',
}: ModuleCardProps) {
  return (
    <div className={`module-card ${className}`}>
      {/* <div className="card-icon">{icon}</div> */}
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{desc}</p>
      <ScrollingTags
        tags={tags}
        className="card-tags"
        tagClassName="card-tag"
        duration={10}
        gap={12}
      />
    </div>
  );
}
