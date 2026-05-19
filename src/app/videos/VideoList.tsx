'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface Video {
  id: string;
  title: string;
  school: string;
  locality: string;
  thumbnailUrl: string;
  youtubeUrl: string;
  category: string;
}

interface Props {
  videos: Video[];
  categories: string[];
}

export default function VideoList({ videos, categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const setCategory = useCallback(
    (category: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (category) {
        params.set('category', category);
      } else {
        params.delete('category');
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const filtered = activeCategory
    ? videos.filter((v) => v.category === activeCategory)
    : videos;

  return (
    <>
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link${activeCategory === null ? ' active' : ''}`}
            onClick={() => setCategory(null)}
          >
            Toate
          </button>
        </li>
        {categories.map((cat) => (
          <li key={cat} className="nav-item">
            <button
              className={`nav-link${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          </li>
        ))}
      </ul>

      <div className="list-group">
        {filtered.map((video) => (
          <div key={video.id} className="list-group-item d-flex align-items-center gap-3 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              width={80}
              height={45}
              style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
            />
            <div className="flex-grow-1">
              <div className="fw-medium">{video.title}</div>
              <div className="text-muted small">{video.school}, {video.locality}</div>
            </div>
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-danger flex-shrink-0"
            >
              ▶ YouTube
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
