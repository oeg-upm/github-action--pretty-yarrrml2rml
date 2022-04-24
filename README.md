# github-action-pretty-yarrrml2rml
This GitHub Action action uses the tool [pretty-yarrrml2rml](https://github.com/oeg-upm/pretty-yarrrml2rml) to translate yml files into rml.ttl files.

## Usage
The file extension needs to be `.yml`.

If you want to execute the Action you must add the word `yarrrml2rml` in the commit. (dependant on the pipeline)

Create a `.github.workflows/yarrrml2rml.yaml` file in the repository with the following example workflow:

```
name: pipeline
on:
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    name: action-pretty-yarrrml2rml
    steps:
    
      - name: commit trigger
        id: 'commit_trigger'
        run: |
          case "${{ github.event.head_commit.message }}" in
              *yarrrml2rml* ) echo "::set-output name=trigger::true";;
              * ) echo "::set-output name=trigger::false";;
          esac

      - name: checkout
        uses: actions/checkout@v2

      - name: installing yarrrml2rml
        run: |
          if ${{ steps.commit_trigger.outputs.trigger }}
          then
            python3 -m pip install pretty-yarrrml2rml
          fi

      - name: action-yarrrml2rml
        uses: oeg-upm/github-action-pretty-yarrrml2rml@v0.1.0
        id: 'action-yarrrml2rml'
        with:
          excluded_folders: './node_modules,./.github,./.git'
          excluded_files: 'action.yml'
          only_specific_folders: './test/'
          path_to_output: './test/output/'

      - name: running yarrrml2rml
        run: |
          if ${{ steps.action-yarrrml2rml.outputs.run }} && ${{ steps.commit_trigger.outputs.trigger }}
          then
            sh ./pretty_yarrrml2rml-exec/config.sh
            rm -r ./pretty_yarrrml2rml-exec

            git config --global user.name 'github-actions[bot]'
            git config --global user.email '41898282+github-actions[bot]@users.noreply.github.com'
            git add .
            set +e
            git status | grep "nothing to commit, working tree clean"
            if [ $? -eq 0 ]; then set -e; echo "INFO: No changes since last run"; else set -e; \
              git commit -m "morph-kgc result for ${{ github.actor }} - ${{ github.event.number }}" --allow-empty; git push --force; fi
          fi

```
## Inputs
### `excluded_folders` (optional)
The folders that needs to be excluded for execution, needs the full path and the different paths are separated by `,` .
### `excluded_files`  (optional)
The files that needs to be excluded for execution, needs the full path without the first ./ and the different paths are separated by `,`.
### `only_specific_folders` (optional)
Just the files in this folders are executed, needs the full path and the different paths are separated by `,`.
### `path_to_output` (optional)
The path to the output, needs the full path.

If this option is not present the Action will put the results in the same path as the inputs.
## Outputs
### run
Tells the pipeline if morph-kgc needs to be executed.
- `true` if there are mapping files.
- `false` if there are no mapping files.
