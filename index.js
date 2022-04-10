const core =  require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        let excluded_folders = core.getInput('exclude_folders', { required: false });

        excluded_folders = excluded_folders.split(',')

        let flag = true;
        for (let path of excluded_folders) {
            if (path == "./"){
                flag = false;
                console.log("pop")
            }
        }

        let changes = [];
        if (flag){
            let files = getAllFiles('./',excluded_folders);
            for (let file of files) {
                file = file.split('/');
                file.splice(0, 6);
                changes.push(file.join('/'));
            }
        }

        console.log("Los cambios::")
        console.log(changes)

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
                fle=fle.join('.');
                data = 'python3 -m pretty_yarrrml2rml -i ' + file + ' -o ' + fle + '.rml.ttl;\n'
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

function getAllFiles (dirPath, excluded_folders, arrayOfFiles) {
  let files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    let flag = true;
    for (let ex_path of excluded_folders) {
      ex_path = ex_path.split('/');
      for (const ex_file of ex_path) {
        console.log("El ex_file:: " + ex_file + " y el file:: " + file);
        if(file == ex_file )
          flag = false;
      }
    }
    if(flag){
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, excluded_folders, arrayOfFiles)
      } 
      else {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
      }
    }
  })
  return arrayOfFiles
}

main();
