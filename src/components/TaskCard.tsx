import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GripVertical, Check, Trash2 } from "lucide-react";
import { Task, PRIORITY_COLORS, PRIORITY_LABELS } from "@/types/tasks";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isAdmin?: boolean;
}

const TaskCard = ({ task, onComplete, onDelete, isAdmin }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="p-3 mb-2 shadow-card hover:shadow-md transition-shadow bg-card group"
    >
      <div className="flex items-start gap-2">
        <button
          className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
            <Badge className={`${PRIORITY_COLORS[task.priority]} text-white text-xs shrink-0`}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{format(new Date(task.created_at), 'MMM dd, HH:mm')}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onComplete(task.id)}
              >
                <Check className="h-3 w-3" />
              </Button>
              {isAdmin && onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-destructive"
                  onClick={() => onDelete(task.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
