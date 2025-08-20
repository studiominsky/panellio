'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '@/types/task-types';
import TaskList from './task-list';
import CreateTaskForm from './create-task-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  deleteTasks,
} from '@/services/task-service';
import { toast } from '@/hooks/use-toast';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarShortcut,
  MenubarSeparator,
} from '@/components/ui/menubar';
import { Ellipsis, Maximize2, Trash2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ColorThemeProvider } from '@/providers/color-theme-provider';
import { DirectoryItem } from '@/types/directory-type';
import { useTimeFormat } from '@/context/time-format-context';

interface TasksFeatureProps {
  directoryId: string;
  itemData: DirectoryItem;
  onDirectoryItemRemoved: (itemId: string) => void;
  width?: number;
}

export default function TasksFeature({
  directoryId,
  onDirectoryItemRemoved,
  itemData,
}: TasksFeatureProps) {
  const { user } = useAuth();
  const { timeFormat } = useTimeFormat();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] =
    useState(false);
  const [renamingTaskId, setRenamingTaskId] = useState<string | null>(
    null
  );
  const [newTitle, setNewTitle] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeleteTasksDialogOpen, setIsDeleteTasksDialogOpen] =
    useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dueHour, setDueHour] = useState<number>(9);
  const [dueMinute, setDueMinute] = useState<number>(0);
  const [duePeriod, setDuePeriod] = useState<'AM' | 'PM'>('AM');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const fetchedTasks = await getTasks(user.uid, directoryId);
        setTasks(fetchedTasks);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load tasks.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTasks();
  }, [user, directoryId]);

  const handleCreateTask = async (newTask: Task) => {
    if (!user) return;

    try {
      const maxPosition = tasks.length
        ? Math.max(...tasks.map((t) => t.position))
        : 0;
      const taskWithPosition = {
        ...newTask,
        position: maxPosition + 1,
      };
      const taskId = await addTask(
        user.uid,
        directoryId,
        taskWithPosition
      );
      setTasks((prev) => [
        ...prev,
        { ...taskWithPosition, id: taskId },
      ]);
      toast({
        title: 'Success',
        description: 'Task added successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add task.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTaskCompletion = async (
    taskId: string,
    completed: boolean
  ) => {
    try {
      if (!user) throw new Error('User not authenticated');
      await updateTask(user.uid, directoryId, taskId, { completed });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!user || !deletingTaskId) return;
    setLoading(true);
    try {
      await deleteTask(user.uid, directoryId, deletingTaskId);
      setTasks((prev) =>
        prev.filter((task) => task.id !== deletingTaskId)
      );
      toast({
        title: 'Success',
        description: 'Task deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      setDeletingTaskId(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete task.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async () => {
    if (!user || !editingTask) return;

    let adjustedHour = dueHour;
    if (timeFormat === '12h') {
      if (duePeriod === 'PM' && dueHour !== 12) {
        adjustedHour += 12;
      } else if (duePeriod === 'AM' && dueHour === 12) {
        adjustedHour = 0;
      }
    }
    const dueTime = `${adjustedHour
      .toString()
      .padStart(2, '0')}:${dueMinute.toString().padStart(2, '0')}`;

    const updatedTask = { ...editingTask, dueTime };

    try {
      await updateTask(
        user.uid,
        directoryId,
        editingTask.id,
        updatedTask
      );
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...updatedTask }
            : task
        )
      );
      toast({
        title: 'Success',
        description: 'Task updated successfully.',
      });
      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task.',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newTasksOrder = arrayMove(tasks, oldIndex, newIndex);
    setTasks(newTasksOrder);

    try {
      const updatedTasks = newTasksOrder.map((task, index) => ({
        ...task,
        position: index + 1,
      }));
      await Promise.all(
        updatedTasks.map((task) =>
          updateTask(user!.uid, directoryId, task.id, {
            position: task.position,
          })
        )
      );
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task order.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTaskOpen = (task: Task) => {
    const [hourStr, minuteStr] = task.dueTime
      ? task.dueTime.split(':')
      : ['09', '00'];
    let hour = parseInt(hourStr, 10);
    let period: 'AM' | 'PM' = 'AM';
    if (timeFormat === '12h') {
      period = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
    }
    setEditingTask({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    });
    setDueHour(hour);
    setDueMinute(parseInt(minuteStr, 10));
    setDuePeriod(period);
    setCalendarOpen(false);
    setIsEditTaskDialogOpen(true);
  };

  const handleDeleteTasks = async () => {
    if (!user) return;

    try {
      await deleteTasks(user.uid, directoryId);
      toast({ title: 'Tasks removed successfully!' });
      setIsDeleteTasksDialogOpen(false);
      onDirectoryItemRemoved(itemData.id);
    } catch (error) {
      console.error('Error removing tasks:', error);
      toast({
        title: 'Failed to remove tasks',
        variant: 'destructive',
      });
    }
  };

  const generateHours = () =>
    timeFormat === '12h'
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: 24 }, (_, i) => i);

  const generateMinutes = () =>
    Array.from({ length: 60 }, (_, i) => i);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <Menubar className="directory-item-drag-handle cursor-grab py-4 relative z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
        <MenubarMenu>
          <MenubarTrigger
            variant="ghost"
            className="bg-muted h-4 p-1 absolute right-6"
          >
            <Ellipsis size={23} />
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setIsTaskDialogOpen(true)}>
              Add Task
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsFullscreen(true)}>
              Fullscreen
              <MenubarShortcut>
                <Maximize2 size={14} />
              </MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem
              variant="destructive"
              onClick={() => setIsDeleteTasksDialogOpen(true)}
            >
              Remove Tasks
              <MenubarShortcut>
                <Trash2 className="text-[--red-500]" size={14} />
              </MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={rectSortingStrategy}
        >
          <TaskList
            tasks={tasks}
            onToggleCompletion={handleToggleTaskCompletion}
            onEditTask={handleEditTaskOpen}
            onDeleteTask={(id) => {
              setDeletingTaskId(id);
              setIsDeleteDialogOpen(true);
            }}
            loading={loading}
          />
        </SortableContext>
      </DndContext>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          showCloseButton={false}
          className="min-w-[90%] min-h-[80%] max-w-[95%] max-h-[85%] p-0 rounded-t-2xl overflow-y-auto"
        >
          <DialogDescription></DialogDescription>
          <Menubar className="cursor-grab h-8 z-10 px-6 rounded-none border border-border rounded-t-xl top-0 bg-muted flex justify-between">
            <MenubarMenu>
              <MenubarTrigger
                variant="ghost"
                className="bg-muted h-4 p-1 absolute right-6"
              >
                <Ellipsis size={23} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => setIsTaskDialogOpen(true)}
                >
                  Add Task
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onClick={() => setIsFullscreen(false)}>
                  Exit Fullscreen
                  <MenubarShortcut>
                    <Maximize2 size={14} />
                  </MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((task) => task.id)}
              strategy={rectSortingStrategy}
            >
              <ColorThemeProvider>
                <TaskList
                  tasks={tasks}
                  onToggleCompletion={handleToggleTaskCompletion}
                  onEditTask={handleEditTaskOpen}
                  onDeleteTask={(id) => {
                    setDeletingTaskId(id);
                    setIsDeleteDialogOpen(true);
                  }}
                  isInFullScreen={true}
                  loading={loading}
                />
              </ColorThemeProvider>
            </SortableContext>
          </DndContext>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={() => setIsEditTaskDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Edit the details of the task.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <div className="mt-4">
              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Edit Name
              </Label>
              <Input
                placeholder="Task Title"
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Edit Description
              </Label>
              <Textarea
                placeholder="Task Description"
                value={editingTask.description || ''}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev
                      ? { ...prev, description: e.target.value }
                      : null
                  )
                }
              />
              <Label className="block text-sm mt-4 mb-2 font-medium text-muted-foreground">
                Edit Priority
              </Label>
              <RadioGroup
                value={editingTask.priority || 'low'}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev
                      ? {
                          ...prev,
                          priority: value as
                            | 'low'
                            | 'medium'
                            | 'high',
                        }
                      : null
                  )
                }
                className="flex space-x-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="text-sm">
                    Low
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="text-sm">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="text-sm">
                    High
                  </Label>
                </div>
              </RadioGroup>
              <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
                Edit Due Date
              </Label>
              <Popover
                open={calendarOpen}
                onOpenChange={setCalendarOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full text-left"
                  >
                    {editingTask?.dueDate ? (
                      <span className="text-muted-foreground">
                        Due date:{' '}
                        <span className="text-inverted">
                          {new Date(
                            editingTask.dueDate
                          ).toDateString()}
                        </span>
                      </span>
                    ) : (
                      'Select a date'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <Calendar
                    selected={editingTask?.dueDate || undefined}
                    onSelect={(date: Date | undefined) => {
                      setEditingTask((prev) =>
                        prev
                          ? { ...prev, dueDate: date || null }
                          : null
                      );
                      setCalendarOpen(false);
                    }}
                    mode="single"
                  />
                </PopoverContent>
              </Popover>
              <Label className="block mb-2 mt-4 text-sm font-medium text-muted-foreground">
                Edit Due Time
              </Label>
              <div className="flex gap-2">
                <Select
                  value={dueHour.toString()}
                  onValueChange={(value) =>
                    setDueHour(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateHours().map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={dueMinute.toString()}
                  onValueChange={(value) =>
                    setDueMinute(parseInt(value))
                  }
                >
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMinutes().map((minute) => (
                      <SelectItem
                        key={minute}
                        value={minute.toString()}
                      >
                        {minute.toString().padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {timeFormat === '12h' && (
                  <Select
                    value={duePeriod}
                    onValueChange={(value) =>
                      setDuePeriod(value as 'AM' | 'PM')
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button
                onClick={handleEditTask}
                className="mt-4 w-full"
              >
                Update Task
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete this task? This action
            cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Enter the details for the new task.
            </DialogDescription>
          </DialogHeader>
          <CreateTaskForm
            onCreate={handleCreateTask}
            onClose={() => setIsTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteTasksDialogOpen}
        onOpenChange={() => setIsDeleteTasksDialogOpen(false)}
      >
        <DialogContent>
          <DialogTitle>Remove Tasks</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to remove tasks? This action cannot
            be undone, and all tasks will be permanently deleted.
          </DialogDescription>
          <DialogFooter className="mt-4">
            <Button
              variant="primary"
              onClick={() => setIsDeleteTasksDialogOpen(false)}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTasks}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
