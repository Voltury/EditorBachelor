import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import SidebarSuggestion from "../SidebarSuggestions/Sidebar";
import InlineSuggestion from "../InlineSuggestions/Inline";

export default class PluginSwitcher extends Plugin {
    static get requires(){
        return [InlineSuggestion, SidebarSuggestion]
    }

    constructor(editor) {
        super(editor);
        this.currentPlugin = 'none'; // Can be 'none', 'inline', or 'sidebar'
        this.inlinePlugin = null;
        this.sidebarPlugin = null;
    }

    static get pluginName() {
        return 'PluginSwitcher';
    }

    static get buttonName(){
        return 'pluginSwitcher';
    }

    init() {
        console.log('PluginSwitcher#init() got called');
        this.inlinePlugin = this.editor.plugins.get(InlineSuggestion.pluginName);
        this.sidebarPlugin = this.editor.plugins.get(SidebarSuggestion.pluginName);

        this.editor.ui.componentFactory.add(PluginSwitcher.buttonName, locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Toggle Plugins',
                tooltip: true
            });

            // Callback executed once the button is clicked.
            view.on('execute', () => {
                this.switchPlugin();
            });

            return view;
        });
    }

    switchPlugin() {
        switch (this.currentPlugin) {
            case 'none':
                // Enable the inline plugin
                this.inlinePlugin.enablePlugin();
                this.currentPlugin = 'inline';
                break;
            case 'inline':
                // Disable the inline plugin and enable the sidebar plugin
                this.inlinePlugin.disablePlugin();
                this.sidebarPlugin.enablePlugin();
                this.currentPlugin = 'sidebar';
                break;
            case 'sidebar':
                // Disable the sidebar plugin
                this.sidebarPlugin.disablePlugin();
                this.currentPlugin = 'none';
                break;
        }
    }
}
