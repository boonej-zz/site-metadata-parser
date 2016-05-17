#dev_setup
npm install
cd .git/hooks

if [ -e "pre-commit" ]
then
  rm "pre-commit"
fi

ln -s ../../setup/pre-commit.sh pre-commit

cd ../../
