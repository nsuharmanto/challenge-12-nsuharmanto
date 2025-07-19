import { Mark, mergeAttributes, RawCommands } from '@tiptap/core';

export const DoubleStrike = Mark.create({
  name: 'doubleStrike',

  parseHTML() {
    return [
      {
        tag: 'span[data-double-strike]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-double-strike': 'true', class: 'double-strike' }),
      0,
    ];
  },

  addCommands() {
    return {
      toggleDoubleStrike:
        () =>
        ({ commands }: { commands: RawCommands }) => {
          return commands.toggleMark('doubleStrike');
        },
    } as Partial<RawCommands>;
  },
});