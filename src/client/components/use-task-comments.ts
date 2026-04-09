'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getErrorMessage } from '@/lib/errors';
import type { Comment } from '@/types';

const COMMENT_AUTHOR_STORAGE_KEY = 'trekker-comment-author';

async function readComments(taskId: string): Promise<Comment[]> {
  const response = await fetch(`/api/tasks/${taskId}/comments`);
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

export function useTaskComments(taskId: string) {
  const [author, setAuthor] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedAuthor = localStorage.getItem(COMMENT_AUTHOR_STORAGE_KEY);
    if (savedAuthor) {
      setAuthor(savedAuthor);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoading(true);

      try {
        const nextComments = await readComments(taskId);
        if (!cancelled) {
          setComments(nextComments);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadComments();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  async function submitComment() {
    if (!author.trim() || !content.trim()) {
      toast.error('Author and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      localStorage.setItem(COMMENT_AUTHOR_STORAGE_KEY, author);

      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to add comment');
      }

      const nextComment = await response.json();
      setComments((current) => [...current, nextComment]);
      setContent('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add comment'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments((current) => current.filter((comment) => comment.id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  }

  return {
    author,
    comments,
    content,
    deleteComment,
    isSubmitting,
    loading,
    setAuthor,
    setContent,
    submitComment,
  };
}
