import { DAGSVGComponent, DAGNode, Node } from "./index";

function getRandomInt(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export const randomNodes = () => {
  const nodes: DAGNode[] = [{ id: 0 }];

  const r = getRandomInt(2, 5);
  for (let d = 1; d < r; d++) {
    const l1id = d;
    nodes.push({ id: l1id, parents: [0] });

    const r2 = getRandomInt(2, 5);
    for (let i = 0; i < r2; i++) {
      const l2id = l1id * 10 + i;

      nodes.push({ id: l2id, parents: [l1id] });
      const r3 = getRandomInt(0, 3);
      for (let y = 0; y < r3; y++) {
        const l3id = l2id * 10 + y;

        nodes.push({ id: l3id, parents: [l2id] });
      }
    }
  }
  return nodes;
};

export const exampleDiamond: DAGNode[] = [
  {
    id: 0,
  },
  {
    id: 1,
    parents: [], //[null, 9999, "xxxx" as unknown as number],
  },
  {
    id: 2,
    parents: [0],
  },
  {
    id: 3,
    parents: [1, 2],
  },
  {
    id: 4,
    parents: [3],
  },
  {
    id: 5,
    parents: [3],
  },
  {
    id: 6,
    parents: [3],
  },
  {
    id: 7,
    parents: [4, 5, 6],
  },
  {
    id: 8,
    parents: [1, 2, 3, 4, 5, 6, 7, 0],
  },
];
