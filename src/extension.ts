import * as vscode from 'vscode';
import { execSync } from 'child_process';

function getList(): string[] | undefined {
	if (vscode.workspace.workspaceFolders === undefined) {
		return undefined;
	}
	let stdoutText: string = execSync(`vsccm list --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString();	
	let list: string[] = stdoutText.split("\n").filter(x => x[0] === "|").map(x => x.slice(2, x[x.length - 1] === "\r" ? x.length - 1 : x.length));
	return list;
}

function getInstallList(): string[] {
	let stdoutText: string = execSync("vsccm install list").toString();	
	let list: string[] = stdoutText.split("\n").filter(x => x[0] === "|").map(x => x.slice(2, x[x.length - 1] === "\r" ? x.length - 1 : x.length));
	return list;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-configs-manager-extension" is now active!');
	
	let commandList = vscode.commands.registerCommand('vscode-configs-manager-extension.list', () => {
		let list: string[] | undefined = getList();
		if (list === undefined) {
			vscode.window.showErrorMessage("You haven't opened folder");
		}
		else if (list.length === 0){
			vscode.window.showInformationMessage("You haven't installed any configs");
		}
		else {
			vscode.window.showInformationMessage(`Installed configs: ${list.join(", ")}`);
		}
	});

	let commandRemove = vscode.commands.registerCommand('vscode-configs-manager-extension.remove', () => {
		if (vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showErrorMessage("You haven't opened folder");
		}
		else {
			vscode.window.showInformationMessage(execSync(`vsccm remove --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString());	
		}
	});

	let commandClear = vscode.commands.registerCommand('vscode-configs-manager-extension.clear', () => {
		if (vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showErrorMessage("You haven't opened folder");
		}
		else {
			vscode.window.showInformationMessage(execSync(`vsccm clear --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString());	
		}
	});
	
	let commandInstallList = vscode.commands.registerCommand('vscode-configs-manager-extension.installList', () => {
		vscode.window.showInformationMessage(`Your configs: ${getInstallList().join(", ")}`);
	});

	let install = vscode.commands.registerCommand('vscode-configs-manager-extension.install', () => {
		if (vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showErrorMessage("You haven't opened folder");
		}
		else {
			let options: vscode.QuickPickItem[] = getInstallList().map((label: string) => ({label}));
			let quickPick: vscode.QuickPick<vscode.QuickPickItem> = vscode.window.createQuickPick();
			quickPick.items = options;
			quickPick.onDidChangeSelection(([{label}]) => {
				quickPick.hide();
				if (vscode.workspace.workspaceFolders === undefined) {
					vscode.window.showErrorMessage("You haven't opened folder");
				}
				else {
					let stdoutText: string = execSync(`vsccm install --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath} ${label}`).toString();
					for (let text of stdoutText.split("\n")) {
						vscode.window.showInformationMessage(text);
					}
				}
			});
			quickPick.show();
		}
	});
	context.subscriptions.push(commandList);
	context.subscriptions.push(commandRemove);
	context.subscriptions.push(commandClear);
	context.subscriptions.push(commandInstallList);
	context.subscriptions.push(install);
}
export function deactivate() {}

