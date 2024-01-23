import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "shka-expand" is now active!');

    // This is the existing 'Hello World' command
    let helloWorldDisposable = vscode.commands.registerCommand('shka-expand.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from shka_expand!!!');
    });

    // This is the new command for collapsing rows with the [x] pattern
    let collapseRowsDisposable = vscode.commands.registerCommand('shka-expand.collapseRowsWithPattern', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor to collapse rows in');
            return;
        }

        const document = editor.document;
        const linesToCollapse: number[] = [];

        for (let line = 0; line < document.lineCount; line++) {
            const lineText = document.lineAt(line).text;
            if (lineText.includes('[x]')) {
                linesToCollapse.push(line);
            }
        }

        // Fold the regions
        editor.edit(() => {
            linesToCollapse.forEach(line => {
                editor.selection = new vscode.Selection(line, 0, line, 0);
                vscode.commands.executeCommand('editor.fold');
            });
        });
    });

    // Push both commands to the subscriptions
    context.subscriptions.push(helloWorldDisposable, collapseRowsDisposable);
}

export function deactivate() {}
