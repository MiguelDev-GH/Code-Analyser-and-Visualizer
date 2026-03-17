import { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  applyNodeChanges, 
  applyEdgeChanges 
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: 'center',
    position: { x: 250, y: 150 },
    data: { label: 'Verificação de token' },
    style: { 
      border: '2px solid black', 
      borderRadius: '4px', 
      padding: '16px', 
      background: '#fff', 
      fontWeight: 'bold',
      width: '200px',
      textAlign: 'center',
      boxShadow: '4px 4px 0px rgba(0,0,0,0.1)'
    }
  }
];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      
      <header className="h-14 border-b border-gray-200 flex items-center px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xl tracking-[0.3em] font-bold">:::</span>
          <h1 className="text-sm font-semibold text-gray-700">Código #1</h1>
        </div>
      </header>

      <div className="flex-grow relative bg-slate-50">
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background variant="dots" gap={20} size={1} color="#cbd5e1" />
          <Controls />
        </ReactFlow>
      </div>

      <footer className="h-72 border-t border-gray-300 bg-white shrink-0 flex flex-col">
        <div className="flex-grow flex">
          <section className="w-1/3 p-6 border-r border-gray-200">
            <h2 className="font-bold text-xl text-gray-800">Verificação de token</h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              (Descrição do bloco gerada pela IA, explicando a lógica de validação do JWT...)
            </p>
          </section>
          
          <section className="w-1/4 border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Functions
            </div>
            <div className="p-4 space-y-2 overflow-y-auto">
              <div className="text-sm font-mono p-2 bg-gray-50 rounded border border-gray-200">algumaFuncaoAqui()</div>
              <div className="text-sm font-mono p-2 bg-blue-50 border border-blue-200 rounded">outraFuncaoAqui()</div>
              <div className="text-sm font-mono p-2 bg-gray-50 rounded border border-gray-200 text-gray-400 italic">...</div>
            </div>
          </section>
          
          <section className="flex-grow flex flex-col bg-[#fafafa]">
            <div className="p-3 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              Code
            </div>
            <pre className="p-4 font-mono text-xs text-gray-700 overflow-auto leading-normal">
              {`outraFuncaoAqui() {\n  const response = await fetch("/api/dados");\n  const dados = await response.json();\n\n  // resto do código aqui...\n}`}
            </pre>
          </section>
        </div>

        <div className="h-10 border-t border-gray-100 bg-gray-50 flex items-center px-4 gap-6">
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
             <span>Recebimento de usuários</span>
             <span className="text-gray-300">→</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
             <span>Usuário acessado</span>
             <span className="text-gray-300">→</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase border-b-2 border-blue-500 text-blue-600 pb-1">
             <span>Se o token for inválido</span>
             <span className="text-blue-400">→</span>
           </div>
        </div>
      </footer>

    </div>
  );
}