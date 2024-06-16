import * as fs from "fs";
import ignore from "ignore";
import * as path from "path";
import { promisify } from "util";
import * as vscode from "vscode";
import { window } from "vscode";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

function getCurrentOpenedFolder(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0].uri.fsPath;
  }
  return undefined;
}

async function getAllFiles(dir: string): Promise<string[]> {
  const ig = ignore();
  const gitignorePath = path.join(dir, ".gitignore");

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = await readFile(gitignorePath, "utf8");
    ig.add(gitignoreContent);
    let ignore_rules = vscode.workspace
      .getConfiguration("vsscope")
      .get<Array<string>>("ignore");

    ignore_rules?.forEach((rule) => {
      ig.add(rule);
    });
  }

  let results: string[] = [];
  const list = await readdir(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(dir, filePath);

    if (ig.ignores(relativePath)) {
      continue; // Ignore files/folders specified in .gitignore
    }

    const fileStat = await stat(filePath);

    if (fileStat && fileStat.isDirectory()) {
      const res = await getAllFiles(filePath);
      results = results.concat(res);
    } else {
      results.push(filePath);
    }
  }

  return results;
}

export async function showQuickPick() {
  let folder = getCurrentOpenedFolder();
  if (folder === undefined) {
    window.showErrorMessage("Open a folder to use VSScope");
    return;
  }

  const filenames = await getAllFiles(folder);

  const quickPickItems = filenames.map((file) => ({
    label: "$(file-text) " + path.relative(folder, file),
    description: "",
    fullPath: path.join(folder, file),
  }));

  const selectedFile = await window.showQuickPick(quickPickItems, {
    placeHolder: "Select a file to open",
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
