import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { window } from "vscode";

function getCurrentOpenedFolder(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0].uri.fsPath;
  }
  return undefined;
}

async function getFilesInDirectory(dirPath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        return reject(err);
      }

      let filenames = files.filter((file) =>
        fs.statSync(path.join(dirPath, file)).isFile()
      );

      resolve(filenames);
    });
  });
}

export async function showQuickPick() {
  let folder = getCurrentOpenedFolder();
  if (folder === undefined) {
    window.showErrorMessage("Open a folder to use VSScope");
    return;
  }

  const filenames = await getFilesInDirectory(folder);

  const quickPickItems = filenames.map((file) => ({
    label: "$(file-text) " + file,
    description: "",
    fullPath: path.join(folder, file),
  }));

  const selectedFile = await window.showQuickPick(quickPickItems, {
    placeHolder: "File To Open",
  });

  if (selectedFile) {
    const document = await vscode.workspace.openTextDocument(
      selectedFile.fullPath
    );
    await vscode.window.showTextDocument(document, {
      preview: !vscode.workspace
        .getConfiguration("vsscope")
        .get<boolean>("openInNewEditor"),
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("vs-scope is activated");

  const disposable = vscode.commands.registerCommand(
    "vsscope.telescopeMenu",
    () => {
      showQuickPick();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
