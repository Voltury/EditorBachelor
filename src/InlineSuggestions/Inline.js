import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import NonEditableElement from "./NonEditableElement/NonEditableElement";

export default class InlineSuggestion extends Plugin {
    static get requires() {
        return [NonEditableElement];
    }

    static get pluginName() {
        return 'InlineSuggestion';
    }

    init() {
        console.log('InlineSuggestion#init() got called');

        this.isEnabled = false;
        this.suggestion = null;
        this.currentlyWriting = false;

        this.editor.model.document.on('change:data', () => {
            if(this.isEnabled) this._insertNonEditableElement();
        });

        this.editor.model.document.selection.on('change:range', () => {
            if(this.isEnabled) this._removeExistingSuggestion();
        });
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
            this.suggestion = writer.createElement('NonEditableElement', {suggestion: 'suggestion'});
            writer.insert(this.suggestion, lastPositionInLastBlock, 1);

            // Move the cursor before the inserted element.
            writer.setSelection(this.suggestion, 'before');

            this.currentlyWriting = false;
        });
    }

    _removeExistingSuggestion() {
        if (this.currentlyWriting) return;
        this.editor.model.change(writer => {
            // If there's an existing suggestion, remove it.
            if (this.suggestion) {
                writer.remove(writer.createRangeOn(this.suggestion));
                this.suggestion = null;
            }
        });
    }

    enablePlugin(){
        this.isEnabled = true;
    }

    disablePlugin(){
        this.isEnabled = false;
        this._removeExistingSuggestion()
    }
}