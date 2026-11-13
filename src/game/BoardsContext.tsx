import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { no } from '../i18n/no';
import { loadBoards, saveBoards } from '../storage/boardStorage';
import type { Board } from '../types/game';
import { cloneBoardWithNewIds, createEmptyBoard } from './boardUtils';

interface BoardsContextValue {
  boards: Board[];
  getBoard: (id: string) => Board | undefined;
  saveBoard: (board: Board) => void;
  createBoard: () => Board;
  duplicateBoard: (id: string) => Board | undefined;
  deleteBoard: (id: string) => void;
  importBoards: (boards: Board[]) => void;
}

const BoardsContext = createContext<BoardsContextValue | null>(null);

export function BoardsProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<Board[]>(loadBoards);

  useEffect(() => {
    saveBoards(boards);
  }, [boards]);

  const getBoard = useCallback((id: string) => boards.find((b) => b.id === id), [boards]);

  const saveBoard = useCallback((board: Board) => {
    const updated = { ...board, updatedAt: new Date().toISOString() };
    setBoards((prev) =>
      prev.some((b) => b.id === board.id) ? prev.map((b) => (b.id === board.id ? updated : b)) : [...prev, updated],
    );
  }, []);

  const createBoard = useCallback(() => {
    const board = createEmptyBoard(no.admin.newBoardName);
    setBoards((prev) => [...prev, board]);
    return board;
  }, []);

  const duplicateBoard = useCallback(
    (id: string) => {
      const source = boards.find((b) => b.id === id);
      if (!source) return undefined;
      const copy = cloneBoardWithNewIds(source, `${source.name} ${no.admin.copySuffix}`);
      setBoards((prev) => [...prev, copy]);
      return copy;
    },
    [boards],
  );

  const deleteBoard = useCallback((id: string) => {
    setBoards((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const importBoards = useCallback((imported: Board[]) => {
    setBoards((prev) => [...prev, ...imported]);
  }, []);

  const value = useMemo(
    () => ({ boards, getBoard, saveBoard, createBoard, duplicateBoard, deleteBoard, importBoards }),
    [boards, getBoard, saveBoard, createBoard, duplicateBoard, deleteBoard, importBoards],
  );

  return <BoardsContext.Provider value={value}>{children}</BoardsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBoards(): BoardsContextValue {
  const ctx = useContext(BoardsContext);
  if (!ctx) throw new Error('useBoards must be used inside <BoardsProvider>');
  return ctx;
}
