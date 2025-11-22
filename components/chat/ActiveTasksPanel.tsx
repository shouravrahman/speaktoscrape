
import { TrendingUp, Clock, FileText, CheckCircle2, XCircle, Play, Pause, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TaskStatus {
   id: string;
   status: 'pending' | 'running' | 'completed' | 'failed';
   progress?: number;
   result?: any;
   estimatedDuration?: number;
   complexity?: string;
}

interface ActiveTasksPanelProps {
   tasks: TaskStatus[];
   onDownload: (taskId: string, format: string) => void;
}

const getStatusIcon = (status: string) => {
   switch (status) {
      case 'completed':
         return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
         return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
         return <Play className="w-4 h-4 text-blue-500" />;
      default:
         return <Pause className="w-4 h-4 text-yellow-500" />;
   }
};

const getStatusColor = (status: string) => {
   switch (status) {
      case 'completed':
         return 'border-green-500/20 bg-green-500/5 text-green-700';
      case 'failed':
         return 'border-red-500/20 bg-red-500/5 text-red-700';
      case 'running':
         return 'border-blue-500/20 bg-blue-500/5 text-blue-700';
      default:
         return 'border-yellow-500/20 bg-yellow-500/5 text-yellow-700';
   }
};

export function ActiveTasksPanel({ tasks, onDownload }: ActiveTasksPanelProps) {
   if (tasks.length === 0) return null;

   return (
      <div className="shrink-0 p-4 border-b border-border/40 bg-muted/30">
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <TrendingUp className="w-4 h-4 text-primary" />
               <h3 className="text-sm font-semibold text-foreground">
                  Active Tasks
               </h3>
               <Badge variant="secondary" className="text-xs">
                  {tasks.length}
               </Badge>
            </div>
         </div>

         <div className="space-y-3">
            {tasks.map((task) => (
               <div
                  key={task.id}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${getStatusColor(task.status)}`}
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">
                                 {task.status}
                              </span>
                              {task.status === 'running' && (
                                 <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                                 </div>
                              )}
                           </div>
                           <div className="flex items-center gap-3 mt-1">
                              {task.complexity && (
                                 <div className="flex items-center gap-1">
                                    <FileText className="w-3 h-3 opacity-60" />
                                    <span className="text-xs opacity-80 capitalize">
                                       {task.complexity}
                                    </span>
                                 </div>
                              )}
                              {task.estimatedDuration && (
                                 <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 opacity-60" />
                                    <span className="text-xs opacity-80">
                                       ~{task.estimatedDuration} min
                                    </span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        {task.status === 'completed' && (
                           <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDownload(task.id, 'json')}
                              className="h-8 px-3 text-xs hover:bg-current/10"
                           >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                           </Button>
                        )}
                        <span className="text-xs font-mono opacity-60">
                           #{task.id.slice(-6)}
                        </span>
                     </div>
                  </div>

                  {task.progress !== undefined && (
                     <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                           <span>Progress</span>
                           <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-current/20 rounded-full h-1.5">
                           <div
                              className="bg-current h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${task.progress}%` }}
                           />
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>
      </div>
   );
}
