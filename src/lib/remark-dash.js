/**
 * Remark plugin to replace double dashes `--` in text nodes with a <Dash /> MDX element.
 * - Leaves single '-' characters untouched.
 * - Skips code/inlineCode/MDX ESM and expression nodes.
 * - Injects a single import for Dash at the top of the MDX file when used.
 */
export default function remarkDash() {
  return (tree, file) => {
    let transformed = 0;
    let dashUsed = false;

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
        if (typeof value !== 'string' || value.indexOf('--') === -1) return;

        // Replace pairs of dashes with <Dash />, preserving single '-' as-is.
        const parts = value.split('--');
        const newNodes = [];

        for (let i = 0; i < parts.length; i++) {
          if (parts[i]) {
            newNodes.push({ type: 'text', value: parts[i] });
          }
          if (i !== parts.length - 1) {
            newNodes.push({
              type: 'mdxJsxTextElement',
              name: 'Dash',
              attributes: [],
              children: []
            });
            transformed++;
            dashUsed = true;
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

    // Inject a single import if Dash was used and not already imported.
    if (dashUsed && !hasDashImport) {
      tree.children.unshift({
        type: 'mdxjsEsm',
        value: "import Dash from '../../components/Dash.astro';"
      });
    }

    if (transformed > 0) {
      console.log(
        '[remark-dash] transformed',
        transformed,
        'double-dash sequences in',
        (file && file.path) ? file.path : '(unknown file)'
      );
    }
  };
}
