// scripts/withdraw.js

const hre = require("hardhat");

async function getBalance(address) {
    const balanceBigInt = await hre.ethers.provider.getBalance(address);
    return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
    const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
    const buyMeACoffee = await BuyMeACoffee.deploy();
    await buyMeACoffee.deployed();

    const [owner] = await hre.ethers.getSigners();

    // Check starting balances.
    console.log(
        "current balance of owner: ",
        await getBalance(owner.address),
        "ETH"
    );
    const contractBalance = await getBalance(buyMeACoffee.address);
    console.log(
        "current balance of contract: ",
        await getBalance(buyMeACoffee.address),
        "ETH"
    );

    // Withdraw funds if there are funds to withdraw.
    if (contractBalance !== "0.0") {
        console.log("withdrawing funds..");
        const withdrawTxn = await buyMeACoffee.withdrawTips();
        await withdrawTxn.wait();
    } else {
        console.log("no funds to withdraw!");
    }

    // Check ending balance.
    console.log(
        "current balance of owner: ",
        await getBalance(owner.address),
        "ETH"
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
