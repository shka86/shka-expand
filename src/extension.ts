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

    // -----------------------------------

    let sortChunksDisposable = vscode.commands.registerCommand('shka-expand.sortChunks', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor to sort chunks in');
            return;
        }

        const document = editor.document;
        const fullText = document.getText();

        // Split the document into chunks
        const allChunks = fullText.split('## [');

        // Separate the chunks into header, chunk1, and chunk2 based on the starting character after '## ['
        let headerChunk = '';
        let chunk1: string[] = [];
        let chunk2: string[] = [];

        allChunks.forEach((chunk, index) => {
            if (index === 0 && !chunk.startsWith('x]') && !chunk.match(/^\w+\]/)) {
                // Header: the very first chunk if it's not starting with 'x]' or a word character followed by ']'
                headerChunk = chunk.trimEnd() + '\n'; // Ensure the header ends with exactly one newline
            } else if (chunk.startsWith('x]')) {
                chunk2.push(chunk);
            } else if (chunk.startsWith(']')) { // Chunk1: starts with any word character followed by ']'
                chunk1.push(chunk);
            }
        });

        // Sort chunk1 and chunk2 in reversed order
        chunk1.sort((a, b) => b.localeCompare(a));
        chunk2.sort((a, b) => b.localeCompare(a));

// Prepend '## [' to each sorted chunk and ensure it ends with exactly one newline
        const processChunks = (chunks: string[]) => chunks.map(chunk => {
            chunk = '## [' + chunk.trimEnd();
            chunk += '\n\n'; // Append exactly one newline
            return chunk;
        }).join('');


        // Concatenate header, chunk1, and chunk2
        const sortedText = headerChunk + processChunks(chunk1) + processChunks(chunk2);

        // Replace the entire content of the document with the sorted text
        editor.edit(editBuilder => {
            const entireRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(fullText.length)
            );
            editBuilder.replace(entireRange, sortedText);
        });
    });

    context.subscriptions.push(sortChunksDisposable);

}

export function deactivate() { }
