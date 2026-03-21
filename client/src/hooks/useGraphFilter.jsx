import { useMemo } from 'react';

export function useGraphFilter(nodes, edges, { isExceptionFilterActive, edgeType, edgeWidth, showNodeDescriptions }) {
  return useMemo(() => {
    let validNodeIds = new Set();

    if (isExceptionFilterActive) {
      const inDegree = new Map(nodes.map(n => [n.id, 0]));
      edges.forEach(e => inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1));

      const queue = nodes.filter(n => inDegree.get(n.id) === 0).map(n => n.id);
      if (queue.length === 0 && nodes.length > 0) queue.push(nodes[0].id);

      while (queue.length > 0) {
        const id = queue.shift();
        if (validNodeIds.has(id)) continue;
        validNodeIds.add(id);
        edges
          .filter(e => e.source === id && e.style?.stroke !== '#ef4444')
          .forEach(e => queue.push(e.target));
      }
    }

    const filteredNodes = nodes.map(n => {
      const opacity = isExceptionFilterActive && !validNodeIds.has(n.id) ? 0.25 : 1;
      const textLabel = n.data.rawLabel || n.data.label;
      const label = (
        <div style={{ padding: '0px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>{textLabel}</div>
          {showNodeDescriptions && n.data.description && (
            <div style={{ fontSize: '0.65em', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.25', fontWeight: '500' }}>
              {n.data.description}
            </div>
          )}
        </div>
      );
      return {
        ...n,
        data: { ...n.data, rawLabel: textLabel, label },
        style: { ...n.style, opacity, transition: 'opacity 0.3s' },
      };
    });

    const filteredEdges = edges.map(e => {
      const reduced = isExceptionFilterActive && (
        e.style?.stroke === '#ef4444' || !validNodeIds.has(e.source) || !validNodeIds.has(e.target)
      );
      const opacity = reduced ? 0.15 : 1;
      return {
        ...e,
        type: edgeType,
        style: { ...e.style, strokeWidth: edgeWidth, opacity, transition: 'opacity 0.3s' },
        labelStyle: { ...e.labelStyle, opacity, transition: 'opacity 0.3s' },
        labelBgStyle: { ...e.labelBgStyle, opacity, transition: 'opacity 0.3s' },
      };
    });

    return { filteredNodes, filteredEdges };
  }, [nodes, edges, isExceptionFilterActive, edgeType, edgeWidth, showNodeDescriptions]);
}
