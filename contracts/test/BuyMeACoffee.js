const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("BuyMeACoffee", function () {
    let owner, tipper, tipper2, tipper3;

    before(async () => {
        [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();
    });

    async function getBalance(address) {
        const balanceBitInt = await hre.ethers.provider.getBalance(address);
        return hre.ethers.utils.formatEther(balanceBitInt);
    }

    async function getContractBalance() {
        const balanceBitInt = await hre.ethers.provider.getBalance(
            buyMeACoffee.address
        );
        return hre.ethers.utils.formatEther(balanceBitInt);
    }

    async function getBalances(addresses) {
        let idx = 0;
        const balances = [];
        for (const address of addresses) {
            balances.push({
                address,
                balance: await getBalance(address),
            });
        }
        return balances;
    }

    it("Contract deployed correctly", async () => {
        const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
        buyMeACoffee = await BuyMeACoffee.deploy();

        expect(buyMeACoffee.address != "");
    });

    it("Check contract balances before purchases (0)", async () => {
        const addresses = [owner.address, tipper.address, buyMeACoffee.address];
        const balances = await getBalances(addresses);

        for (const balance of balances) {
            expect(balance.balance == 0);
        }
    });

    it(`Verify owner address`, async () => {
        const contractOwner = await buyMeACoffee.connect(owner).getOwner();
        expect(contractOwner == owner);
    });

    it("Buy the owner a few coffees", async () => {
        const tip = { value: hre.ethers.utils.parseEther("1.0") };
        await buyMeACoffee
            .connect(tipper)
            .buyCoffee("Carolina", "You're the best!", tip);
        await buyMeACoffee
            .connect(tipper2)
            .buyCoffee("Vitto", "Amazing teacher :)", tip);
        await buyMeACoffee
            .connect(tipper3)
            .buyCoffee("Kay", "I love my proof of knowledge NFT.", tip);

        const addresses = [owner.address, tipper.address, buyMeACoffee.address];
        const balances = await getBalances(addresses);

        for (const balance of balances) {
            expect(
                balance.balance.includes("9999.") ||
                    balance.balance.includes("9998.") ||
                    balance.balance.includes("3.0")
            );
        }
    });

    it("Transfer ownership", async () => {
        await buyMeACoffee.connect(owner).transferOwnership(tipper.address);
        const contractOwner = await buyMeACoffee.connect(owner).getOwner();
        expect(contractOwner == tipper.address);
    });

    it("Attempt to withdraw funds from original owner (fail)", async () => {
        let failed = false;
        try {
            await buyMeACoffee.connect(owner).withdrawTips();
        } catch (ex) {
            failed = true;
        }
        expect(failed);
    });

    it("Attempt to withdraw funds from tipper", async () => {
        await buyMeACoffee.connect(tipper).withdrawTips();
    });

    it("Verify contract balances after withdrawl", async () => {
        const balance = await getContractBalance();
        expect(balance == 0.0);
    });

    it("Verify memos", async () => {
        const memos = await buyMeACoffee.getMemos();
        for (const memo of memos) {
            const { message } = memo;
            expect(
                message.includes("I love") ||
                    message.includes("Amazing") ||
                    message.includes("You're")
            );
        }
    });
});
