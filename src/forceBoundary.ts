/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Force, SimulationNodeDatum } from "d3-force";
import constant from "./constant";
import { assign, isNumber, isUndefined } from "lodash-es";

type ArbitraryForce<IForce, NodeDatum extends SimulationNodeDatum> = IForce & Force<NodeDatum, any>
type ScalarAccessor = <NodeDatum extends SimulationNodeDatum>(node: NodeDatum, i: number, nodes: NodeDatum[]) => number;
// creates the force that enforces the boundary
export default function forceBoundary<NodeDatum extends SimulationNodeDatum>(
  x0 = -100,
  y0 = -100,
  x1 = 100,
  y1 = 100,
) {
  
  let _strength: ScalarAccessor = constant(0.01),
    _hardBoundary: boolean = true,
    _border: ScalarAccessor = constant( Math.min((x1 - x0)/2, (y1 - y0)/2) ),
    _nodes: NodeDatum[],
    _strengthsX: number[],
    _strengthsY: number[],
    _x0z: number[],
    _x1z: number[],
    _y0z: number[],
    _y1z: number[],
    _borderz: number[],
    _halfX: number[],
    _halfY: number[],
    _x0: ScalarAccessor,
    _x1: ScalarAccessor,
    _y0: ScalarAccessor,
    _y1: ScalarAccessor;
    
    if (typeof x0 !== "function") _x0 = constant(x0 == null ? -100 : +x0);
    if (typeof x1 !== "function") _x1 = constant(x1 == null ? 100 : +x1);
    if (typeof y0 !== "function") _y0 = constant(y0 == null ? -100 : +y0);
    if (typeof y1 !== "function") _y1 = constant(y1 == null ? 100 : +y1);
  

  function getVx(halfX: number, x: number, strengthX: number, border: typeof _border | number, alpha: number) {
    return (halfX - x) * Math.min(2, Math.abs(halfX - x) / halfX) * strengthX * alpha;
  }

  function initialize(nodes: NodeDatum[]) {
    _nodes = nodes;
    const n: number = nodes.length;
    _strengthsX = new Array(n);
    _strengthsY = new Array(n);
    _x0z = new Array(n);
    _y0z = new Array(n);
    _x1z = new Array(n);
    _y1z = new Array(n);
    _halfY = new Array(n);
    _halfX = new Array(n);
    _borderz = new Array(n);

    for (let i = 0; i < n; ++i) {
      _strengthsX[i] = (isNaN(_x0z[i] = +_x0(nodes[i], i, nodes)) ||
        isNaN(_x1z[i] = +_x1(nodes[i], i, nodes))) ? 0 : +_strength(nodes[i], i, nodes);
      _strengthsY[i] = (isNaN(_y0z[i] = _y0(nodes[i], i, nodes))) ||
        isNaN(_y1z[i] = +_y1(nodes[i], i, nodes)) ? 0 : +_strength(nodes[i], i, nodes);
      _halfX[i] = _x0z[i] + (_x1z[i] - _x0z[i]) / 2,
        _halfY[i] = _y0z[i] + (_y1z[i] - _y0z[i]) / 2;
      _borderz[i] = +_border(nodes[i], i, nodes)
    }
  }

  function strength(): ScalarAccessor;
  function strength(_newStrength: ScalarAccessor | number): typeof force;
  function strength(_newStrength?: ScalarAccessor | number): ScalarAccessor | typeof force {
    if (!isUndefined(_newStrength)) {
      if (isNumber(_newStrength))
        _strength = constant(_newStrength)
      else        
        _strength = _newStrength
      return force;
    }
    return _strength
  }
  
  function border(): ScalarAccessor;
  function border(_newBorder: ScalarAccessor | number): typeof force;
  function border(_newBorder?: ScalarAccessor | number): ScalarAccessor | typeof force {
    if (!isUndefined(_newBorder)) {
      if (isNumber(_newBorder))
        _border = constant(_newBorder)
      else        
        _border = _newBorder
      return force;
    }
    return _strength
  }
  
  function hardBoundary(): boolean;  
  function hardBoundary(_newHardBoundary: boolean): typeof force;  
  function hardBoundary(_newHardBoundary?: boolean): boolean | typeof force {
    if (!isUndefined(_newHardBoundary)) {
      _hardBoundary = _newHardBoundary
      return force;
    }
    return false;
  }
  
  const methods = {
    strength,
    border,
    hardBoundary,
  }
  
  const force = function force(alpha: number) {
    for (let i = 0, n = _nodes.length, node; i < n; ++i) {
      node = _nodes[i];
      // debugger;
      if ((node.x! < (_x0z[i] + _borderz[i]) || node.x! > (_x1z[i] - _borderz[i])) ||
        (node.y! < (_y0z[i] + _borderz[i]) || node.y! > (_y1z[i] - _borderz[i]))) {
        node.vx! += getVx(_halfX[i], node.x!, _strengthsX[i], _borderz[i], alpha);
        node.vy! += getVx(_halfY[i], node.y!, _strengthsY[i], _borderz[i], alpha);
      } else if ((node.y!) < (_y0z[i] + _borderz[i]) || (node.y!) > (_y1z[i] - _borderz[i])) {

        // node.vx = 0;
        // node.vy = 0;
      }

      if (_hardBoundary) {
        if (node.x! >= _x1z[i]) node.vx! += _x1z[i] - node.x!;
        if (node.x! <= _x0z[i]) node.vx! += _x0z[i] - node.x!;
        if (node.y! >= _y1z[i]) node.vy! += _y1z[i] - node.y!;
        if (node.y! <= _y0z[i]) node.vy! += _y0z[i] - node.y!;
      }
    }
  } as ArbitraryForce<typeof methods, NodeDatum>;

  return assign(force, { initialize, ...methods });
}

