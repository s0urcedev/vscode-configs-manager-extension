import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as path from 'path';
import AdmZip = require('adm-zip');

function getList(installedVSCCMUbuntuLocally: boolean): string[] | undefined {
	if (vscode.workspace.workspaceFolders === undefined) {
		return undefined;
	}
	let stdoutText: string = execSync(`${installedVSCCMUbuntuLocally ? "./" : ""}vsccm list --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString();	
	let list: string[] = stdoutText.split("\n").filter(x => x[0] === "|").map(x => x.slice(2, x[x.length - 1] === "\r" ? x.length - 1 : x.length));
	return list;
}

function getInstallList(installedVSCCMUbuntuLocally: boolean): string[] {
	let stdoutText: string = execSync(`${installedVSCCMUbuntuLocally ? "./" : ""}vsccm install list`).toString();	
	let list: string[] = stdoutText.split("\n").filter(x => x[0] === "|").map(x => x.slice(2, x[x.length - 1] === "\r" ? x.length - 1 : x.length));
	return list;
}

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vscode-configs-manager-extension" is now active!');

	let installedVSCCM: boolean;
	let installedVSCCMUbuntuLocally: boolean;

	try {
		execSync("vsccm");
		installedVSCCM = true;
	}
	catch {
		installedVSCCM = false;
	}

	if (!installedVSCCM){
		try {
			execSync("./vsccm");
			installedVSCCMUbuntuLocally = true;
		}
		catch {
			installedVSCCMUbuntuLocally = false;
		}
	}

	let commndSetup = vscode.commands.registerCommand('vscode-configs-manager-extension.setup', () => {
		if (installedVSCCM || installedVSCCMUbuntuLocally) {
			vscode.window.showWarningMessage("VSCCM is already installed");
		}
		else {
			let zip: AdmZip = new AdmZip(`${path.resolve(__dirname, '..')}/base-build.zip`);
			zip.extractAllTo(process.cwd(), true);
			vscode.window.showInformationMessage("VSCCM installed");
			if (process.platform === 'win32') {
				installedVSCCM = true;
			}
			else {
				installedVSCCMUbuntuLocally = true;
			}
		}
	});

	let commandList = vscode.commands.registerCommand('vscode-configs-manager-extension.list', () => {
		if (installedVSCCM || installedVSCCMUbuntuLocally) {
			let list: string[] | undefined = getList(installedVSCCMUbuntuLocally);
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
		if (installedVSCCM || installedVSCCMUbuntuLocally) {
			if (vscode.workspace.workspaceFolders === undefined) {
				vscode.window.showErrorMessage("You haven't opened folder");
			}
			else {
				vscode.window.showInformationMessage(execSync(`${installedVSCCMUbuntuLocally ? "./" : ""}vsccm remove --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString());	
			}
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});

	let commandClear = vscode.commands.registerCommand('vscode-configs-manager-extension.clear', () => {
		if (installedVSCCM || installedVSCCMUbuntuLocally) {
			if (vscode.workspace.workspaceFolders === undefined) {
				vscode.window.showErrorMessage("You haven't opened folder");
			}
			else {
				vscode.window.showInformationMessage(execSync(`${installedVSCCMUbuntuLocally ? "./" : ""}vsccm clear --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath}`).toString());	
			}
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});
	
	let commandInstallList = vscode.commands.registerCommand('vscode-configs-manager-extension.installList', () => {
		if (installedVSCCM || installedVSCCMUbuntuLocally) {
			vscode.window.showInformationMessage(`Your configs: ${getInstallList(installedVSCCMUbuntuLocally).join(", ")}`);
		}
		else {
			vscode.window.showErrorMessage("VSCCM is not installed");
			vscode.window.showInformationMessage('Use command "Setup VSCCM" to install VSCCM');
		}
	});

	let install = vscode.commands.registerCommand('vscode-configs-manager-extension.install', () => {
		if (installedVSCCM || installedVSCCMUbuntuLocally) {
			if (vscode.workspace.workspaceFolders === undefined) {
				vscode.window.showErrorMessage("You haven't opened folder");
			}
			else {
				let options: vscode.QuickPickItem[] = getInstallList(installedVSCCMUbuntuLocally).map((label: string) => ({label}));
				let quickPick: vscode.QuickPick<vscode.QuickPickItem> = vscode.window.createQuickPick();
				quickPick.items = options;
				quickPick.onDidChangeSelection(([{label}]) => {
					quickPick.hide();
					if (vscode.workspace.workspaceFolders === undefined) {
						vscode.window.showErrorMessage("You haven't opened folder");
					}
					else {
						let stdoutText: string = execSync(`${installedVSCCMUbuntuLocally ? "./" : ""}vsccm install --workfolder=${vscode.workspace.workspaceFolders[0].uri.fsPath} ${label}`).toString();
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

