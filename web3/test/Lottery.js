const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { utils } = require("ethers");

describe("Lottery", function () {

    async function deploy() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await ethers.getSigners();

        const Lottery = await ethers.getContractFactory("Lottery");
        const lottery = await Lottery.deploy();

        return { lottery, owner, otherAccount };
    }

    beforeEach(async function () {
        await loadFixture(deploy);
    });

    describe("totalSupply()", function () {
        it(`totalSupply()`, async function () {
            const { lottery } = await loadFixture(deploy);
            expect(await lottery.totalSupply()).to.equal(0);
        });
    });
});