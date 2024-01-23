import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "shka-expand" is now active!');

    // This is the existing 'Hello World' command
    let helloWorldDisposable = vscode.commands.registerCommand('shka-expand.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from shka_expand!!!');
    });

    // This is the new command for collapsing rows with the [x] pattern

    let collapseRowsDisposable = vscode.commands.registerCommand('shka-expand.collapseRowsWithPattern', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor to collapse rows in');
            return;
        }

        // Save the current cursor position and visible range
        const currentCursorPosition = editor.selection.active;
        const currentVisibleRanges = editor.visibleRanges;

        const document = editor.document;
        const linesToCollapse: number[] = [];

        for (let line = 0; line < document.lineCount; line++) {
            const lineText = document.lineAt(line).text;
            if (lineText.includes('[x]')) {
                linesToCollapse.push(line);
            }
        }

        // Fold the regions
        await editor.edit(editBuilder => {
            linesToCollapse.forEach(line => {
                editor.selection = new vscode.Selection(line, 0, line, 0);
                vscode.commands.executeCommand('editor.fold');
            });
        });

        // After all folds are done, restore the cursor position and visible range
        editor.selection = new vscode.Selection(currentCursorPosition, currentCursorPosition);
        editor.revealRange(currentVisibleRanges[0], vscode.TextEditorRevealType.AtTop);

    });

    // Push both commands to the subscriptions
    context.subscriptions.push(helloWorldDisposable, collapseRowsDisposable);
}

export function deactivate() {}
