const shell = require('shelljs')
const prompt = require('prompt');

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
		shell.exec('git clone https://github.com/wahyupermadie/android-starterpack.git')
	});
}

function onErr(err) {
    console.log(err);
    return 1;
}