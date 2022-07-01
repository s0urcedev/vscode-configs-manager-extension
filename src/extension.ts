import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as path from 'path';
import AdmZip = require('adm-zip');

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

	let installedVSCCM: boolean;

	try {
		execSync("vsccm");
		installedVSCCM = true;
	}
	catch {
		installedVSCCM = false;
	}

	let commndSetup = vscode.commands.registerCommand('vscode-configs-manager-extension.setup', () => {
		if (installedVSCCM) {
			vscode.window.showWarningMessage("VSCCM is already installed");
		}
		else {
			let zip: AdmZip = new AdmZip(`${path.resolve(__dirname, '..')}/base-build.zip`);
			zip.extractAllTo(process.cwd(), true);
			vscode.window.showInformationMessage("VSCCM installed");
			installedVSCCM = true;
		}
	});

	let commandList = vscode.commands.registerCommand('vscode-configs-manager-extension.list', () => {
		if (installedVSCCM) {
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
		}
		
	});

	let commandRemove = vscode.commands.registerCommand('vscode-configs-manager-extension.remove', () => {
		if (installedVSCCM) {
			if (vscode.workspace.workspaceFolders === undefined) {
				vscode.window.showErrorMessage("You haven't opened folder");
			}
			else {
				vscode.window.showInformationMessage(execSync(`vsccm remove --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString());	
			}
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});

	let commandClear = vscode.commands.registerCommand('vscode-configs-manager-extension.clear', () => {
		if (installedVSCCM) {
			if (vscode.workspace.workspaceFolders === undefined) {
				vscode.window.showErrorMessage("You haven't opened folder");
			}
			else {
				vscode.window.showInformationMessage(execSync(`vsccm clear --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString());	
			}
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});
	
	let commandInstallList = vscode.commands.registerCommand('vscode-configs-manager-extension.installList', () => {
		if (installedVSCCM) {
			vscode.window.showInformationMessage(`Your configs: ${getInstallList().join(", ")}`);
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});

	let install = vscode.commands.registerCommand('vscode-configs-manager-extension.install', () => {
		if (installedVSCCM) {
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
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});
	context.subscriptions.push(commndSetup);
	context.subscriptions.push(commandList);
	context.subscriptions.push(commandRemove);
	context.subscriptions.push(commandClear);
	context.subscriptions.push(commandInstallList);
	context.subscriptions.push(install);
}
export function deactivate() {}

