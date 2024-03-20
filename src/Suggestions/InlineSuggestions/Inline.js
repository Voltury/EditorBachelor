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

        this.editor.model.document.on('change:data', () => {
            const changes = this.editor.model.document.differ.getChanges();

            if(this.suggestion){
                if(changes.length === 1 && changes[0].name === 'NonEditableElement' && changes[0].type === 'insert') {
                    return;
                }
                else if(changes.length === 1 && changes[0].name === 'NonEditableElement' && changes[0].type === 'remove'){
                    return;
                }
                else{
                    this._removeExistingSuggestion();
                }
            }
            this._possibleSuggestion.bind(this)();
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
        TextSuggestion.generateSuggestion(this.editor, Utils._getTextBeforeCursor(this.editor), 1, 10, Utils._checkSuggestionAppropriate.bind(null, this.editor), this._insertNonEditableElement.bind(this))
    }

    _insertNonEditableElement(input) {
        const text = input[0];
        const currentPosition = this.editor.model.document.selection.getFirstPosition();

        // Insert the non-editable element at the end of the root.
        this.editor.model.change(writer => {
            // Create a new suggestion and insert it.
            this.suggestion = writer.createElement('NonEditableElement', {suggestion: text});
            //writer.insert(this.suggestion, lastPositionInLastBlock, 1);
            writer.insert(this.suggestion, currentPosition);

            // Move the cursor before the inserted element.
            writer.setSelection(this.suggestion, 'before');

            this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": [text]})
        });
    }

    _removeExistingSuggestion() {
        // Clear the timer and cancel ongoing requests
        TextSuggestion.clearTimer();

        if (!this.suggestion) return;

        // If there's an existing suggestion, remove it.
        this.editor.model.change(writer => {
            writer.remove(this.suggestion);
            this.editor.fire(Utils.SuggestionsRemoved, {"suggestions": [this.suggestion.getAttribute('suggestion')]})
            this.suggestion = null;
        });
    }


    _replaceSuggestion() {
        const text = this.suggestion.getAttribute('suggestion');

        this._removeExistingSuggestion();
        const selection = this.editor.model.document.selection;
        const range = selection.getFirstPosition();
        this.editor.model.change(writer => {
            writer.insertText(text, range);
            // Move the cursor to the end of the inserted text
            const endPosition = range.getShiftedBy(text.length);
            writer.setSelection(endPosition);
        });
        this.editor.fire(Utils.SuggestionInserted, {"selected": text, "all": [text]})
    }
}