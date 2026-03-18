import { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import './App.css';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // Usamos larguras fixas baseadas no seu design original
    dagreGraph.setNode(node.id, { width: 200, height: 80 }); 
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    
    node.position = {
      x: nodeWithPosition.x - 100, // Ajuste baseado na metade da largura (200/2)
      y: nodeWithPosition.y - 40,  // Ajuste baseado na metade da altura (80/2)
    };
    
    return node;
  });

  const layoutedEdges = edges.map((edge) => edge);

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const initialNodes = [];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
  };

  const analisarCodigo = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode })
      });

      const data = await response.json();
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        data.nodes || [],
        data.edges || []
      );
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      
      if (layoutedNodes && layoutedNodes.length > 0) {
        setSelectedNode(layoutedNodes[0]);
      }
    } catch (error) {
      console.error('Error analyzing the code:', error);
      alert('Error analyzing the code. Verify that the backend is running. Detailed error in console.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo-area">
          <span className="logo-dots">:::</span>
          <h1 className="logo-text">Code #1</h1>
        </div>
        {loading && <span className="loading-text">Analyzing architecture with AI...</span>}
      </header>

      <div className="main-wrapper">
        
        <aside className="sidebar">
          <label className="sidebar-label">
            Paste your code here
          </label>
          <textarea 
            className="sidebar-textarea"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="function start() { }"
          />
          <button 
            onClick={analisarCodigo}
            disabled={loading || !inputCode.trim()}
            className="analyze-btn"
          >
            {loading ? 'Processing...' : 'Analyze Architecture'}
          </button>
        </aside>

        <main className="map-area">
          <div className="reactflow-wrapper">
            <ReactFlow 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
            >
              <Background variant="dots" gap={20} size={1} color="#292b2d" />
              <Controls />
            </ReactFlow>
          </div>

          <footer className="dashboard">
            <div className="dashboard-content">
              <section className="info-section">
                <h2 className="info-title">
                  {selectedNode ? selectedNode.data.label : 'Select a node'}
                </h2>
                <p className="info-desc">
                  {selectedNode ? selectedNode.data.description : 'Waiting for selection...'}
                </p>
              </section>
              
              <section className="functions-section">
                <div className="section-title">
                  Functions
                </div>
                <div className="functions-list">
                  {selectedNode && selectedNode.data.functions ? (
                    selectedNode.data.functions.map((fn, index) => (
                      <div key={index} className="function-item">
                        {fn}
                      </div>
                    ))
                  ) : (
                        <div className="function-empty">No functions detected</div>
                  )}
                </div>
              </section>
              
              <section className="code-section">
                <div className="section-title">
                  Code
                </div>
                <pre className="code-block">
                  {selectedNode ? selectedNode.data.code : ''}
                </pre>
              </section>
            </div>

            <div className="status-bar">
               <div className="status-item">
                 <span>Status</span>
                 <span className="status-arrow">→</span>
                 <span className="status-active">{selectedNode ? 'Active Node' : 'Waiting'}</span>
               </div>
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
}