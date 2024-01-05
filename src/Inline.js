import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class TextSuggestionPlugin extends Plugin {
    init() {
        console.log('inline plugin got called');
        const editor = this.editor

        this.editor.model.document.on('change:data', () => {
            console.log('The data has changed2!');

        });
    }
}