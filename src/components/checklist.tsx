'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { OnboardingTask } from '@/models/onboarding-task';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, ListTodo, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type FilterStatus = 'all' | 'done' | 'pending';

export function Checklist() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError('You must be logged in to view your tasks.');
      return;
    }

    const tasksCollectionRef = collection(db, `onboarding_tasks/${user.uid}/tasks`);
    
    const unsubscribe = onSnapshot(
      tasksCollectionRef,
      (querySnapshot) => {
        const fetchedTasks: OnboardingTask[] = [];
        querySnapshot.forEach((doc) => {
          fetchedTasks.push({ id: doc.id, ...doc.data() } as OnboardingTask);
        });
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleStatusChange = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    const taskDocRef = doc(db, `onboarding_tasks/${user.uid}/tasks`, taskId);
    try {
      await updateDoc(taskDocRef, {
        status: !currentStatus,
      });
    } catch (err) {
      console.error('Error updating task status:', err);
      // Optionally, show a toast notification for the error
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'done') return task.status === true;
    if (filter === 'pending') return task.status === false;
    return true;
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>My Onboarding Checklist</CardTitle>
        <CardDescription>
          Your personalized list of tasks to complete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <ListTodo /> All
          </Button>
          <Button
            variant={filter === 'done' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('done')}
          >
            <CheckCircle2 /> Done
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            <ClipboardList /> Pending
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                    <p>No tasks found for this filter.</p>
                </div>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card/50">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.status}
                    onCheckedChange={() => handleStatusChange(task.id, task.status)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "text-sm font-medium leading-none cursor-pointer",
                        task.status && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </label>
                    <p className={cn(
                        "text-sm text-muted-foreground",
                        task.status && "line-through"
                        )}>
                      {task.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
