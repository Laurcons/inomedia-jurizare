'use client';

import { CSSProperties, useState, useCallback, useRef } from 'react';
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

interface ButtonMove {
  movedId: string;
  displacedId: string;
  direction: 'up' | 'down';
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
  buttonMove,
}: {
  video: VideoItem;
  rank: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isInTop10: boolean;
  buttonMove: ButtonMove | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.id,
  });

  // Compute button-press animation — applied via CSS keyframes so it doesn't
  // conflict with dnd-kit's own transition.
  let animStyle: CSSProperties = {};
  if (buttonMove) {
    if (buttonMove.movedId === video.id) {
      animStyle.animation =
        buttonMove.direction === 'up'
          ? 'slideFromBelow 0.22s ease'
          : 'slideFromAbove 0.22s ease';
    } else if (buttonMove.displacedId === video.id) {
      animStyle.animation =
        buttonMove.direction === 'up'
          ? 'slideFromAbove 0.22s ease'
          : 'slideFromBelow 0.22s ease';
    }
  }

  // Use dnd-kit's transition directly — overriding it is what causes the
  // "jerk on the topmost item" bug.
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
    ...animStyle,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <div
        className={`card vote-card overflow-hidden ${isDragging ? 'shadow-lg' : ''} ${isInTop10 ? 'border-primary' : 'border-0 bg-light'}`}
      >
        <div className="card-body p-0 d-flex align-items-stretch">
          {/* Drag handle — covers rank + thumbnail + title */}
          <div
            {...attributes}
            {...listeners}
            className="d-flex align-items-center gap-2 flex-grow-1 px-3 py-2"
            style={{ cursor: isDragging ? 'grabbing' : 'grab', minWidth: 0 }}
          >
            <span
              className={`badge flex-shrink-0 ${isInTop10 ? 'bg-primary' : 'bg-secondary'}`}
              style={{ minWidth: '1.6rem', textAlign: 'center', fontSize: '0.85rem' }}
            >
              {rank}
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              width={60}
              height={34}
              style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
            <span className="small fw-medium" style={{ wordBreak: 'break-word' }}>
              {video.title}
            </span>
          </div>

          {/* Full-height side-by-side move buttons */}
          <div className="d-flex border-start flex-shrink-0">
            <button
              className="btn btn-outline-secondary border-0 border-end rounded-0 px-3"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Mută sus"
            >
              ▲
            </button>
            <button
              className="btn btn-outline-secondary border-0 rounded-0 px-3"
              onClick={onMoveDown}
              disabled={isLast}
              title="Mută jos"
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
  const [allVideos, setAllVideos] = useState<VideoItem[]>([...initialRanked, ...initialUnranked]);
  const [, setIsDraggingAny] = useState(false);
  const [saving, setSaving] = useState(false);
  const [casting, setCasting] = useState(false);
  const [castError, setCastError] = useState('');
  const [castDone, setCastDone] = useState(false);
  const [buttonMove, setButtonMove] = useState<ButtonMove | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const scheduleSave = useCallback(
    (videos: VideoItem[]) => {
      if (!saveUrl) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          await fetch(saveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ranking: videos.slice(0, 10).map((v) => v.id) }),
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
    setAllVideos(newAll);
    scheduleSave(newAll);
  }

  function moveItem(fromIndex: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= allVideos.length) return;

    const movedId = allVideos[fromIndex].id;
    const displacedId = allVideos[toIndex].id;
    const newAll = arrayMove(allVideos, fromIndex, toIndex);

    if (moveTimer.current) clearTimeout(moveTimer.current);
    setButtonMove({ movedId, displacedId, direction });
    moveTimer.current = setTimeout(() => setButtonMove(null), 300);

    setAllVideos(newAll);
    scheduleSave(newAll);
  }

  async function handleCast() {
    setCasting(true);
    setCastError('');
    try {
      const body: Record<string, unknown> = { ranking: allVideos.slice(0, 10).map((v) => v.id) };
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

  if (allVideos.length === 0) {
    return <div className="alert alert-info">Nu există videoclipuri disponibile.</div>;
  }

  // Build the flat list, injecting the section divider between index 9 and 10
  const items = allVideos.flatMap((video, index) => {
    const card = (
      <SortableCard
        key={video.id}
        video={video}
        rank={index + 1}
        onMoveUp={() => moveItem(index, 'up')}
        onMoveDown={() => moveItem(index, 'down')}
        isFirst={index === 0}
        isLast={index === allVideos.length - 1}
        isInTop10={index < 10}
        buttonMove={buttonMove}
      />
    );
    if (index === 10) {
      return [
        <div key="rest-divider" className="mt-3 mb-2">
          <p className="text-muted small fw-semibold text-uppercase mb-0">
            Restul videoclipurilor
          </p>
        </div>,
        card,
      ];
    }
    return [card];
  });

  return (
    <div>
      {castError && <div className="alert alert-danger">{castError}</div>}

      {/* Section label with inline save indicator — reserved space prevents layout shift */}
      <div className="d-flex align-items-center gap-2 mb-2">
        <p className="text-muted small fw-semibold text-uppercase mb-0">Top 10</p>
        <span
          className="spinner-border spinner-border-sm text-muted"
          style={{
            opacity: saving ? 1 : 0,
            transition: 'opacity 0.15s',
            width: '0.8rem',
            height: '0.8rem',
          }}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allVideos.map((v) => v.id)} strategy={verticalListSortingStrategy}>
          {items}
        </SortableContext>
      </DndContext>

      {allVideos.length >= 10 && (
        <div className="mt-4">
          <button className="btn btn-success btn-lg" onClick={handleCast} disabled={casting}>
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
