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

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    
    node.position = {
      x: nodeWithPosition.x - 125,
      y: nodeWithPosition.y - 50,
    };
    
    return node;
  });

  return { nodes, edges };
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
      alert('Erro ao analisar o código. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <header className="h-14 border-b border-gray-200 flex items-center px-6 shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xl tracking-[0.3em] font-bold">:::</span>
          <h1 className="text-sm font-semibold text-gray-700">Código #1</h1>
        </div>
        {loading && <span className="text-sm font-bold text-blue-500 animate-pulse">Analisando arquitetura com IA...</span>}
      </header>

      <div className="flex-grow flex overflow-hidden">
        
        <aside className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col p-4 shrink-0 shadow-sm z-10">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Cole seu código aqui
          </label>
          <textarea 
            className="flex-grow w-full border border-gray-300 rounded p-3 text-sm font-mono resize-none focus:outline-none focus:border-blue-500 shadow-inner"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="function start() { }"
          />
          <button 
            onClick={analisarCodigo}
            disabled={loading || !inputCode.trim()}
            className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow"
          >
            {loading ? 'Processando...' : 'Analisar Arquitetura'}
          </button>
        </aside>

        <main className="flex-grow flex flex-col relative bg-slate-50">
          <div className="flex-grow relative">
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

          <footer className="h-72 border-t border-gray-300 bg-white shrink-0 flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex-grow flex">
              <section className="w-1/3 p-6 border-r border-gray-200">
                <h2 className="font-bold text-xl text-gray-800">
                  {selectedNode ? selectedNode.data.label : 'Selecione um bloco'}
                </h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                  {selectedNode ? selectedNode.data.description : 'Aguardando seleção...'}
                </p>
              </section>
              
              <section className="w-1/4 border-r border-gray-200 flex flex-col">
                <div className="p-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Functions
                </div>
                <div className="p-4 space-y-2 overflow-y-auto">
                  {selectedNode && selectedNode.data.functions ? (
                    selectedNode.data.functions.map((fn, index) => (
                      <div key={index} className="text-sm font-mono p-2 bg-gray-50 rounded border border-gray-200">
                        {fn}
                      </div>
                    ))
                  ) : (
                        <div className="text-sm text-gray-400 italic">Nenhuma função detectada</div>
                  )}
                </div>
              </section>
              
              <section className="flex-grow flex flex-col bg-[#fafafa]">
                <div className="p-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Code
                </div>
                <pre className="p-4 font-mono text-xs text-gray-700 overflow-auto leading-normal">
                  {selectedNode ? selectedNode.data.code : ''}
                </pre>
              </section>
            </div>

            <div className="h-10 border-t border-gray-100 bg-gray-50 flex items-center px-4 gap-6">
               <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                 <span>Status</span>
                 <span className="text-gray-300">→</span>
                 <span className="text-blue-500">{selectedNode ? 'Bloco Ativo' : 'Aguardando'}</span>
               </div>
            </div>
          </footer>
        </main>

      </div>
    </div>
  );
}