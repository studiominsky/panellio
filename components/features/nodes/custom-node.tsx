'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useTheme } from 'next-themes';
import { ColorThemeProvider } from '@/providers/color-theme-provider';

interface CustomNodeProps {
  data: {
    label: string;
    color?: string;
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const { theme } = useTheme();

  const lightTheme = {
    backgroundColor: 'var(--ui-primary-opacity)',
    textColor: 'var(--ui-inverted)',
    handleColor: 'var(--ui-primary)',
  };

  const darkTheme = {
    backgroundColor: 'var(--ui-primary-opacity)',
    textColor: 'var(--ui-inverted)',
    handleColor: 'var(--ui-primary)',
  };

  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ColorThemeProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px 20px',
          borderRadius: '4px',
          maxWidth: '200px',
          backgroundColor: currentTheme.backgroundColor,
          color: currentTheme.textColor,
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: currentTheme.textColor,
          }}
        >
          {data.label}
        </span>
        <Handle
          type="target"
          position={Position.Right}
          id="target"
          style={{
            backgroundColor: currentTheme.handleColor,
            borderRadius: '50%',
            padding: '3px',
          }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="source"
          style={{
            backgroundColor: currentTheme.handleColor,
            borderRadius: '50%',
            padding: '3px',
          }}
        />
      </div>
    </ColorThemeProvider>
  );
};

export default CustomNode;
