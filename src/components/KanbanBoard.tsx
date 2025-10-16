import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task, AppRole, ROLE_PIPELINES, Priority } from "@/types/tasks";
import ColumnContainer from "./ColumnContainer";
import TaskCard from "./TaskCard";
import CreateTaskDialog from "./CreateTaskDialog";
import { Loader2 } from "lucide-react";

interface KanbanBoardProps {
  userRole: AppRole;
  userId: string;
  isAdmin?: boolean;
}

const KanbanBoard = ({ userRole, userId, isAdmin }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = ROLE_PIPELINES[userRole];

  useEffect(() => {
    fetchTasks();
    
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('role', userRole)
        .order('position');

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (title: string, description: string, priority: Priority) => {
    try {
      const { error } = await supabase.from('tasks').insert({
        title,
        description,
        priority,
        status: columns[0],
        role: userRole,
        created_by: userId,
        position: tasks.filter(t => t.status === columns[0]).length,
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      if (task.status === 'DONE') {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
        
        toast({
          title: "Task Deleted",
          description: "Completed task has been removed",
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .update({
            status: 'DONE',
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId);

        if (error) throw error;
        
        toast({
          title: "Task Completed",
          description: "Task marked as done",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      toast({
        title: "Task Deleted",
        description: "Task has been permanently removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasks.find(t => t.id === overId);
    const overColumn = columns.find(c => c === overId);

    const newStatus = overColumn || overTask?.status || activeTask.status;

    if (activeTask.status === newStatus) {
      const statusTasks = tasks.filter(t => t.status === newStatus);
      const oldIndex = statusTasks.findIndex(t => t.id === activeId);
      const newIndex = statusTasks.findIndex(t => t.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(statusTasks, oldIndex, newIndex);
        const updatedTasks = tasks.map(t => {
          const newTask = newOrder.find(nt => nt.id === t.id);
          return newTask || t;
        });
        setTasks(updatedTasks);

        for (let i = 0; i < newOrder.length; i++) {
          await supabase
            .from('tasks')
            .update({ position: i })
            .eq('id', newOrder[i].id);
        }
      }
    } else {
      await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', activeId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Pipeline
        </h2>
        <CreateTaskDialog onCreateTask={handleCreateTask} />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <ColumnContainer
              key={column}
              columnId={column}
              title={column}
              tasks={tasks.filter(t => t.status === column)}
              onComplete={handleCompleteTask}
              onDelete={isAdmin ? handleDeleteTask : undefined}
              isAdmin={isAdmin}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onComplete={() => {}}
              isAdmin={isAdmin}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
