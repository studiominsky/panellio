import { Node, Edge } from '@xyflow/react';

export interface NodePanel {
  name: string;
  panelId: string;
  nodes: Node[];
  edges: Edge[];
  edgeType: 'smoothstep' | 'default' | 'straight';
  directoryId: string;
}
