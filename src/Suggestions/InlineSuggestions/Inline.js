import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import NonEditableElement from "./NonEditableElement/NonEditableElement";
import TextSuggestion from "../TextSuggestion/TextSuggestion";
import Utils from "../utils";


export default class InlineSuggestion extends Plugin {
    static get requires() {
        return [NonEditableElement, TextSuggestion];
    }

    static get pluginName() {
        return 'InlineSuggestion';
    }

    init() {
        console.log('InlineSuggestion#init() got called');

        this.suggestion = null;
        this.currentlyWriting = false;

        this.editor.model.document.on('change:data', this._possibleSuggestion.bind(this));
        this.editor.model.document.selection.on('change:range', this._removeExistingSuggestion.bind(this));
    }

    _possibleSuggestion() {
        TextSuggestion.generateSuggestion(Utils._getTextBeforeCursor(this.editor, 100),
            1,
            10,
            Utils._checkSuggestionAppropriate.bind(null, this.editor),
            this._insertNonEditableElement.bind(this))
    }

    _insertNonEditableElement(input) {
        const text = input[0];
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