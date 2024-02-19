import { type UnknownRecord } from "npm:type-fest@4.10.2";

/** A single valid object in the AST */
export type Node = UnknownRecord;

/** A potentially nullish `Node` */
export type MaybeNode = UnknownRecord | null | undefined;

/** A function to invoke for each valid `Node` in the AST */
export type Callback = (node: Node, parent: MaybeNode) => boolean | void;

/** A function to check if a provided `MaybeNode` is actually a valid `Node` */
export type NodeCheck = (node: MaybeNode) => boolean;

/**
 * Walk the provided AST, invoking the provided callback for each node
 *
 * @param ast - root `Node` of the AST
 * @param cb - callback invoked for each valid `Node` of the AST found while walking
 * @param isNode - [optional] function invoked on each `MaybeNode` to determine if it is a valid `Node`
 */
export function walkAst(ast: Node, cb: Callback, isNode = isAstNode) {
	if (isNode(ast)) {
		walk(ast, null, cb, isNode);
	}
}

/** Check if the provided `MaybeNode` is actually a valid `Node` */
function isAstNode(node: MaybeNode): boolean {
	return node !== null && typeof node === "object" && typeof node._type === "string";
}

/** Recursive (and interruptible) visitor of each `Node` in the AST */
function walk(node: Node, parent: MaybeNode, cb: Callback, isNode: NodeCheck) {
	if (cb(node, parent) === false) {
		return;
	}

	for (const key in node) {
		if (Object.prototype.hasOwnProperty.call(node, key)) {
			const value = node[key] as MaybeNode | Array<MaybeNode>;

			if (Array.isArray(value)) {
				walkArray(value, node, cb, isNode);
			} else if (isNode(value)) {
				walk(value as Node, node, cb, isNode);
			}
		}
	}
}

/** Helper to visit each member of an array of `MaybeNode` in a given `Node` field */
function walkArray(nodes: Array<MaybeNode>, parent: MaybeNode, cb: Callback, isNode: NodeCheck) {
	for (const node of nodes) {
		if (isNode(node)) {
			walk(node as Node, parent, cb, isNode);
		}
	}
}
