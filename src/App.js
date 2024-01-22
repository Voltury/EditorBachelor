import {ClassicEditor} from '@ckeditor/ckeditor5-editor-classic';
import {Bold, Italic} from '@ckeditor/ckeditor5-basic-styles';
import {Essentials} from '@ckeditor/ckeditor5-essentials';
import {Heading} from '@ckeditor/ckeditor5-heading';
import {List} from '@ckeditor/ckeditor5-list';
import {Paragraph} from '@ckeditor/ckeditor5-paragraph';

import PluginManager from "./PluginManager/PluginManager";
import InlineSuggestion from "./InlineSuggestions/Inline";
import SidebarSuggestion from "./SidebarSuggestions/Sidebar";

function beforeUnloadHandler(e) {
    e.preventDefault();
    e.returnValue = '';
}

window.addEventListener('beforeunload', beforeUnloadHandler);


ClassicEditor
    .create(document.querySelector('#editor'), {
        plugins: [Essentials, Paragraph, Heading, List, Bold, Italic, InlineSuggestion, SidebarSuggestion, PluginManager],
        toolbar: ['heading', 'bold', 'italic', 'numberedList', 'bulletedList', PluginManager.buttonName]
    })
    .then(editor => {
        console.log('Editor was initialized', editor);

        // Expose for playing in the console.
        window.editor = editor;
    })
    .catch(error => {
        console.error(error.stack);
    });
