import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import NonEditableElement from "./NonEditableElement/NonEditableElement";
import TextSuggestion from "../TextSuggestion/TextSuggestion";


export default class InlineSuggestion extends Plugin {
    static get requires() {
        return [NonEditableElement, TextSuggestion];
    }

    static get pluginName() {
        return 'InlineSuggestion';
    }

    static get labelName(){
        return "Inline"
    }

    init() {
        console.log('InlineSuggestion#init() got called');

        this.isEnabled = false;
        this.suggestion = null;
        this.currentlyWriting = false;

        this.editor.model.document.on('change:data', () => {
            if (this.isEnabled) this._possibleSuggestion();
        });

        this.editor.model.document.selection.on('change:range', () => {
            if (this.isEnabled) this._removeExistingSuggestion();
        });
    }

    enablePlugin() {
        this.isEnabled = true;
    }

    disablePlugin() {
        this.isEnabled = false;
        this._removeExistingSuggestion()
        TextSuggestion.clearTimer()
    }

    _possibleSuggestion(){
        TextSuggestion.generateSuggestion(
            this._getTextBeforeCursor(100),
            10,
            this,
            this._checkSuggestionAppropriate,
            this._insertNonEditableElement)
    }

    _getTextBeforeCursor(x) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const writer = model.change(writer => writer);

        // Get the position of the cursor
        const position = selection.getFirstPosition();

        // Get the range from the start of the document to the cursor
        const range = writer.createRange(model.createPositionAt(model.document.getRoot(), 0), position);

        // Get the text in the range
        const text = Array.from(range.getWalker()).map(item => item.item.data).join('');

        // Return the last x characters
        return text.slice(-x);
    }

    _checkSuggestionAppropriate(){
        // Checking if at last position
        const selection = this.editor.model.document.selection;
        const root = this.editor.model.document.getRoot();

        // Check if the selection is collapsed (i.e., it is a caret, not a range).
        if (!selection.isCollapsed) {
            return false;
        }

        const lastBlock = Array.from(root.getChildren()).pop();
        const lastPositionInLastBlock = this.editor.model.createPositionAt(lastBlock, 'end');

        // Check if the selection is at the end of the last block.
        return selection.getFirstPosition().isEqual(lastPositionInLastBlock);
    }

    _insertNonEditableElement(text) {
        const root = this.editor.model.document.getRoot();
        const lastBlock = Array.from(root.getChildren()).pop();
        const lastPositionInLastBlock = this.editor.model.createPositionAt(lastBlock, 'end');

        // Insert the non-editable element at the end of the root.
        this.editor.model.change(writer => {
            this.currentlyWriting = true;
            // If there's an existing suggestion, remove it.
            if (this.suggestion) {
                writer.remove(writer.createRangeOn(this.suggestion));
            }

            // Create a new suggestion and insert it.
            this.suggestion = writer.createElement('NonEditableElement', {suggestion: text});
            writer.insert(this.suggestion, lastPositionInLastBlock, 1);

            // Move the cursor before the inserted element.
            writer.setSelection(this.suggestion, 'before');

            this.currentlyWriting = false;
        });
    }

    _removeExistingSuggestion() {
        if (this.currentlyWriting || !this.suggestion) return;
        // If there's an existing suggestion, remove it.
        this.editor.model.change(writer => {
            writer.remove(writer.createRangeOn(this.suggestion));
            this.suggestion = null;
        });
    }
}