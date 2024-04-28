import React, { useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import { Program, ProgramVersion } from "../utils/clientTypes";

interface Props {
  programs: Program[];
  onOpenModal: (content: string) => void;
}

export const ProgramGraph: React.FC<Props> = ({ programs, onOpenModal }) => {
  const nodes: { id: string; label: string; body: string; size: number }[] = [];
  const links: { source: string; target: string }[] = [];

  const addNodesAndLinks = (
    program: Program | ProgramVersion,
    parent?: string,
  ) => {
    const nodeId = `program-${program.id}`;
    if (!nodes.some((n) => n.id === nodeId)) {
      nodes.push({
        id: nodeId,
        label:
          "name" in program ? program.name : `Version: ${program.description}`,
        body: "body" in program ? program.body : "",
        size: ("fitness" in program ? program.fitness : 0.5) * 50,
      });

      if (parent) {
        links.push({ source: parent, target: nodeId });
      }

      if ("versions" in program) {
        program.versions.forEach((version: ProgramVersion) =>
          addNodesAndLinks(version, nodeId),
        );
      }

      if ("dependencies" in program) {
        program.dependencies.forEach((dep: Program) =>
          addNodesAndLinks(dep, nodeId),
        );
      }
    }
  };

  programs.forEach((program) => addNodesAndLinks(program));

  const handleNodeClick = (node: {
    id: string;
    label: string;
    body: string;
  }) => {
    console.log(node);
    onOpenModal(node.body); // Customize this line to fetch the actual function body or related data
  };

  const nodeCanvasObject = (
    node: any,
    ctx: CanvasRenderingContext2D,
    globalScale: number,
  ) => {
    const label = node.label;
    const fontSize = 12;
    ctx.fillStyle = node.color;
    ctx.beginPath(); // Begin drawing the node
    ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = "center";
    ctx.fillText(label, node.x, node.y + fontSize);
  };

  return (
    <>
      <div>
        <ForceGraph2D
          graphData={{ nodes, links }}
          onNodeClick={handleNodeClick}
          nodeLabel="label"
          nodeAutoColorBy="group"
          linkDirectionalParticles="value"
          nodeCanvasObject={nodeCanvasObject}
          width={1200}
          height={800}
        />
      </div>
    </>
  );
};

export default ProgramGraph;
