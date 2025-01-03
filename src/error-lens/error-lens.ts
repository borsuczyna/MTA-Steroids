import * as vscode from 'vscode';

interface ErrorLensMessage {
    range: vscode.Range;
    message: string;
    type: vscode.DiagnosticSeverity;
}

export class ErrorLens {
    private static diagnosticCollection: vscode.DiagnosticCollection;
    private static errors: Map<string, vscode.Diagnostic[]> = new Map();

    public static activate(): vscode.DiagnosticCollection {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('mtalua');

        return this.diagnosticCollection;
    }

    public static clearErrors(uri: vscode.Uri) {
        this.errors.delete(uri.fsPath);
        this.diagnosticCollection.delete(uri);
    }

    public static clearAllErrors() {
        this.errors.clear();
        this.diagnosticCollection.clear();
    }

    public static deactivate() {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
    }

    public static addError(uri: vscode.Uri, range: vscode.Range, message: string, type: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Error): vscode.Diagnostic {
        const diagnostic = new vscode.Diagnostic(range, message, type);

        if (!this.errors.has(uri.fsPath)) {
            this.errors.set(uri.fsPath, []);
        }

        let errors = this.errors.get(uri.fsPath);
        if (errors) {
            errors.push(diagnostic);
            this.diagnosticCollection.set(uri, errors);
        } else {
            this.diagnosticCollection.set(uri, [diagnostic]);
        }

        return diagnostic;
    }

    public static setErrors(uri: vscode.Uri, errors: ErrorLensMessage[]) {
        const diagnostics: vscode.Diagnostic[] = errors.map(error => {
            return new vscode.Diagnostic(error.range, error.message, error.type);
        });

        this.errors.set(uri.fsPath, diagnostics);
        this.diagnosticCollection.set(uri, diagnostics);
    }
}