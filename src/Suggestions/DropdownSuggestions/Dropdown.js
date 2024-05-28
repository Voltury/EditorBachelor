import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import DropdownElement from "./DropdownElement/DropdownElement";
import Utils from "../../utils";
import ModalPlugin from "../../Modal/Modal";
import {keyCodes} from "@ckeditor/ckeditor5-utils";

export default class DropdownSuggestion extends Plugin {
    static get requires() {
        return [TextSuggestion];
    }

    static get pluginName() {
        return 'DropdownSuggestion';
    }

    init() {
        const editor = this.editor;
        this.dropdownShow = false;
        this.selectedIndex = 0;

        // Trigger suggestions
        this.editor.model.document.registerPostFixer( writer => {
            if(this.dropdownShow) {
                const changes = this.editor.model.document.differ.getChanges();

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
                this._removeDropdown();
            }
            this._possibleSuggestion.bind(this)();
        } );

        this.editor.model.document.selection.on('change', () => {
            TextSuggestion.clearTimer();
        });


        editor.on('ready', () => {
            this.dropdownElement = new DropdownElement();

            // Add these lines
            this.editor.editing.view.document.on('keydown', (event, data) => {
                if (data.keyCode === keyCodes.tab) {
                    data.preventDefault();
                    event.stop();
                }

                if (!this.dropdownShow) return;

                switch (data.keyCode) {
                    case keyCodes.arrowup:
                        data.preventDefault();
                        if(this.dropdownElement.mouseHover) return;
                        this.selectedIndex = (this.selectedIndex - 1 + this.dropdownElement.suggestionList.children.length) % this.dropdownElement.suggestionList.children.length
                        break;
                    case keyCodes.arrowdown: case keyCodes.tab:
                        data.preventDefault();
                        if(this.dropdownElement.mouseHover) return;
                        this.selectedIndex = (this.selectedIndex + 1) % this.dropdownElement.suggestionList.children.length;
                        break;
                    case keyCodes.enter:
                        // TODO: This only works when a suggestion is displayed!!!
                        if (!data.shiftKey) {
                            data.preventDefault();
                            this._addToText(this.dropdownElement.suggestionList.children[this.selectedIndex].textContent);
                        }
                        return;
                    default:
                        return;
                }

                // Highlight the selected suggestion
                for (const child of this.dropdownElement.suggestionList.children) {
                    child.classList.remove('selected');
                }
                this.dropdownElement.suggestionList.children[this.selectedIndex].classList.add('selected');
            });
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
            3,
            () => {return true},
            this._insertDropdown.bind(this))
    }

    _insertDropdown(suggestions) {
        // Get the current selection.
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Get the bounding rectangle of the current selection.
        let rect;
        if (selection.isCollapsed) {
            // Create a temporary node at the selection.
            const range = selection.getRangeAt(0).cloneRange();
            const tempNode = document.createElement('span');
            tempNode.appendChild(document.createTextNode('\u200B'));
            range.insertNode(tempNode);

            // Get the bounding rectangle of the temporary node.
            rect = tempNode.getBoundingClientRect();

            // Remove the temporary node.
            tempNode.parentNode.removeChild(tempNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            rect = selection.getRangeAt(0).getBoundingClientRect();
        }

        // Add the dropdown to the document at the position of the selection.
        this.dropdownElement.addSuggestions(suggestions, this._addToText.bind(this));
        this.dropdownElement.addToDocument(rect.left, rect.bottom);
        this.dropdownShow = true;
        this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": suggestions})

        // After the change has been applied, get the view element and log the bounding box.
        for (const child of this.dropdownElement.suggestionList.children) {
            const rect = child.getBoundingClientRect();
            this.editor.fire(Utils.ElementPosition, {"source": "dropdown_suggestion", "bounding_box": rect, "window": window, "suggestion": child.textContent})
        }
    }

    _removeDropdown() {
        TextSuggestion.clearTimer();
        if (!this.dropdownShow) return;
        this.selectedIndex = 0;

        this.dropdownElement.removeFromDocument();
        this.dropdownShow = false;

        let suggestions = [];
        for(const child of this.dropdownElement.suggestionList.children) {
            suggestions.push(child.textContent);
        }

        this.dropdownElement.clearSuggestions()

        this.editor.fire(Utils.SuggestionsRemoved, {"suggestions": suggestions})
    }

    _addToText(suggestion) {
        const selection = this.editor.model.document.selection;
        const range = selection.getFirstPosition();
        this.editor.model.change(writer => {
            writer.insertText(suggestion, range);
            // Move the cursor to the end of the inserted text
            const endPosition = range.getShiftedBy(suggestion.length);
            writer.setSelection(endPosition);
        });

        let suggestions = [];
        for(const child of this.dropdownElement.suggestionList.children) {
            suggestions.push(child.textContent);
        }
        this.editor.fire(Utils.SuggestionInserted, {"selected": suggestion, "all": suggestions})

        // Set focus back to the text field
        this.editor.editing.view.focus();
    }
}
