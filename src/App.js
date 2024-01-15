import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';

import InlineSuggestions from "./Inline/Inline";

ClassicEditor
    .create( document.querySelector( '#editor' ), {
        plugins: [ Essentials, Paragraph, Heading, List, Bold, Italic, InlineSuggestions],
        toolbar: [ 'heading', 'bold', 'italic', 'numberedList', 'bulletedList' ]
    } )
    .then( editor => {
        console.log( 'Editor was initialized', editor );

        // Expose for playing in the console.
        window.editor = editor;
    } )
    .catch( error => {
        console.error( error.stack );
    } );
