const shell = require('shelljs')
const fs = require('fs');
const glob = require("glob")
const ncp = require('ncp').ncp;
const Path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer')

import {cyan, yellow, magenta, red, italic, bold} from 'colorette';
ncp.limit = 0;

var appName = ""
var packageName = ""

const confirmAnswerValidator = async (input) => {
	if (input.match(/^(?=.*[.])[a-z0-9_\.]+$/)) {
	   return true;
	}
	return 'This field should be lower case and at least one "."';
 };

 var questions = [
	{
		type: 'input',
		name: 'packagename',
		message: "Input your package name ex (com.wahyu.permadi) : ",
		validate: confirmAnswerValidator
	}
]

export function cli(args){
	initCliTitle()
 	appName = args.slice(2)[0]
	if(appName == null){
		return onError("Your app name should not empty !")
	}
	  
	inquirer.prompt(questions).then(answers => {
		packageName = answers['packagename']
		fetchGitRepo()
	})
}

function initCliTitle() {
	console.log(
		chalk.yellow(
		  figlet.textSync('AndroInit', { horizontalLayout: 'full' })
		)
	);
}
function fetchGitRepo(){
	shell.exec('git clone https://github.com/wahyupermadie/android-starterpack.git '+appName, function(code, stdout, stderr){
		console.log(bold(magenta("On progress "+stderr)));
		if(code == 0){
			deleteFolderRecursive(appName+'/.git')
			setupPackage()
		}
	})
}

function getFilesInDirectory(){
	var getDirectories = function (src, callback) {
		glob(src + '/**/*.*', callback);
	};
	getDirectories(appName, function (err, res) {
		if (err) {
			console.log('Error', err);
		} else {
			var paths = String(res).split(",")
			for(var i = 0; i < paths.length ; i++){
				renameFilesInDirectries(paths[i])
			}
			// buildProject()
		}
	});
}

function buildProject() {
	shell.exec(`cd ${answers['name']}`)
}

var newPath = ""
function setupPackage(){
	var path = packageName.split('.')
	for(var i=0; i<path.length; i++){
		newPath = newPath+'/'+path[i]
	}

	mkdirpath(appName+'/app/src/androidTest/java'+newPath, setupAndroidTestPackage)
}

function setupAndroidTestPackage(){
	console.log(cyan("Setup android test directory..."))
	ncp(appName+'/app/src/androidTest/java/com/godohdev/androidstarterkit', appName+'/app/src/androidTest/java'+newPath, function (err) {
		if (err) {
		 	console.log(bold(red("error copying directory")));
		}else{
			if(packageName.split('.')[0].toLowerCase() != "com"){
				deleteFolderRecursive(appName+'/app/src/androidTest/java/com')
			}else{
				deleteFolderRecursive(appName+'/app/src/androidTest/java/com/godohdev')
			}
			console.log(italic(yellow("done")))
			mkdirpath(appName+'/app/src/test/java'+newPath, setupTestPackage)
		}
	});
}

function setupTestPackage(){
	console.log(cyan("Setup test directory"))
	ncp(appName+'/app/src/test/java/com/godohdev/androidstarterkit', appName+'/app/src/test/java'+newPath, function (err) {
		if (err) {
			console.log(bold(red("error copying directory")));
		}else{
			if(packageName.split('.')[0].toLowerCase() != "com"){
				deleteFolderRecursive(appName+'/app/src/test/java/com')
			}else{
				deleteFolderRecursive(appName+'/app/src/test/java/com/godohdev')
			}
			console.log(italic(yellow("done")))
			mkdirpath(appName+'/app/src/main/java'+newPath, setupMainPackage)
		}
	});
}

function setupMainPackage(){
	console.log(cyan("Setup main directory"))
	ncp(appName+'/app/src/main/java/com/godohdev/androidstarterkit', appName+'/app/src/main/java'+newPath, function (err) {
		if (err) {
			console.log(bold(red("error copying directory")));
		}else{
			if(packageName.split('.')[0].toLowerCase() != "com"){
				deleteFolderRecursive(appName+'/app/src/main/java/com')
			}else{
				deleteFolderRecursive(appName+'/app/src/main/java/com/godohdev')
			}
			console.log(yellow("done", italic))
			getFilesInDirectory()
		}
	});
}

const deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach((file, index) => {
		const curPath = Path.join(path, file);
		if (fs.lstatSync(curPath).isDirectory()) { // recurse
			deleteFolderRecursive(curPath);
		} else { 
			fs.unlinkSync(curPath);
		}
		});
		fs.rmdirSync(path);
	}
};

// Create directory 
function mkdirpath(dirPath, func)
{
    fs.mkdir(dirPath, {recursive: true}, err => {
		if (err) 
			return console.log(err)
		else 
			func()
	})
}

function renameFilesInDirectries(res) {
	shell.sed('-i', 'com.godohdev.androidstarterkit', packageName, res);
	shell.sed('-i', 'Android Starter Kit', appName, res);
}

function onErr(err) {
    console.log(bold(red(err)));
    return 1;
}