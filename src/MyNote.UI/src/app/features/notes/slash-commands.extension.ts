import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';

interface CommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: any) => void;
}

const commands: CommandItem[] = [
  {
    title: 'Task',
    description: 'Add a task checkbox',
    icon: '☑️',
    command: (editor) => {
      editor.chain().focus().toggleTaskList().run();
    }
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: 'H1',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    }
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: 'H2',
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    }
  },
  {
    title: 'Bullet List',
    description: 'Create a bullet list',
    icon: '•',
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    }
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: '1.',
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    }
  },
  {
    title: 'Quote',
    description: 'Add a quote block',
    icon: '"',
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    }
  },
  {
    title: 'Code Block',
    description: 'Add a code block',
    icon: '</>',
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    }
  }
];

function createCommandsPopup() {
  let popup: TippyInstance | null = null;
  let selectedIndex = 0;
  let filteredCommands: CommandItem[] = [];
  let component: HTMLElement | null = null;

  const render = () => {
    if (!component) return;

    component.innerHTML = filteredCommands.map((item, index) => `
      <button
        class="slash-command-item ${index === selectedIndex ? 'is-selected' : ''}"
        data-index="${index}"
      >
        <span class="slash-command-icon">${item.icon}</span>
        <div class="slash-command-text">
          <span class="slash-command-title">${item.title}</span>
          <span class="slash-command-description">${item.description}</span>
        </div>
      </button>
    `).join('');

    // Add click handlers
    component.querySelectorAll('.slash-command-item').forEach((el) => {
      el.addEventListener('click', () => {
        const index = parseInt((el as HTMLElement).dataset['index'] || '0');
        selectItem(index);
      });
    });
  };

  const selectItem = (index: number) => {
    const item = filteredCommands[index];
    if (item && props?.command) {
      props.command(item);
    }
  };

  let props: any = null;

  return {
    onStart: (p: any) => {
      props = p;
      selectedIndex = 0;
      filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().startsWith(p.query.toLowerCase())
      );

      if (filteredCommands.length === 0) {
        return;
      }

      component = document.createElement('div');
      component.className = 'slash-commands-popup';

      render();

      popup = tippy(document.body, {
        getReferenceClientRect: p.clientRect,
        appendTo: () => document.body,
        content: component,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        arrow: false,
        offset: [0, 4]
      });
    },

    onUpdate: (p: any) => {
      props = p;
      selectedIndex = 0;
      filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().startsWith(p.query.toLowerCase())
      );

      if (filteredCommands.length === 0) {
        popup?.hide();
        return;
      }

      render();
      popup?.setProps({ getReferenceClientRect: p.clientRect });
      popup?.show();
    },

    onKeyDown: (p: { event: KeyboardEvent }) => {
      if (filteredCommands.length === 0) {
        return false;
      }

      if (p.event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex + filteredCommands.length - 1) % filteredCommands.length;
        render();
        return true;
      }

      if (p.event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        render();
        return true;
      }

      if (p.event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },

    onExit: () => {
      popup?.destroy();
      popup = null;
      component = null;
    }
  };
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: any; range: any; props: CommandItem }) => {
          // Delete the slash command text
          editor.chain().focus().deleteRange(range).run();
          // Execute the command
          props.command(editor);
        }
      } as Partial<SuggestionOptions>
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        render: createCommandsPopup
      })
    ];
  }
});
