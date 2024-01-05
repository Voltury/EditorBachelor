// NonEditableElement/NonEditableElementCommand.js

import {Command} from '@ckeditor/ckeditor5-core';

export default class NonEditableElementCommand extends Command {
    execute({value}) {
        const editor = this.editor;
        const selection = editor.model.document.selection;

        editor.model.change(writer => {
            // Create a <NonEditableElement> element with the "suggestion" attribute (and all the selection attributes)...
            const NonEditableElement = writer.createElement('NonEditableElement', {
                ...Object.fromEntries(selection.getAttributes()),
                suggestion: value
            });

            // ... and insert it into the document. Put the selection on the inserted element.
            editor.model.insertObject(NonEditableElement, null, null);
        });
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        this.isEnabled = model.schema.checkChild(selection.focus.parent, 'NonEditableElement');
    }
}
