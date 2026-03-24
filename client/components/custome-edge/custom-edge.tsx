'use client';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  source,
  target,
}: EdgeProps) {
  const { setEdges, getNode } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  // Check if source or target nodes are playing to animate the edge
  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  const isSourcePlaying = sourceNode?.data?.isPlaying;
  const isTargetPlaying = targetNode?.data?.isPlaying;
  const isActive = isSourcePlaying || isTargetPlaying;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: isActive ? 3 : 1,
          stroke: isActive ? '#3b82f6' : style.stroke || '#b1b1b7',
          animation: isActive ? 'flowAnimation 1s infinite' : 'none',
        }}
        className={isActive ? 'animate-pulse' : ''}
      />
      <EdgeLabelRenderer>
        <div
          className="button-edge__label nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <button className="button-edge__button" onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
