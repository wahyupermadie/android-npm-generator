const shell = require('shelljs')
const prompt = require('prompt');
const fs = require('fs');
var glob = require("glob")

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
 	appName = process.argv.slice(2)[0]
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

function fetchGitRepo(){
	shell.exec('git clone https://github.com/wahyupermadie/android-starterpack.git', function(code, stdout, stderr){
		console.log('Exit code:', code);
		console.log('Program output:', stdout);
		console.log('Program stderr:', stderr);
		if(code == 0){
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
		}
	});
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
    console.log(err);
    return 1;
}