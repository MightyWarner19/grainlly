'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { $getRoot } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ListNode, ListItemNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';

function Placeholder() {
  return (
    <div className="pointer-events-none absolute top-2 left-3 text-gray-400 text-sm">
      Write a detailed description...
    </div>
  );
}

export default function RichTextEditor({ initialHTML = '', onChange }) {
  const [mounted, setMounted] = useState(false);
  const initialConfig = useMemo(
    () => ({
      namespace: 'grainlly-editor',
      theme: {
        paragraph: 'mb-2',
      },
      nodes: [
        ListNode, 
        ListItemNode, 
        HeadingNode, 
        QuoteNode, 
        CodeNode, 
        CodeHighlightNode,
        LinkNode,
        AutoLinkNode
      ],
      onError(error) {
        console.error(error);
      },
    }),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR/CSR markup drift by delaying editor render until after mount
  if (!mounted) {
    return (
      <div className="border border-gray-300 rounded-lg relative" suppressHydrationWarning>
        <div className="min-h-36 px-3 py-2 text-sm" />
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg relative" suppressHydrationWarning>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="min-h-36">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-36 px-3 py-2 text-sm focus:outline-none" />
            }
            placeholder={<Placeholder />}
          />
          <HistoryPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />

          <InitContentPlugin html={initialHTML} />

          <DebouncedOnChangePlugin onChange={onChange} />
        </div>
      </LexicalComposer>
    </div>
  );
}

// Debounced onChange plugin for better performance
function DebouncedOnChangePlugin({ onChange }) {
  const [editor] = useLexicalComposerContext();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!onChange) return;

    return editor.registerUpdateListener(({ editorState }) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout - only generate HTML after user stops typing
      timeoutRef.current = setTimeout(() => {
        try {
          const html = editorState.read(() => $generateHtmlFromNodes(editor));
          onChange(html);
        } catch (e) {
          console.error('Failed to serialize editor content', e);
        }
      }, 300); // 300ms debounce delay
    });
  }, [editor, onChange]);

  return null;
}

function InitContentPlugin({ html }) {
  const [editor] = useLexicalComposerContext();
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!editor) return;
    if (didInitRef.current) return;
    didInitRef.current = true;
    const safeHTML = html && html !== '<p><br></p>' ? html : '';
    if (!safeHTML) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(safeHTML, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.append(...nodes);
    });
  }, [editor, html]);

  return null;
}
