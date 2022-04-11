const core =  require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        let excluded_folders = core.getInput('excluded_folders', { required: false });
        let excluded_files = core.getInput('excluded_files', { required: false });
        let only_specific_folders = core.getInput('only_specific_folders', { required: false });
        let path_to_output = core.getInput('path_to_output', { required: false });

        excluded_folders = excluded_folders.split(',');
        excluded_files = excluded_files.split(',');

        let flag = true;
        for (let path of excluded_folders) {
            if (path == "./"){
                flag = false;
            }
        }

        fs.mkdirSync(path_to_output, { recursive: true })

        let pth_fldr;
        if (only_specific_folders)
          pth_fldr=only_specific_folders;
        else
           pth_fldr='./';


        let changes = [];
        if (flag){
            let files = getAllFiles(pth_fldr,excluded_folders,excluded_files);
            for (let file of files) {
                file = file.split('/');
                file.splice(0, 6);
                changes.push(file.join('/'));
            }
        }

        console.log("Los cambios::")
        console.log(changes)

        core.setOutput('run', false);

        if(fs.mkdirSync('./pretty_yarrrml2rml-exec/', { recursive: true }))
        {
          let data='#!/bin/bash\n\n';
          fs.writeFile('./pretty_yarrrml2rml-exec/config.sh', data, err => {
                  if (err) {
                      core.setFailed(error.message);
                  }
              })
        }
        for (const file of changes) {
            let fle = file.split('.');
            const file_extension = fle.pop();

            if (file_extension == 'yml'){
                core.setOutput('run', true);
                fle=fle.join('.');
                let out_path;
                if (path_to_output)
                  out_path=path_to_output.replace("./", "") + fle.split('/').pop();
                else
                  out_path=fle;
                data = 'python3 -m pretty_yarrrml2rml -i ' + file + ' -o ' + out_path + '.rml.ttl;\n'
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

function getAllFiles (dirPath, excluded_folders, excluded_files, arrayOfFiles) {
  let files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    let flag = true;
    for (let ex_path of excluded_folders) {
      ex_path = ex_path.split('/');
      for (const ex_file of ex_path) {
        if(file == ex_file )
          flag = false;
      }
    }
    for (let ex_file of excluded_files) {
        if(file == ex_file )
          flag = false; 
    }
    if(flag){
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, excluded_folders, excluded_files, arrayOfFiles)
      } 
      else {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
      }
    }
  })
  return arrayOfFiles
}

main();
