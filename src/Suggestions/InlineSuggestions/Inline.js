import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {keyCodes} from "@ckeditor/ckeditor5-utils";

import NonEditableElement from "./NonEditableElement/NonEditableElement";
import TextSuggestion from "../TextSuggestion/TextSuggestion";
import Utils from "../../utils";


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

        this.editor.model.document.on('change:data', () => {
            this._possibleSuggestion.bind(this)();
        });
        this.editor.model.document.selection.on('change:range', () => {
            this._removeExistingSuggestion.bind(this)();
        });
        // Add a keydown event listener to the editor.
        this.editor.editing.view.document.on('keydown', (evt, data) => {
            // Check if the pressed key is 'Tab'.
            if (data.keyCode === keyCodes.tab) {
                // Check if there is a suggestion currently displayed.
                if (this.suggestion) {
                    // Prevent the default action.
                    data.preventDefault();
                    evt.stop();

                    // Remove the suggestion and replace it with normal text.
                    this._replaceSuggestion();
                }
            }
        });
    }

    _possibleSuggestion() {
        if(this.currentlyWriting) return;
        TextSuggestion.generateSuggestion(this.editor, Utils._getTextBeforeCursor(this.editor), 1, 10, Utils._checkSuggestionAppropriate.bind(null, this.editor), this._insertNonEditableElement.bind(this))
    }

    _insertNonEditableElement(input) {
        const text = input[0];
        const root = this.editor.model.document.getRoot();
        const lastBlock = Array.from(root.getChildren()).pop();
        //const lastPositionInLastBlock = this.editor.model.createPositionAt(lastBlock, 'end');
        const currentPosition = this.editor.model.document.selection.getFirstPosition();

        // Insert the non-editable element at the end of the root.
        this.editor.model.change(writer => {
            this.currentlyWriting = true;
            // If there's an existing suggestion, remove it.
            if (this.suggestion) {
                writer.remove(writer.createRangeOn(this.suggestion));
            }

            // Create a new suggestion and insert it.
            this.suggestion = writer.createElement('NonEditableElement', {suggestion: text});
            //writer.insert(this.suggestion, lastPositionInLastBlock, 1);
            writer.insert(this.suggestion, currentPosition);

            // Move the cursor before the inserted element.
            writer.setSelection(this.suggestion, 'before');

            this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": [text]})
            this.currentlyWriting = false;
        });
    }

    _removeExistingSuggestion() {
        // Clear the timer and cancel ongoing requests
        TextSuggestion.clearTimer();

        if (this.currentlyWriting || !this.suggestion) return;
        console.log("removing suggestion");
        console.log(Utils._getTextBeforeCursor(this.editor, 10))

        this.currentlyWriting = true;
        // If there's an existing suggestion, remove it.
        this.editor.model.change(writer => {
            // Save the current position of the selection
            const currentPosition = this.editor.model.document.selection.getFirstPosition();

            // Calculate the offset from the start of the suggestion to the current cursor position
            const offset = currentPosition.offset - this.suggestion.parent.maxOffset;
            console.log(offset);
            // Create a new position at the start of the suggestion plus the offset
            const newPosition = this.editor.model.createPositionAt(this.editor.model.createPositionBefore(this.suggestion), offset); // -2 == double with of non-editable element
            console.log(newPosition);
            console.log(this.editor.model.createPositionBefore(this.suggestion));

            writer.remove(this.suggestion);
            this.editor.fire(Utils.SuggestionsRemoved, {"suggestions": [this.suggestion.getAttribute('suggestion')]})
            this.suggestion = null;

            // Set the selection to the new position
            writer.setSelection( newPosition );
        });
        this.currentlyWriting = false;
    }


    _replaceSuggestion() {
        const text = this.suggestion.getAttribute('suggestion');

        this._removeExistingSuggestion();
        this.currentlyWriting = true;

        const selection = this.editor.model.document.selection;
        const range = selection.getFirstPosition();
        this.editor.model.change(writer => {
            writer.insertText(text, range);
            // Move the cursor to the end of the inserted text
            const endPosition = range.getShiftedBy(text.length);
            writer.setSelection(endPosition);
        });
        this.editor.fire(Utils.SuggestionInserted, {"selected": text, "all": [text]})

        this.currentlyWriting = false;
    }
}