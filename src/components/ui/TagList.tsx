import React from 'react';

interface TagListProps {
  tags?: string[];
  maxTags?: number;
}

export default function TagList({ tags = [], maxTags = 3 }: TagListProps) {
  const tagsToShow = tags.slice(0, maxTags);
  const showEllipsis = tags.length > maxTags;

  return (
    <div className="flex gap-2 mb-4 overflow-hidden whitespace-nowrap">
      {tagsToShow.map((tag, idx) => (
        <span
          key={`tag-${tag}-${idx}`}
          className="px-3 py-1 text-xs lg:text-sm bg-white border border-gray-200 text-gray-600 rounded-[8px] max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {tag}
        </span>
      ))}
      {showEllipsis && (
        <span className="px-3 py-1 text-xs lg:text-sm bg-white border border-gray-200 text-gray-600 rounded-[8px]">
          ...
        </span>
      )}
    </div>
  );
}