import DashboardCard from "../../../components/dashboard_components/card_component/DashboardCard";

interface ModulePageProps {
  title: string;
}

// Placeholder for sidebar modules whose page has not been built yet
const ModulePage = ({ title }: ModulePageProps) => {
  return (
    <DashboardCard title={title}>
      <p>{title} page is under development.</p>
    </DashboardCard>
  );
};

export default ModulePage;
