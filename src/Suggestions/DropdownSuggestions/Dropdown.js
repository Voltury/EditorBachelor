import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import TextSuggestion from "../TextSuggestion/TextSuggestion";
import DropdownElement from "./DropdownElement/DropdownElement";
import Utils from "../utils";

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
        this.currentlyWriting = false;

        // Trigger suggestions
        this.editor.model.document.on('change:data', this._possibleSuggestion.bind(this));
        this.editor.model.document.selection.on('change:range', this._removeDropdown.bind(this));

        editor.on('ready', () => {
            this.dropdownElement = new DropdownElement();
        });
    }

    _possibleSuggestion() {
        if (this.currentlyWriting) return;
        TextSuggestion.generateSuggestion(Utils._getTextBeforeCursor(this.editor),
            3,
            10,
            Utils._checkSuggestionAppropriate.bind(null, this.editor),
            this._insertDropdown.bind(this))
    }

    _insertDropdown(suggestions) {
        // Get the current selection.
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Get the bounding rectangle of the current selection.
        const rect = selection.getRangeAt(0).getBoundingClientRect();

        // Add the dropdown to the document at the position of the selection.
        this.dropdownElement.addSuggestions(suggestions, this._addToText.bind(this));
        this.dropdownElement.addToDocument(rect.left, rect.bottom);
        this.dropdownShow = true;
        this.editor.fire(Utils.SuggestionsDisplayed, {"suggestions": suggestions})
    }

    _removeDropdown() {
        TextSuggestion.clearTimer();
        if (!this.dropdownShow) return;

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
        this.currentlyWriting = true;
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

        this.currentlyWriting = false;
        // Set focus back to the text field
        this.editor.editing.view.focus();
    }
}
