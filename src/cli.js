const shell = require('shelljs')
const prompt = require('prompt');
const fs = require('fs');
var glob = require("glob")

var appName = ""
var packageName = ""
const properties = [
    {
        name: 'Input Package Name ',
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
		packageName = result.name
		fetchGitRepo()
	});
}

function fetchGitRepo(){
	shell.exec('git clone https://github.com/wahyupermadie/android-starterpack.git', function(code, stdout, stderr){
		console.log('Exit code:', code);
		console.log('Program output:', stdout);
		console.log('Program stderr:', stderr);
		if(code == 0){
			executeProject()
		}
	})
}

function executeProject(){
	var getDirectories = function (src, callback) {
		glob(src + '/**/*', callback);
	};
	getDirectories('android-starterpack', function (err, res) {
		if (err) {
			console.log('Error', err);
		} else {
			console.log(res);
		}
	});
}

function onErr(err) {
    console.log(err);
    return 1;
}