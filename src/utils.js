export default class Utils {
    static SuggestionsRemoved = 'suggestions_removed';
    static SuggestionsDisplayed = 'suggestions_displayed';
    static SuggestionInserted = 'suggestion_inserted';
    static TaskSelected = 'task_selected';

    static _checkSuggestionAppropriate(editor) {
        // Checking if at last position
        const selection = editor.model.document.selection;
        const root = editor.model.document.getRoot();

        // Check if the selection is collapsed (i.e., it is a caret, not a range).
        if (!selection.isCollapsed) {
            return false;
        }

        const lastBlock = Array.from(root.getChildren()).pop();
        const lastPositionInLastBlock = editor.model.createPositionAt(lastBlock, 'end');

        // Check if the selection is at the end of the last block.
        return selection.getFirstPosition().isEqual(lastPositionInLastBlock);
    }

    static _getTextBeforeCursor(editor, x=1000) {
        const model = editor.model;
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

    static _getTextAfterCursor(editor, x=1000) {
        const model = editor.model;
        const selection = model.document.selection;
        const writer = model.change(writer => writer);

        // Get the position of the cursor
        const position = selection.getLastPosition();

        // Get the range from the cursor to the end of the document
        const range = writer.createRange(position, model.createPositionAt(model.document.getRoot(), 'end'));

        // Get the text in the range
        const text = Array.from(range.getWalker()).map(item => item.item.data).join('');

        // Return the first x characters
        return text.slice(0, x);
    }

}