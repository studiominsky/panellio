'use client';

import React, { useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  OnNodeDrag,
  useReactFlow,
} from '@xyflow/react';
import CustomNode from './custom-node';
import '@xyflow/react/dist/base.css';
import { updateNodePanel } from '@/services/nodes-service';
import { useTheme } from 'next-themes';
import { AlignHorizontalSpaceAround } from 'lucide-react';

const NodesPanel = ({
  panel,
  userId,
  directoryId,
  onDeletePanel,
  onPanelUpdate,
}: {
  panel: any;
  userId: string;
  directoryId: string;
  onDeletePanel: () => void;
  onPanelUpdate: (updatedPanel: any) => void;
}) => {
  return (
    <ReactFlowProvider>
      <NodesPanelContent
        panel={panel}
        userId={userId}
        directoryId={directoryId}
        onDeletePanel={onDeletePanel}
        onPanelUpdate={onPanelUpdate}
      />
    </ReactFlowProvider>
  );
};

const NodesPanelContent = ({
  panel,
  userId,
  directoryId,
  onDeletePanel,
  onPanelUpdate,
}: {
  panel: any;
  userId: string;
  directoryId: string;
  onDeletePanel: () => void;
  onPanelUpdate: (updatedPanel: any) => void;
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { theme } = useTheme();
  const reactFlowInstance = useReactFlow();

  const lightTheme = {
    strokeColor: 'hsl(214.3 31.8% 91.4%)',
  };

  const darkTheme = {
    strokeColor: 'hsl(217.2 32.6% 17.5%)',
  };

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    setNodes(panel.nodes || []);
    setEdges(panel.edges || []);
  }, [panel]);

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: { ...edge.style, stroke: currentTheme.strokeColor },
      }))
    );
  }, [theme, currentTheme.strokeColor]);

  const handleNodesChange: OnNodesChange = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const handleEdgesChange: OnEdgesChange = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const handleConnect: OnConnect = async (connection) => {
    const updatedEdges = addEdge(
      {
        ...connection,
        style: { stroke: currentTheme.strokeColor, strokeWidth: 1 },
      },
      edges
    );

    setEdges(updatedEdges);

    try {
      await updateNodePanel(userId, directoryId, panel.panelId, {
        nodes,
        edges: updatedEdges,
      });
      onPanelUpdate({
        ...panel,
        nodes,
        edges: updatedEdges,
      });
    } catch (error) {
      console.error('Error saving connection:', error);
    }
  };

  const handleNodeDragStop: OnNodeDrag = async (
    _: React.MouseEvent,
    node: Node
  ) => {
    const updatedNodes = nodes.map((n) =>
      n.id === node.id ? { ...n, position: node.position } : n
    );

    setNodes(updatedNodes);

    try {
      await updateNodePanel(userId, directoryId, panel.panelId, {
        nodes: updatedNodes,
        edges,
      });
      onPanelUpdate({
        ...panel,
        nodes: updatedNodes,
        edges,
      });
    } catch (error) {
      console.error('Error updating node positions:', error);
    }
  };

  const nodeTypes = {
    custom: CustomNode,
  };

  return (
    <div className="h-full w-full relative">
      <div className="flex-grow bg-card" style={{ height: '100%' }}>
        <ReactFlow
          style={{ height: '100%', width: '100%' }}
          fitView
          nodes={nodes}
          edges={edges.map((edge) => ({
            ...edge,
            type: panel.edgeType || 'default',
            style: {
              ...edge.style,
              stroke: currentTheme.strokeColor,
            },
          }))}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={nodeTypes}
          isValidConnection={(connection) => {
            const { sourceHandle, targetHandle } = connection;
            if (sourceHandle && targetHandle) {
              return (
                sourceHandle.startsWith('source') &&
                targetHandle.startsWith('target')
              );
            }
            return true;
          }}
        />
        <button
          className="absolute bottom-4 right-4 border border-border p-2 rounded-md hover:bg-accent transition-all duration-300"
          onClick={() => reactFlowInstance.fitView()}
        >
          <AlignHorizontalSpaceAround size={18} />
        </button>
      </div>
    </div>
  );
};

export default NodesPanel;
