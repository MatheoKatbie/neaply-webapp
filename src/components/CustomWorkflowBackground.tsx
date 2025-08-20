import React, { useEffect, useRef } from 'react';

function CustomWorkflowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Animation parameters
    interface WorkflowNode {
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      pulsePhase: number;
      label: string;
    }

    interface Connection {
      from: number;
      to: number;
      dashOffset: number;
      progress: number;
    }

    const nodes: WorkflowNode[] = [];
    const connections: Connection[] = [];
    const nodeLabels = ['Start', 'Process', 'Validate', 'Transform', 'Complete'];

    // Store responsive values for use in draw function
    let isMobile = false;
    let isTablet = false;

    // Function to calculate responsive layout
    function calculateLayout() {
      if (!canvas) return;
      
      // Set canvas size to full window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Clear existing nodes and connections
      nodes.length = 0;
      connections.length = 0;

      // Update responsive values
      isMobile = canvas.width < 768;
      isTablet = canvas.width < 1024;
      const nodeWidth = isMobile ? 80 : isTablet ? 100 : 120;
      const nodeHeight = isMobile ? 35 : isTablet ? 42 : 50;
      
      // Responsive positioning and spacing
      const padding = isMobile ? canvas.width * 0.05 : canvas.width * 0.08;
      const availableWidth = canvas.width - (padding * 2);
      const horizontalSpacing = availableWidth / (nodeLabels.length - 1);
      const baseX = padding;
      const baseY = canvas.height * (isMobile ? 0.45 : 0.4);
      const verticalVariation = canvas.height * (isMobile ? 0.08 : isTablet ? 0.12 : 0.15);
      
      // Define responsive positions for a more interesting 2D layout
      const nodePositions = [
        { x: baseX, y: baseY }, // Start
        { x: baseX + horizontalSpacing, y: baseY - verticalVariation }, // Process (higher)
        { x: baseX + horizontalSpacing * 2, y: baseY + verticalVariation * 0.5 }, // Validate (lower)
        { x: baseX + horizontalSpacing * 3, y: baseY - verticalVariation * 0.7 }, // Transform (higher)
        { x: baseX + horizontalSpacing * 4, y: baseY } // Complete (center)
      ];

      // Create workflow nodes with varied positions
      for (let i = 0; i < nodeLabels.length; i++) {
        const pos = nodePositions[i];
        nodes.push({
          x: pos.x - nodeWidth / 2,
          y: pos.y - nodeHeight / 2,
          width: nodeWidth,
          height: nodeHeight,
          color: i === 0 ? 'rgba(0, 0, 0, 0.9)' : 'rgba(156, 163, 175, 0.8)',
          pulsePhase: i * Math.PI / 3,
          label: nodeLabels[i]
        });

        // Create connection to next node
        if (i < nodeLabels.length - 1) {
          connections.push({
            from: i,
            to: i + 1,
            dashOffset: 0,
            progress: 0
          });
        }
      }
    }

    // Initial layout calculation
    calculateLayout();

    let animationId: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      // Draw animated dashed connections
      connections.forEach((connection, index) => {
        const fromNode = nodes[connection.from];
        const toNode = nodes[connection.to];
        
        if (!fromNode || !toNode) return;

        // Update dash animation
        connection.dashOffset -= 0.5; // Much slower dash animation
        if (connection.dashOffset < -20) connection.dashOffset = 0;

        // Update progress animation (slow workflow progression)
        connection.progress += 0.003; // Very slow progress
        if (connection.progress > 1.2) connection.progress = 0; // Reset with delay

        // Calculate connection points (from right edge of from-node to left edge of to-node)
        const fromX = fromNode.x + fromNode.width;
        const fromY = fromNode.y + fromNode.height / 2;
        const toX = toNode.x;
        const toY = toNode.y + toNode.height / 2;

        // Create curved path using quadratic bezier curve
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        // Add responsive curve control point offset
        const controlX = midX;
        const curveOffset = isMobile ? 20 : isTablet ? 25 : 30;
        const controlY = midY - Math.abs(toY - fromY) * 0.5 - curveOffset; // Responsive curve

        // Draw animated dashed curved line
        ctx.strokeStyle = 'rgba(107, 114, 128, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.lineDashOffset = connection.dashOffset;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.quadraticCurveTo(controlX, controlY, toX, toY);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // Draw progress indicator (moving dot along curve)
        if (connection.progress <= 1) {
          // Calculate position along the bezier curve
          const t = connection.progress;
          const progressX = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * controlX + t * t * toX;
          const progressY = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * controlY + t * t * toY;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
          ctx.beginPath();
          ctx.arc(progressX, progressY, 6, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(progressX, progressY, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw workflow nodes (semi-rounded rectangles)
      nodes.forEach((node, index) => {
        // Subtle pulsing effect
        const pulse = 1 + Math.sin(time * 1.5 + node.pulsePhase) * 0.03;
        const nodeWidth = node.width * pulse;
        const nodeHeight = node.height * pulse;
        
        // Draw node shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.roundRect(node.x + 3, node.y + 3, nodeWidth, nodeHeight, 12);
        ctx.fill();

        // Draw node background
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(node.x, node.y, nodeWidth, nodeHeight, 12);
        ctx.fill();

        // Draw node border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw node label with responsive font size
        ctx.fillStyle = index === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
        const fontSize = isMobile ? 10 : isTablet ? 12 : 14;
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          node.label,
          node.x + nodeWidth / 2,
          node.y + nodeHeight / 2
        );
      });

      animationId = requestAnimationFrame(draw);
    }

    draw();

    // Handle resize with layout recalculation
    const handleResize = () => {
      calculateLayout(); // Recalculate entire layout on resize
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-30 pointer-events-none"
    />
  );
}

export default CustomWorkflowBackground;
