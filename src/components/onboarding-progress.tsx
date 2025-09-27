'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { UserProgress } from '@/models/user-progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { formatDistanceToNow } from 'date-fns';

export function OnboardingProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProgress() {
      if (!user) {
        setError('You must be logged in to see your progress.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const docRef = doc(db, 'user_progress', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const progressData: UserProgress = {
            ...data,
            // Convert Firestore Timestamp to JS Date
            lastUpdated: data.lastUpdated.toDate(),
          } as UserProgress;
          setProgress(progressData);
        } else {
          setProgress(null); // No progress found for this user
        }
      } catch (e) {
        console.error('Error fetching user progress:', e);
        setError('Failed to fetch onboarding progress.');
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [user]);

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Onboarding Progress</CardTitle>
          <CardDescription>Loading your progress...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
           <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Progress Found</AlertTitle>
                <AlertDescription>
                   No onboarding progress has been recorded for your account yet. Generate an onboarding guide to get started.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>
    );
  }

  const completedTasks = progress.tasks.filter(task => task.status === 'done').length;
  const totalTasks = progress.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>My Onboarding Progress for "{progress.project}"</CardTitle>
        <CardDescription>
          Last updated {formatDistanceToNow(progress.lastUpdated, { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
                    <span className="text-sm font-bold text-primary">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="space-y-2 pt-2">
                <h4 className="font-semibold">Task Checklist</h4>
                <ul className="space-y-2">
                {progress.tasks.map((task, index) => (
                    <li key={index} className="flex items-center gap-3">
                    {task.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className="text-sm">{task.title}</span>
                    </li>
                ))}
                </ul>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
