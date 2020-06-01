const shell = require('shelljs')
const prompt = require('prompt');
const fs = require('fs');
const glob = require("glob")
const ncp = require('ncp').ncp;
const Path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
import {cyan, yellow, magenta, red, italic, bold} from 'colorette';
ncp.limit = 0;

var appName = ""
var packageName = ""

const properties = [
    {
        name: 'packagename',
        validator: /^(?=.*[.])[a-z0-9_\.]+$/,
        warning: 'This field should be lower case and at least one "."'
    }
];

export function cli(args){
	initCliTitle()
 	appName = args.slice(2)[0]
	if(appName == null){
		return onError("Your app name should not empyt !")
	}
	prompt.start();
	prompt.get(properties, function (err, result) {
		if (err) { return onErr(err); }
		packageName = result.packagename
		fetchGitRepo()
	});
}

function initCliTitle() {
	console.log(
		chalk.yellow(
		  figlet.textSync('AndroInit', { horizontalLayout: 'full' })
		)
	);
}
function fetchGitRepo(){
	shell.exec('git clone https://github.com/wahyupermadie/android-starterpack.git', function(code, stdout, stderr){
		console.log(bold(magenta("On progress "+stderr)));
		if(code == 0){
			deleteFolderRecursive("android-starterpack/.git")
			getFilesInDirectory()
		}
	})
}

function getFilesInDirectory(){
	var getDirectories = function (src, callback) {
		glob(src + '/**/*.*', callback);
	};
	getDirectories('android-starterpack', function (err, res) {
		if (err) {
			console.log('Error', err);
		} else {
			var paths = String(res).split(",")
			for(var i = 0; i < paths.length ; i++){
				renameFilesInDirectries(paths[i])
			}
			setupPackage()
		}
	});
}

var newPath = ""
function setupPackage(){
	var path = packageName.split('.')
	for(var i=0; i<path.length; i++){
		newPath = newPath+'/'+path[i]
	}

	mkdirpath('android-starterpack/app/src/androidTest/java'+newPath, setupAndroidTestPackage)
}

function setupAndroidTestPackage(){
	console.log(cyan("Setup android test directory..."))
	ncp('android-starterpack/app/src/androidTest/java/com/godohdev/androidstarterkit', 'android-starterpack/app/src/androidTest/java'+newPath, function (err) {
		if (err) {
		 	console.log(bold(red("error copying directory")));
		}else{
			if(packageName.split('.')[0].toLowerCase() != "com"){
				deleteFolderRecursive('android-starterpack/app/src/androidTest/java/com')
			}else{
				deleteFolderRecursive('android-starterpack/app/src/androidTest/java/com/godohdev')
			}
			console.log(italic(yellow("done")))
			mkdirpath('android-starterpack/app/src/test/java'+newPath, setupTestPackage)
		}
	});
}

function setupTestPackage(){
	console.log(cyan("Setup test directory"))
	ncp('android-starterpack/app/src/test/java/com/godohdev/androidstarterkit', 'android-starterpack/app/src/test/java'+newPath, function (err) {
		if (err) {
			console.log(bold(red("error copying directory")));
		}else{
			if(packageName.split('.')[0].toLowerCase() != "com"){
				deleteFolderRecursive('android-starterpack/app/src/test/java/com')
			}else{
				deleteFolderRecursive('android-starterpack/app/src/test/java/com/godohdev')
			}
			console.log(italic(yellow("done")))
			mkdirpath('android-starterpack/app/src/main/java'+newPath, setupMainPackage)
		}
	});
}

function setupMainPackage(){
	console.log(cyan("Setup main directory"))
	ncp('android-starterpack/app/src/main/java/com/godohdev/androidstarterkit', 'android-starterpack/app/src/main/java'+newPath, function (err) {
		if (err) {
			console.log(bold(red("error copying directory")));
		}else{
			if(packageName.split('.')[0].toLowerCase() != "com"){
				deleteFolderRecursive('android-starterpack/app/src/main/java/com')
			}else{
				deleteFolderRecursive('android-starterpack/app/src/main/java/com/godohdev')
			}
			console.log(yellow("done", italic))
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
	fs.readFile(res, 'utf8', function (err,data) {
		if (err) {
		  return console.log(err);
		}
		replaceValue(/com.godohdev.androidstarterkit/g, packageName, data, res)
	 	replaceValue(/Android Starter Kit/g, appName, data, res)
	});
}

function replaceValue(pattern, value, data, res){
	var result = data.replace(pattern, value);
	fs.writeFile(res, result, 'utf8', function (err) {
		if (err) return console.log(err);
	});
}

function onErr(err) {
    console.log(bold(red(err)));
    return 1;
}