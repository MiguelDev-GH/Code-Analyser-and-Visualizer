import { useMemo } from 'react';

export function useNodeConnections(selectedNode, nodes, edges) {
  return useMemo(() => {
    if (!selectedNode) return { previousNodes: [], nextDirectNodes: [], nextExceptionNodes: [] };

    const previousNodes = edges
      .filter(e => e.target === selectedNode.id)
      .map(e => nodes.find(n => n.id === e.source))
      .filter(Boolean);

    const nextDirectNodes = [];
    const nextExceptionNodes = [];

    edges
      .filter(e => e.source === selectedNode.id)
      .forEach(e => {
        const target = nodes.find(n => n.id === e.target);
        if (!target) return;
        (e.style?.stroke === '#ef4444' ? nextExceptionNodes : nextDirectNodes).push(target);
      });

    return { previousNodes, nextDirectNodes, nextExceptionNodes };
  }, [selectedNode, nodes, edges]);
}
