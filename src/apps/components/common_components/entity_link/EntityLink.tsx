import { Link } from "react-router-dom";
import type { DropDown } from "../../../types/api";

export type EntityModule = "institutions" | "teachers" | "courses" | "batches" | "students" | "exams";

interface EntityLinkProps {
  module: EntityModule;
  item?: DropDown | null;
}

// A related record's name that opens its view page, e.g. a student's course.
// Styled like list names (.crud-link): normal text, red on hover.
const EntityLink = ({ module, item }: EntityLinkProps) => {
  if (!item) return <>-</>;

  return (
    <Link className="crud-link" to={`/dashboard/${module}/view/${item.id}`}>
      {item.name}
    </Link>
  );
};

export default EntityLink;
