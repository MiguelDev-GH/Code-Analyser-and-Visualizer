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
import { useSettings } from './hooks/useSettings';

export default function App() {
  const textareaRef = useRef(null);
  const [inputCode, setInputCode] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load all settings from cookies (once on mount)
  const { initial, persist } = useSettings();

  const [language, setLanguage] = useState(initial.language);
  const [theme, setTheme] = useState(initial.theme);
  const [isExceptionFilterActive, setIsExceptionFilterActive] = useState(initial.isExceptionFilterActive);
  const [edgeType, setEdgeType] = useState(initial.edgeType);
  const [edgeWidth, setEdgeWidth] = useState(initial.edgeWidth);

  // Wrapped setters that also persist to cookies
  const handleSetLanguage = (v) => { setLanguage(v); persist('language', v); };
  const handleSetTheme = (v) => { setTheme(v); persist('theme', v); };
  const handleSetIsExceptionFilterActive = (v) => { setIsExceptionFilterActive(v); persist('isExceptionFilterActive', v); };
  const handleSetEdgeType = (v) => { setEdgeType(v); persist('edgeType', v); };
  const handleSetEdgeWidth = (v) => { setEdgeWidth(v); persist('edgeWidth', v); };

  const {
    nodes, setNodes, edges, setEdges,
    layoutDirection, changeLayoutDirection,
    showNodeDescriptions, setShowNodeDescriptions,
    handleAutoFormat, onNodesChange, onEdgesChange,
  } = useGraphState(initial);

  // Wrapped setters for graph state settings
  const handleSetShowNodeDescriptions = (v) => { setShowNodeDescriptions(v); persist('showNodeDescriptions', v); };
  const handleChangeLayoutDirection = (v) => { changeLayoutDirection(v); persist('layoutDirection', v); };

  const { loading, detectedLanguage, lineCount, codeTitle, isAnalyzed, analyze } = useAnalyze({
    inputCode, language, layoutDirection, showNodeDescriptions,
  });

  const highlightLines = useCodeHighlight(selectedNode, inputCode);
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
        <InputScreen
          inputCode={inputCode} setInputCode={setInputCode}
          onAnalyze={handleAnalyze} loading={loading}
          language={language} setLanguage={handleSetLanguage}
        />
      </div>
    );
  }

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <Header
        codeTitle={codeTitle}
        detectedLanguage={detectedLanguage} lineCount={lineCount} loading={loading}
        handleAutoFormat={handleAutoFormat} layoutDirection={layoutDirection}
        changeLayoutDirection={handleChangeLayoutDirection}
        isExceptionFilterActive={isExceptionFilterActive}
        setIsExceptionFilterActive={handleSetIsExceptionFilterActive}
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
        theme={theme} setTheme={handleSetTheme}
        showNodeDescriptions={showNodeDescriptions} setShowNodeDescriptions={handleSetShowNodeDescriptions}
        edgeType={edgeType} setEdgeType={handleSetEdgeType}
        edgeWidth={edgeWidth} setEdgeWidth={handleSetEdgeWidth}
      />
    </div>
  );
}
