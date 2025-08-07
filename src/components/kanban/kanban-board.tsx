'use client';

import { useState } from 'react';
import type { Column, Task } from '@/types';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../ui/label';

const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      { id: 'task-1', title: 'Setup Firebase Auth', description: 'Implement all required authentication providers.' },
      { id: 'task-2', title: 'Design Login Page', description: 'Create a visually appealing and user-friendly login UI.' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: 'task-3', title: 'Build Kanban Board UI', description: 'Develop the main task board with columns and cards.' },
      { id: 'task-4', title: 'Integrate OIDC with FusionAuth', description: 'Set up the OIDC flow for enterprise users.' },
    ],
  },
  {
    id: 'in-review',
    title: 'In Review',
    tasks: [
        { id: 'task-5', title: 'Implement Protected Routes', description: 'Use middleware to secure dashboard access.' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
        { id: 'task-6', title: 'Define Color Palette & Fonts', description: 'Update globals.css and tailwind.config.ts with the new design system.' },
    ],
  },
];

const KanbanCard = ({ task }: { task: Task }) => (
  <Card className="mb-4 bg-card hover:shadow-md transition-shadow duration-200 cursor-grab active:cursor-grabbing">
    <CardContent className="p-4">
      <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
      <p className="text-xs text-muted-foreground">{task.description}</p>
    </CardContent>
  </Card>
);

const AddTaskDialog = ({ onAddTask }: { onAddTask: (title: string, description: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAddTask = () => {
    if (title.trim()) {
      onAddTask(title, description);
      setTitle('');
      setDescription('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Plus className="mr-2 h-4 w-4" /> Add card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Finalize project report" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="task-description">Description (optional)</Label>
                <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more details about the task..." />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTask}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const KanbanColumn = ({ column, onAddTask }: { column: Column, onAddTask: (columnId: string, title: string, description: string) => void }) => (
  <div className="w-72 flex-shrink-0">
    <Card className="bg-secondary/50 h-full flex flex-col">
      <CardHeader className="p-4 border-b flex-row justify-between items-center">
        <CardTitle className="text-base font-semibold">{column.title}</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-2 flex-1 overflow-y-auto">
        {column.tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
         <AddTaskDialog onAddTask={(title, description) => onAddTask(column.id, title, description)} />
      </CardContent>
    </Card>
  </div>
);

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const handleAddTask = (columnId: string, title: string, description: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
    };
    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    });
    setColumns(newColumns);
  };

  return (
    <div className="flex h-full w-full overflow-x-auto pb-4">
        <div className="flex gap-6">
            {columns.map((column) => (
                <KanbanColumn key={column.id} column={column} onAddTask={handleAddTask} />
            ))}
        </div>
    </div>
  );
}
