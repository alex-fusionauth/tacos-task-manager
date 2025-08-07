import KanbanBoard from '@/components/kanban/kanban-board';

export default function DashboardPage() {
  return (
    <div className="h-full p-4 md:p-8">
      <KanbanBoard />
    </div>
  );
}
