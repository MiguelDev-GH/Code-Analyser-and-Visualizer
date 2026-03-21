import { useState, useRef } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import 'prismjs/themes/prism-tomorrow.css';
import './App.css';

import InputScreen from './InputScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SettingsPanel from './components/SettingsPanel';

import { useGraphState } from './hooks/useGraphState';
import { useAnalyze } from './hooks/useAnalyze';
import { useCodeHighlight } from './hooks/useCodeHighlight';
import { useNodeConnections } from './hooks/useNodeConnections';
import { useGraphFilter } from './hooks/useGraphFilter.jsx';

export default function App() {
  const textareaRef = useRef(null);
  const [inputCode, setInputCode] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [language, setLanguage] = useState('english');
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExceptionFilterActive, setIsExceptionFilterActive] = useState(false);
  const [edgeType, setEdgeType] = useState('default');
  const [edgeWidth, setEdgeWidth] = useState(2);

  const {
    nodes, setNodes, edges, setEdges,
    layoutDirection, changeLayoutDirection,
    showNodeDescriptions, setShowNodeDescriptions,
    handleAutoFormat, onNodesChange, onEdgesChange,
  } = useGraphState();

  const { loading, detectedLanguage, lineCount, codeTitle, isAnalyzed, analyze } = useAnalyze({
    inputCode, language, layoutDirection, showNodeDescriptions,
  });

  const highlightLines = useCodeHighlight(selectedNode, inputCode, textareaRef);
  const { previousNodes, nextDirectNodes, nextExceptionNodes } = useNodeConnections(selectedNode, nodes, edges);
  const { filteredNodes, filteredEdges } = useGraphFilter(nodes, edges, {
    isExceptionFilterActive, edgeType, edgeWidth, showNodeDescriptions,
  });

  const handleAnalyze = () => analyze((ln, le) => {
    setNodes(ln);
    setEdges(le);
    if (ln.length > 0) setSelectedNode(ln[0]);
  });

  if (!isAnalyzed) {
    return (
      <div className="app-container dark-theme">
        <InputScreen inputCode={inputCode} setInputCode={setInputCode} onAnalyze={handleAnalyze} loading={loading} />
      </div>
    );
  }

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <Header
        codeTitle={codeTitle} language={language} setLanguage={setLanguage}
        detectedLanguage={detectedLanguage} lineCount={lineCount} loading={loading}
        handleAutoFormat={handleAutoFormat} layoutDirection={layoutDirection}
        changeLayoutDirection={changeLayoutDirection}
        isExceptionFilterActive={isExceptionFilterActive}
        setIsExceptionFilterActive={setIsExceptionFilterActive}
        setIsSettingsOpen={setIsSettingsOpen}
      />

      <div className="main-wrapper">
        <Sidebar
          inputCode={inputCode} setInputCode={setInputCode}
          textareaRef={textareaRef} highlightLines={highlightLines}
          loading={loading} onAnalyze={handleAnalyze}
        />

        <main className="map-area">
          <div className="reactflow-wrapper">
            <ReactFlow
              nodes={filteredNodes} edges={filteredEdges}
              onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => setSelectedNode(node)}
              fitView
            >
              <Background variant="dots" gap={20} size={1} color={theme === 'dark' ? '#374151' : '#e5e7eb'} />
              <Controls />
            </ReactFlow>
          </div>

          <Dashboard
            selectedNode={selectedNode}
            previousNodes={previousNodes}
            nextDirectNodes={nextDirectNodes}
            nextExceptionNodes={nextExceptionNodes}
            theme={theme}
            detectedLanguage={detectedLanguage}
          />
        </main>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        theme={theme} setTheme={setTheme}
        showNodeDescriptions={showNodeDescriptions} setShowNodeDescriptions={setShowNodeDescriptions}
        edgeType={edgeType} setEdgeType={setEdgeType}
        edgeWidth={edgeWidth} setEdgeWidth={setEdgeWidth}
      />
    </div>
  );
}
