# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

vars set
Assigns a value to a configuration variable, or creates one if it doesn't exist:

$ npx hardhat vars set TEST_API_KEY
#vars get
Displays a configuration variable's value:

$ npx hardhat vars get TEST_API_KEY
1234abcd1234abcd1234abcd1234abcd
#vars list
Prints all the configuration variables stored on your machine:

$ npx hardhat vars list
TEST_API_KEY
TEST_PK
#vars delete
Removes a configuration variable:

$ npx hardhat vars delete TEST_API_KEY
