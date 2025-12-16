import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Award, BookOpen, Edit2, Trash2, Save, X } from 'lucide-react';
import type { JournalEntry } from '@/types';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onUpdate: (_id: string, _updates: Partial<JournalEntry>) => void;
  onDelete: (_id: string) => void;
}

export function JournalEntryCard({ entry, onUpdate, onDelete }: JournalEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(entry.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getEntryIcon = (type: 'milestone' | 'learning') => {
    return type === 'milestone' ? (
      <Award className="h-4 w-4 text-yellow-500" />
    ) : (
      <BookOpen className="h-4 w-4 text-blue-500" />
    );
  };

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== entry.content) {
      onUpdate(entry.id, { content: editedContent.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(entry.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(entry.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getEntryIcon(entry.type)}
              {entry.title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={entry.type === 'milestone' ? 'default' : 'secondary'}>
                {entry.type === 'milestone' ? 'Milestone' : 'Learning'}
              </Badge>
              {!isEditing && (
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="min-h-[44px] min-w-[44px]"
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit journal entry"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
                    onClick={() => setShowDeleteDialog(true)}
                    aria-label="Delete journal entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <CardDescription className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}• Trust
            Level: {entry.trustLevel}
            {entry.isEdited && <span className="ml-1 text-xs italic">(edited)</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[100px] resize-none"
                placeholder="Write your reflection..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={handleCancel} className="min-h-[44px]">
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!editedContent.trim() || editedContent === entry.content}
                  className="min-h-[44px]"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <blockquote className="text-foreground border-l-4 border-purple-400 pl-4 italic">
              &ldquo;{entry.content}&rdquo;
            </blockquote>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {entry.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="min-h-[44px]">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
