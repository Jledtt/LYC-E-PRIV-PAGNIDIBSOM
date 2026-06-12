"use client";

import { useState, useTransition } from "react";
import { deleteArticle } from "./actions";

interface DeleteArticleButtonProps {
  id: string;
  title: string;
}

export default function DeleteArticleButton({ id, title }: DeleteArticleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(`Supprimer définitivement l'article « ${title} » ?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(id);
      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="px-3 py-1.5 rounded text-sm font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        Supprimer
      </button>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
