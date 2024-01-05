import {Plugin} from '@ckeditor/ckeditor5-core';
import {toWidget, Widget} from '@ckeditor/ckeditor5-widget';

import NonEditableElementCommand from './NonEditableElementCommand';
import './theme/NonEditableElement.css';

export default class NonEditableElementEditing extends Plugin {
    static get requires() {
        return [Widget];
    }

    init() {
        console.log('NonEditableElementEditing#init() got called');

        this.suggestion = null;
        this.currentlyWriting = false;

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('NonEditableElement', new NonEditableElementCommand(this.editor));

        this.editor.model.document.on('change:data', () => {
            this._insertNonEditableElement();
        });

        this.editor.model.document.selection.on('change:range', () => {
            this._removeExistingSuggestion();
        });
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('NonEditableElement', {
            // Behaves like a self-contained inline object (e.g. an inline image)
            // allowed in places where $text is allowed (e.g. in paragraphs).
            // The inline widget can have the same attributes as text (for example linkHref, bold).
            inheritAllFrom: '$inlineObject',

            // The NonEditableElement can have many types, like date, name, surname, etc.:
            allowAttributes: ['suggestion']
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                suggestion: 'span',
                classes: ['NonEditableElement']
            },
            model: (viewElement, {writer: modelWriter}) => {
                const name = viewElement.getChild(0).data;

                return modelWriter.createElement('NonEditableElement', {name});
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'NonEditableElement',
            view: (modelItem, {writer: viewWriter}) => {
                const widgetElement = createNonEditableElementView(modelItem, viewWriter);

                // Enable widget handling on a NonEditableElement element inside the editing view.
                return toWidget(widgetElement, viewWriter);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'NonEditableElement',
            view: (modelItem, {writer: viewWriter}) => createNonEditableElementView(modelItem, viewWriter)
        });

        // Helper method for both downcast converters.
        function createNonEditableElementView(modelItem, viewWriter) {
            const suggestion = modelItem.getAttribute('suggestion');

            const NonEditableElementView = viewWriter.createContainerElement('span', {
                class: 'NonEditableElement',
                contenteditable: "false", // make it read-only
                style: "user-select: none;" // make it non-selectable
            });

            // Insert the NonEditableElement suggestion (as a text).
            const innerText = viewWriter.createText(suggestion);
            viewWriter.insert(viewWriter.createPositionAt(NonEditableElementView, 0), innerText);

            return NonEditableElementView;
        }
    }

    _insertNonEditableElement() {
        //-------------------------------------------------------------------------
        // Checking if at last position
        const selection = this.editor.model.document.selection;
        const root = this.editor.model.document.getRoot();

        // Check if the selection is collapsed (i.e., it is a caret, not a range).
        if (!selection.isCollapsed) {
            return;
        }

        const lastBlock = Array.from(root.getChildren()).pop();
        const lastPositionInLastBlock = this.editor.model.createPositionAt(lastBlock, 'end');

        // Check if the selection is at the end of the last block.
        if (!selection.getFirstPosition().isEqual(lastPositionInLastBlock)) {
            return;
        }
        //-------------------------------------------------------------------------

        // Insert the non-editable element at the end of the root.
        this.editor.model.change(writer => {
            this.currentlyWriting = true;
            // If there's an existing suggestion, remove it.
            if (this.suggestion) {
                writer.remove(writer.createRangeOn(this.suggestion));
            }

            // Create a new suggestion and insert it.
            this.suggestion = writer.createElement('NonEditableElement', { suggestion: 'suggestion' });
            writer.insert(this.suggestion, lastPositionInLastBlock, 1);

            // Move the cursor before the inserted element.
            writer.setSelection(this.suggestion, 'before');

            this.currentlyWriting = false;
        });
    }

    _removeExistingSuggestion() {
        if(this.currentlyWriting) return;
        this.editor.model.change(writer => {
            // If there's an existing suggestion, remove it.
            if (this.suggestion) {
                writer.remove(writer.createRangeOn(this.suggestion));
                this.suggestion = null;
            }
        });
    }
}
