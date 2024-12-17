import React, { useState } from 'react';
import { ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';

interface TreeNode {
  id: string;
  title: string;
  children?: TreeNode[];
  level: number;
}

interface DocumentSidebarProps {
  chapters: TreeNode[];
  onSelectNode?: (node: TreeNode) => void;
}

const TreeItem: React.FC<{ node: TreeNode; onSelect?: (node: TreeNode) => void }> = ({ node, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="w-full">
      <div
        className={`flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm
          ${node.level === 0 ? 'font-semibold' : ''}`}
        style={{ paddingLeft: `${node.level * 12}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onSelect?.(node);
        }}
      >
        {hasChildren && (
          <span className="mr-1">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        <span className="truncate">{node.title}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="w-full">
          {node.children?.map((child) => (
            <TreeItem key={child.id} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function DocumentSidebar({ chapters, onSelectNode }: DocumentSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 h-full
      ${isOpen ? 'w-64' : 'w-8'}`}>
      <div className="h-full flex flex-col">
        <div
          className="h-8 flex items-center justify-center border-b border-gray-200 cursor-pointer hover:bg-gray-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </div>
        {isOpen && (
          <div className="flex-1 overflow-y-auto">
            {chapters.map((chapter) => (
              <TreeItem key={chapter.id} node={chapter} onSelect={onSelectNode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
