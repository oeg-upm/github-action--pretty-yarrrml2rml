const core =  require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function main() {
    try {

        let changes = [];
        let files = getAllFiles('./');
        for (let file of files) {
            file = file.split('/');
            file.splice(0, 6);
            changes.push(file.join('/'));
        }

        core.setOutput('run', false);

        fs.mkdirSync('./pretty_yarrrml2rml-exec/', { recursive: true })
        let data='#!/bin/bash\n\n';
        fs.writeFile('./pretty_yarrrml2rml-exec/config.sh', data, err => {
                if (err) {
                    core.setFailed(error.message);
                }
            })

        for (const file of changes) {
            let fle = file.split('.');
            const file_extension = fle.pop();

            if (file_extension == 'yml'){
                core.setOutput('run', true);
                data = 'python3 -m pretty_yarrrml2rml -i' + file + '-o' + fle + '.rml;\n'
                fs.appendFile('./pretty_yarrrml2rml-exec/config.sh',data,err => {
                    if (err) {
                        core.setFailed(error.message);
                    }
                });
            }
        }  
    }
    catch (error){
        core.setFailed(error.message);
    }
}

function getAllFiles (dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

main();
