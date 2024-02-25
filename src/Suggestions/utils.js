export default class Utils {
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

    static _getTextBeforeCursor(editor, x) {
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
}