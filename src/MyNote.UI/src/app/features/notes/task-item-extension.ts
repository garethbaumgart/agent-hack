import TaskItem from '@tiptap/extension-task-item';

export interface TaskItemWithMetaOptions {
  nested: boolean;
  HTMLAttributes: Record<string, string>;
}

export const TaskItemWithMeta = TaskItem.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-task-id': {
        default: null,
        parseHTML: element => element.getAttribute('data-task-id'),
        renderHTML: attributes => {
          if (!attributes['data-task-id']) {
            return {};
          }
          return { 'data-task-id': attributes['data-task-id'] };
        },
      },
      'data-due-date': {
        default: null,
        parseHTML: element => element.getAttribute('data-due-date'),
        renderHTML: attributes => {
          if (!attributes['data-due-date']) {
            return {};
          }
          return { 'data-due-date': attributes['data-due-date'] };
        },
      },
      'data-labels': {
        default: null,
        parseHTML: element => element.getAttribute('data-labels'),
        renderHTML: attributes => {
          if (!attributes['data-labels']) {
            return {};
          }
          return { 'data-labels': attributes['data-labels'] };
        },
      },
    };
  },
});
