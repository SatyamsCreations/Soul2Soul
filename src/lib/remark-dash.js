
/**
 * Remark plugin to replace '-' in text nodes with <Dash /> MDX elements.
 * - Skips code/inlineCode/MDX ESM and expression nodes.
 * - Injects a single import for Dash at the top of the MDX file when used.
 */
export default function remarkDash() {
  return (tree, file) => {
    let dashUsed = false;
    let transformed = 0;

    // Detect existing Dash import
    let hasDashImport = false;
    if (Array.isArray(tree.children)) {
      for (const node of tree.children) {
        if (
          node.type === 'mdxjsEsm' &&
          typeof node.value === 'string' &&
          /\bimport\s+Dash\b/.test(node.value)
        ) {
          hasDashImport = true;
          break;
        }
      }
    }

    const SKIP_TYPES = new Set([
      'code',
      'inlineCode',
      'mdxjsEsm',
      'mdxFlowExpression',
      'mdxTextExpression',
      'import',
      'export'
    ]);

    function visit(node, parent) {
      if (!node || typeof node !== 'object') return;

      if (SKIP_TYPES.has(node.type)) return;

      if (node.type === 'text') {
        const value = node.value;
        if (typeof value !== 'string' || value.indexOf('-') === -1) return;

        const parts = value.split('-');
        const newNodes = [];

        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            newNodes.push({ type: 'text', value: parts[i] });
          }
          if (i !== parts.length - 1) {
            newNodes.push({
              type: 'mdxJsxTextElement',
              name: 'span',
              attributes: [
                { type: 'mdxJsxAttribute', name: 'className', value: 'mdash' }
              ],
              children: [{ type: 'text', value: '-' }]
            });
            transformed++;
          }
        }

        if (parent && Array.isArray(parent.children)) {
          const idx = parent.children.indexOf(node);
          if (idx !== -1) {
            parent.children.splice(idx, 1, ...newNodes);
          }
        }
        return;
      }

      if (Array.isArray(node.children)) {
        // Iterate over a copy since we may mutate children arrays
        const children = [...node.children];
        for (const child of children) visit(child, node);
      }
    }

    visit(tree, null);

    if (transformed > 0) {
      console.log('[remark-dash] transformed', transformed, 'dashes in', (file && file.path) ? file.path : '(unknown file)');
    }

  };
}
