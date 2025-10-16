import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskCard from "./TaskCard";
import { Task } from "@/types/tasks";

interface ColumnContainerProps {
  columnId: string;
  title: string;
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isAdmin?: boolean;
}

const ColumnContainer = ({
  columnId,
  title,
  tasks,
  onComplete,
  onDelete,
  isAdmin,
}: ColumnContainerProps) => {
  const { setNodeRef } = useDroppable({ id: columnId });

  return (
    <div className="flex flex-col h-full min-w-[260px] max-w-[280px]">
      <Card className="flex-1 flex flex-col bg-muted/30 border-border">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">{title}</h3>
            <Badge variant="secondary" className="ml-2">
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <div
          ref={setNodeRef}
          className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            ))}
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No tasks
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ColumnContainer;
