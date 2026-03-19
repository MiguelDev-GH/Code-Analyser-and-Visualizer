import { useState, useCallback, useMemo } from 'react';
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
  const [language, setLanguage] = useState('english');
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  // --- Adicione este trecho DENTRO do seu componente App, antes de analisCodigo ---
  const { previousNodes, nextDirectNodes, nextExceptionNodes } = useMemo(() => {
    if (!selectedNode) return { previousNodes: [], nextDirectNodes: [], nextExceptionNodes: [] };

    // Encontra blocos anteriores (conexões chegando no bloco selecionado)
    const incomingEdges = edges.filter(edge => edge.target === selectedNode.id);
    const previousNodes = incomingEdges.map(edge => nodes.find(node => node.id === edge.source)).filter(Boolean);

    // Encontra blocos seguintes (conexões saindo do bloco selecionado)
    const outgoingEdges = edges.filter(edge => edge.source === selectedNode.id);
    const nextDirectNodes = [];
    const nextExceptionNodes = [];

    outgoingEdges.forEach(edge => {
      const targetNode = nodes.find(node => node.id === edge.target);
      if (!targetNode) return;

      // Verifica se a conexão é uma exceção ou direta baseada na cor do estilo
      const strokeColor = edge.style?.stroke || '';
      const isException = strokeColor === '#ef4444'; // Cor vermelha para exceções

      if (isException) {
        nextExceptionNodes.push(targetNode);
      } else {
        nextDirectNodes.push(targetNode);
      }
    });

    return { previousNodes, nextDirectNodes, nextExceptionNodes };
  }, [selectedNode, edges, nodes]);

  const analisarCodigo = async () => {
    if (!inputCode.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode, language })
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
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <header className="header">
        <div className="header-logo-area">
          <span className="logo-dots">:::</span>
          <h1 className="logo-text">Code #1</h1>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="english">English</option>
            <option value="portuguese">Portuguese</option>
            <option value="spanish">Spanish</option>
          </select>
        </div>
        <div className="header-actions">
          {loading && <span className="loading-text">Analyzing architecture with AI...</span>}
          <button className="settings-btn" onClick={() => setIsSettingsOpen(true)} title="Configurações">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
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
              <Background variant="dots" gap={20} size={1} color={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <Controls />
            </ReactFlow>
          </div>

          <footer className="dashboard">
            <div className="dashboard-content">
              <section className="info-section">
                <div className="description-container">
                  <h2 className="info-title">
                    {selectedNode ? selectedNode.data.label : 'Select a node'}
                  </h2>
                  <p className="info-desc">
                    {selectedNode ? selectedNode.data.description : 'Waiting for selection...'}
                  </p>
                </div>

                {selectedNode && (
                  <div className="connections-status-bar">
                    {/* Grupo 1: Anteriores (Chegando) */}
                    {previousNodes.length > 0 && (
                      <div className="status-category-block category-previous">
                        {previousNodes.map(node => (
                          <div key={node.id} className="status-item">
                            <span className="status-text">{node.data.label}</span>
                            <div className="status-icon status-icon-incoming">
                              {/* Ícone: Setinha da esquerda entrando em uma caixinha */}
                              <svg viewBox="0 0 16 16" width="16" height="16">
                                <path d="M 0 8 L 8 0 L 8 6 L 16 6 L 16 10 L 8 10 L 8 16 L 0 8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grupo 2: Exceção (Saindo por erro) */}
                    {nextExceptionNodes.length > 0 && (
                      <div className="status-category-block category-exception">
                        {nextExceptionNodes.map(node => (
                          <div key={node.id} className="status-item">
                            <span className="status-text">{node.data.label}</span>
                            <div className="status-icon status-icon-up">
                              {/* Ícone: Setinha para cima saindo de uma caixinha */}
                              <svg viewBox="0 0 16 16" width="16" height="16">
                                <path d="M 6 16 L 10 16 L 10 8 L 16 8 L 8 0 L 0 8 L 6 8 L 6 16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Grupo 3: Próximos (Saindo direto) */}
                    {nextDirectNodes.length > 0 && (
                      <div className="status-category-block category-next">
                        {nextDirectNodes.map(node => (
                          <div key={node.id} className="status-item">
                            <span className="status-text">{node.data.label}</span>
                            <div className="status-icon status-icon-direct">
                              {/* Ícone: Setinha para direita saindo de uma caixinha */}
                              <svg viewBox="0 0 16 16" width="16" height="16">
                                <path d="M 0 6 L 8 6 L 8 0 L 16 8 L 8 16 L 8 10 L 0 10 L 0 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
      {isSettingsOpen && (
        <div className="settings-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2 className="info-title">Configurações</h2>
              <button className="close-settings" onClick={() => setIsSettingsOpen(false)}>&times;</button>
            </div>
            <div className="settings-content">
              <div className="setting-item">
                <span className="setting-label">Tema</span>
                <div className="theme-toggle-group">
                  <div 
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    <span>Claro</span>
                  </div>
                  <div 
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    <span>Escuro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}