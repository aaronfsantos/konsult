'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowUpDown,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  Filter,
} from 'lucide-react';
import { UserProgress as UserProgressData } from '@/models/user-progress';
import { EmployeeProgress } from '@/models/employee-progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type SortKey = keyof EmployeeProgress | '';
type SortDirection = 'asc' | 'desc';

export default function ManagerDashboard() {
  const [employees, setEmployees] = useState<EmployeeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const progressCollectionRef = collection(db, 'user_progress');

    const unsubscribe = onSnapshot(
      progressCollectionRef,
      (querySnapshot) => {
        const fetchedEmployees: EmployeeProgress[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserProgressData;
          const totalTasks = data.tasks.length;
          const completedTasks = data.tasks.filter(
            (task) => task.status === 'done'
          ).length;
          const progress =
            totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          const status = progress >= 70 ? 'On track' : 'At risk';

          fetchedEmployees.push({
            id: doc.id,
            name: data.name,
            project: data.project,
            progress: Math.round(progress),
            status: status,
          });
        });
        setEmployees(fetchedEmployees);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching user progress:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const uniqueProjects = useMemo(() => {
    const projects = new Set(employees.map((emp) => emp.project));
    return ['all', ...Array.from(projects)];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let filtered =
      projectFilter === 'all'
        ? employees
        : employees.filter((emp) => emp.project === projectFilter);

    if (sortKey) {
      filtered.sort((a, b) => {
        const aValue = a[sortKey as keyof EmployeeProgress];
        const bValue = b[sortKey as keyof EmployeeProgress];

        if (aValue === undefined || bValue === undefined) return 0;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [employees, projectFilter, sortKey, sortDirection]);

  const summary = useMemo(() => {
    const totalEmployees = employees.length;
    const atRiskCount = employees.filter(
      (emp) => emp.status === 'At risk'
    ).length;
    const totalProgress = employees.reduce((acc, emp) => acc + emp.progress, 0);
    const averageProgress =
      totalEmployees > 0 ? Math.round(totalProgress / totalEmployees) : 0;

    return { totalEmployees, atRiskCount, averageProgress };
  }, [employees]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="size-4 text-muted-foreground" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpDown className="size-4" />
    ) : (
      <ArrowUpDown className="size-4" />
    );
  };
  
  if (loading) {
    return (
      <div className="flex h-[calc(100dvh-2rem)] w-full items-center justify-center p-6">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Manager Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of employee onboarding progress.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              Currently in onboarding
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all employees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.atRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Employees with &lt;70% progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Progress Details</CardTitle>
          <div className="flex items-center gap-2 pt-2">
             <Filter className="h-4 w-4 text-muted-foreground"/>
             <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                    {uniqueProjects.map(project => (
                        <SelectItem key={project} value={project}>
                            {project === 'all' ? 'All Projects' : project}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('name')}>
                      Employee
                      {getSortIcon('name')}
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('project')}>
                        Project
                        {getSortIcon('project')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[200px]">
                    <Button variant="ghost" onClick={() => handleSort('progress')}>
                        Progress
                        {getSortIcon('progress')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('status')}>
                        Status
                        {getSortIcon('status')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell>{employee.project}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Progress value={employee.progress} className="h-2 w-full" />
                           <span className="text-sm font-medium">{employee.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === 'On track'
                              ? 'default'
                              : 'destructive'
                          }
                          className={cn(
                            employee.status === 'On track' &&
                              'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          )}
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
