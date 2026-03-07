'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
}

interface Props {
  rankedVideos: VideoItem[];
  unrankedVideos: VideoItem[];
  saveUrl?: string;
  castUrl: string;
  castRedirect: string;
  studentData?: { studentName: string; studentClass: string; code?: string };
  onCastSuccess?: () => void;
}

function SortableCard({
  video,
  rank,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isInTop10,
  isDraggingAny,
}: {
  video: VideoItem;
  rank: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isInTop10: boolean;
  isDraggingAny: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDraggingAny ? transition : 'transform 0.2s ease',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={`card vote-card ${isDragging ? 'shadow-lg' : ''} ${isInTop10 ? 'border-primary' : 'border-0 bg-light'}`}
      >
        <div className="card-body py-2 px-3 d-flex align-items-center gap-3">
          <span
            className={`badge ${isInTop10 ? 'bg-primary' : 'bg-secondary'} rank-badge`}
            style={{ fontSize: '0.85rem' }}
          >
            {rank}
          </span>

          <div
            {...attributes}
            {...listeners}
            className="d-flex align-items-center gap-2 flex-grow-1"
            style={{ cursor: isDragging ? 'grabbing' : 'grab', minWidth: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              width={60}
              height={34}
              style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
            <span className="text-truncate small fw-medium">{video.title}</span>
          </div>

          <div className="d-flex flex-column gap-1 ms-auto">
            <button
              className="btn btn-outline-secondary btn-sm py-0 px-1 lh-1"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Mută sus"
              style={{ fontSize: '0.7rem' }}
            >
              ▲
            </button>
            <button
              className="btn btn-outline-secondary btn-sm py-0 px-1 lh-1"
              onClick={onMoveDown}
              disabled={isLast}
              title="Mută jos"
              style={{ fontSize: '0.7rem' }}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VotingInterface({
  rankedVideos: initialRanked,
  unrankedVideos: initialUnranked,
  saveUrl,
  castUrl,
  castRedirect,
  studentData,
  onCastSuccess,
}: Props) {
  const router = useRouter();
  const [ranked, setRanked] = useState<VideoItem[]>(initialRanked);
  const [unranked] = useState<VideoItem[]>(initialUnranked);
  const [isDraggingAny, setIsDraggingAny] = useState(false);
  const [saving, setSaving] = useState(false);
  const [casting, setCasting] = useState(false);
  const [castError, setCastError] = useState('');
  const [castDone, setCastDone] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // All videos in order: ranked first, then unranked
  const allVideos = [...ranked, ...unranked];

  const scheduleSave = useCallback(
    (newRanked: VideoItem[]) => {
      if (!saveUrl) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await fetch(saveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ranking: newRanked.slice(0, 10).map((v) => v.id) }),
          });
        } finally {
          setSaving(false);
        }
      }, 500);
    },
    [saveUrl],
  );

  function handleDragStart(_event: DragStartEvent) {
    setIsDraggingAny(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDraggingAny(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = allVideos.findIndex((v) => v.id === active.id);
    const newIndex = allVideos.findIndex((v) => v.id === over.id);
    const newAll = arrayMove(allVideos, oldIndex, newIndex);
    const newRanked = newAll.slice(0, ranked.length > 0 ? Math.max(ranked.length, 10) : 10);

    setRanked(newRanked.slice(0, 10));
    scheduleSave(newRanked.slice(0, 10));
  }

  function moveItem(fromIndex: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= allVideos.length) return;
    const newAll = arrayMove(allVideos, fromIndex, toIndex);
    const newRanked = newAll.slice(0, 10);
    setRanked(newRanked);
    scheduleSave(newRanked);
  }

  async function handleCast() {
    if (ranked.length < 10) {
      setCastError('Clasamentul trebuie să conțină exact 10 videoclipuri.');
      return;
    }
    setCasting(true);
    setCastError('');
    try {
      const body: Record<string, unknown> = { ranking: ranked.slice(0, 10).map((v) => v.id) };
      if (studentData) {
        body.studentName = studentData.studentName;
        body.studentClass = studentData.studentClass;
        if (studentData.code) body.code = studentData.code;
      }
      const res = await fetch(castUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setCastError(data.error);
        return;
      }
      if (onCastSuccess) {
        onCastSuccess();
      } else {
        setCastDone(true);
        router.push(castRedirect);
      }
    } catch {
      setCastError('Eroare de rețea. Încearcă din nou.');
    } finally {
      setCasting(false);
    }
  }

  if (castDone) {
    return (
      <div className="text-center py-5">
        <div className="text-success mb-3" style={{ fontSize: '3rem' }}>
          ✓
        </div>
        <h3 className="h5">Votul a fost trimis!</h3>
      </div>
    );
  }

  const top10 = allVideos.slice(0, 10);
  const rest = allVideos.slice(10);

  return (
    <div>
      {castError && <div className="alert alert-danger">{castError}</div>}
      {saving && (
        <div className="text-muted small mb-2">
          <span className="spinner-border spinner-border-sm me-1" />
          Se salvează...
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allVideos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {top10.length > 0 && (
            <div className="mb-2">
              <p className="text-muted small fw-semibold text-uppercase mb-1">Top 10</p>
              {top10.map((video, index) => (
                <SortableCard
                  key={video.id}
                  video={video}
                  rank={index + 1}
                  onMoveUp={() => moveItem(index, 'up')}
                  onMoveDown={() => moveItem(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === allVideos.length - 1}
                  isInTop10={true}
                  isDraggingAny={isDraggingAny}
                />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-3">
              <p className="text-muted small fw-semibold text-uppercase mb-1">
                Restul videoclipurilor
              </p>
              {rest.map((video, index) => (
                <SortableCard
                  key={video.id}
                  video={video}
                  rank={10 + index + 1}
                  onMoveUp={() => moveItem(10 + index, 'up')}
                  onMoveDown={() => moveItem(10 + index, 'down')}
                  isFirst={10 + index === 0}
                  isLast={10 + index === allVideos.length - 1}
                  isInTop10={false}
                  isDraggingAny={isDraggingAny}
                />
              ))}
            </div>
          )}

          {allVideos.length === 0 && (
            <div className="alert alert-info">Nu există videoclipuri disponibile.</div>
          )}
        </SortableContext>
      </DndContext>

      {allVideos.length >= 10 && (
        <div className="mt-4">
          <button
            className="btn btn-success btn-lg"
            onClick={handleCast}
            disabled={casting || ranked.length < 10}
          >
            {casting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Se trimite...
              </>
            ) : (
              'Trimite votul'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
