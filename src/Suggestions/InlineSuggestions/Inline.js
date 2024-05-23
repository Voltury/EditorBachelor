import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {keyCodes} from "@ckeditor/ckeditor5-utils";

import NonEditableElement from "./NonEditableElement/NonEditableElement";
import TextSuggestion from "../TextSuggestion/TextSuggestion";
import Utils from "../../utils";
import ModalPlugin from "../../Modal/Modal";


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

        // Trigger suggestions
        this.editor.model.document.registerPostFixer( writer => {
            if(this.suggestion) {
                const changes = this.editor.model.document.differ.getChanges();

                if (changes.length === 1 && changes[0].name === 'NonEditableElement') {
                    return;
                }

                // change of selection
                if(changes.length === 0){
                    return;
                }

                for ( const entry of changes ) {
                    if ( entry.type === 'insert' && entry.name === '$text' ) {
                        // when creating a new paragraph, entry.position.textNode is empty
                        let text = null;
                        if(entry.position.textNode === null && entry.position.nodeAfter !== null){
                            text =  entry.position.nodeAfter.data[entry.position.offset]
                        }
                        else{
                            text = entry.position.textNode.data[entry.position.offset]
                        }

                        if(text === ' '){
                            return;
                        }
                    }
                }
                this._removeExistingSuggestion();
            }
            this._possibleSuggestion.bind(this)();
        } );

        this.editor.model.document.selection.on('change', () => {
            TextSuggestion.clearTimer();
        });

        // Add a keydown event listener to the editor.
        this.editor.editing.view.document.on('keydown', (evt, data) => {
            // Check if the pressed key is 'Tab'.
            if (data.keyCode === keyCodes.tab) {
                // Prevent the default action.
                data.preventDefault();
                evt.stop();
                // Check if there is a suggestion currently displayed.
                if (this.suggestion) {
                    // Remove the suggestion and replace it with normal text.
                    this._replaceSuggestion();
                }
            }
        });
    }

    _possibleSuggestion() {
        const task = this.editor.plugins.get(ModalPlugin.pluginName).get_current_task();
        if(!task){
            return;
        }

        const prompt = [{"role": "system",
            "content": `You are a smart text completion tool that helps the user to write a blogpost about the following topic: ${task}`},
            {"role": "user", "content": `Continue the text: ${Utils._getTextBeforeCursor(this.editor)}`}]

        TextSuggestion.generateSuggestion(
            prompt,
            1,
            () => {return true},
            this._insertNonEditableElement.bind(this))
    }

    _insertNonEditableElement(input) {
        const text = input[0];
        const currentPosition = this.editor.model.document.selection.getFirstPosition();

        // Insert the non-editable element at the end of the root.
        this.editor.model.change(writer => {
            // Create a new suggestion and insert it.
            this.suggestion = writer.createElement('NonEditableElement', {suggestion: text});
            writer.insert(this.suggestion, currentPosition);

            // Move the cursor before the inserted element.
            writer.setSelection(this.suggestion, 'before');

            this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": [text]})
        });

        // After the change has been applied, get the view element and log the bounding box.
        const viewElement = this.editor.editing.mapper.toViewElement(this.suggestion);
        const domElement = this.editor.editing.view.domConverter.mapViewToDom(viewElement);
        if (domElement) {
            const rect = domElement.getBoundingClientRect();
            this.editor.fire(Utils.ElementPosition, {"source": "inline_suggestion", "bounding_box": rect, "window": window, "suggestion": text})
        }
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