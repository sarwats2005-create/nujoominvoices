import { useMemo } from 'react';
import type { ArchiveFolder, UsedBL } from '@/types/usedBL';

export interface FolderNode extends ArchiveFolder {
  children: FolderNode[];
  directCount: number;
  totalCount: number;
  directTotals: Record<string, number>;
  totals: Record<string, number>;
}

const addTotals = (a: Record<string, number>, b: Record<string, number>): Record<string, number> => {
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] || 0) + v;
  return out;
};

export const useArchiveFolderTree = (folders: ArchiveFolder[], archivedRecords: UsedBL[]) => {
  return useMemo(() => {
    const byParent = new Map<string | null, ArchiveFolder[]>();
    folders.forEach(f => {
      const key = f.parent_id ?? null;
      const arr = byParent.get(key) || [];
      arr.push(f);
      byParent.set(key, arr);
    });

    const recsByFolder = new Map<string | null, UsedBL[]>();
    archivedRecords.forEach(r => {
      const key = r.archive_folder_id ?? null;
      const arr = recsByFolder.get(key) || [];
      arr.push(r);
      recsByFolder.set(key, arr);
    });

    const build = (parentId: string | null): FolderNode[] => {
      const list = byParent.get(parentId) || [];
      return list.map(f => {
        const children = build(f.id);
        const directRecs = recsByFolder.get(f.id) || [];
        const directTotals: Record<string, number> = {};
        directRecs.forEach(r => {
          const c = (r as any).currency || 'USD';
          directTotals[c] = (directTotals[c] || 0) + r.invoice_amount;
        });
        const totalCount = directRecs.length + children.reduce((s, c) => s + c.totalCount, 0);
        const totals = children.reduce((acc, c) => addTotals(acc, c.totals), directTotals);
        return {
          ...f,
          children,
          directCount: directRecs.length,
          totalCount,
          directTotals,
          totals,
        };
      });
    };

    const roots = build(null);
    const unfiledCount = (recsByFolder.get(null) || []).length;
    const unfiledTotals: Record<string, number> = {};
    (recsByFolder.get(null) || []).forEach(r => {
      const c = (r as any).currency || 'USD';
      unfiledTotals[c] = (unfiledTotals[c] || 0) + r.invoice_amount;
    });

    const flatById = new Map<string, FolderNode>();
    const walk = (nodes: FolderNode[]) => {
      nodes.forEach(n => { flatById.set(n.id, n); walk(n.children); });
    };
    walk(roots);

    const getRecordsInFolder = (folderId: string | null): UsedBL[] => recsByFolder.get(folderId) || [];

    const getPath = (folderId: string | null): FolderNode[] => {
      if (!folderId) return [];
      const path: FolderNode[] = [];
      let cur = flatById.get(folderId);
      while (cur) {
        path.unshift(cur);
        cur = cur.parent_id ? flatById.get(cur.parent_id) : undefined;
      }
      return path;
    };

    return { roots, flatById, unfiledCount, unfiledTotals, getRecordsInFolder, getPath };
  }, [folders, archivedRecords]);
};
