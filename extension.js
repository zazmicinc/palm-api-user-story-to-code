const vscode = require("vscode");
const FileUtils = require("./utils/FileUtils");
const CodeGenerator = require("./utils/CodeGenerator");

async function generateCodeFromFile(
  fileName,
  selectedText,
  language,
  framework
) {
  const generatedCode = await CodeGenerator.generate(
    selectedText,
    language,
    framework
  );
  if (generatedCode === undefined) {
    return;
  }
  FileUtils.createFile(fileName, generatedCode);
}

async function generateCodeFromEditor(language, framework) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return; // No open text editor
  }

  //const selection = editor.selection;
  const selectedText = editor.document.getText(); //.getText(selection);
  const fileName = editor.document.fileName;

  await generateCodeFromFile(fileName, selectedText, language, framework);
}

function activate(context) {
  const disposable = vscode.commands.registerCommand(
    "palm-api-user-story-to-code.Generate",
    async () => {
      let language = context.workspaceState.get(
        "palm-api-user-story-to-code.Language"
      );
      let framework = context.workspaceState.get(
        "palm-api-user-story-to-code.Framework"
      );

      language = await vscode.window.showInputBox({
        prompt: "Enter the development language (optional)",
        placeHolder: "e.g., JavaScript, Python, Java...",
        value: language,
      });

      framework = await vscode.window.showInputBox({
        prompt: "Enter the development framework (optional)",
        placeHolder: "e.g., React, Django, Spring...",
        value: framework,
      });

      context.workspaceState.update(
        "palm-api-user-story-to-code.Language",
        language
      );
      context.workspaceState.update(
        "palm-api-user-story-to-code.Framework",
        framework
      );

      return new Promise((resolve) => {
        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Generating Code ...",
            cancellable: true,
          },
          async (progress, token) => {
            await generateCodeFromEditor(language, framework);
            resolve();
          }
        );
      });
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
