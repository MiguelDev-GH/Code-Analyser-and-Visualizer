import { useState, useRef, useEffect, useCallback } from 'react';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { getLayoutedElements } from '../lib/layout';

export function useGraphState() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [layoutDirection, setLayoutDirection] = useState('LR');
  const [showNodeDescriptions, setShowNodeDescriptions] = useState(false);

  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  // Re-layout only when showNodeDescriptions toggles.
  // layoutDirection changes are handled directly in changeLayoutDirection.
  useEffect(() => {
    if (nodesRef.current.length === 0) return;
    const { nodes: ln, edges: le } = getLayoutedElements(
      nodesRef.current.map(n => ({ ...n })),
      edgesRef.current,
      layoutDirection,
      showNodeDescriptions,
    );
    setNodes(ln);
    setEdges([...le]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNodeDescriptions]);

  const applyLayout = (dir, descVisible) => {
    if (nodesRef.current.length === 0) return;
    const { nodes: ln, edges: le } = getLayoutedElements(
      nodesRef.current.map(n => ({ ...n })),
      edgesRef.current,
      dir,
      descVisible,
    );
    setNodes(ln);
    setEdges([...le]);
  };

  const changeLayoutDirection = (dir) => {
    setLayoutDirection(dir);
    applyLayout(dir, showNodeDescriptions);
  };

  const handleAutoFormat = () => applyLayout(layoutDirection, showNodeDescriptions);

  const onNodesChange = useCallback(
    (changes) => setNodes(nds => applyNodeChanges(changes, nds)), [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges(eds => applyEdgeChanges(changes, eds)), [],
  );

  return {
    nodes, setNodes,
    edges, setEdges,
    layoutDirection, changeLayoutDirection,
    showNodeDescriptions, setShowNodeDescriptions,
    handleAutoFormat,
    onNodesChange, onEdgesChange,
  };
}
