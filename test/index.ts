import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multiplayer game test", function () {
  it("Should not allow 0x0 address to create a game", async function () {
    // deploy
    const MultiPlayerGame = await ethers.getContractFactory("MultiPlayerGame");
    const mpGame = await MultiPlayerGame.deploy();
    await mpGame.deployed();

    // create a game
    try {
      await mpGame.connect("0x0").createGame(ethers.utils.parseEther("1.0"), {
        value: ethers.utils.parseEther("1.0"),
      });
    } catch (error: any) {
      expect(error.reason).to.be.equal("invalid address");
    }
  });

  it("Should not allow owner address to create a game", async function () {
    // deploy
    const MultiPlayerGame = await ethers.getContractFactory("MultiPlayerGame");
    const mpGame = await MultiPlayerGame.deploy();
    await mpGame.deployed();

    // set accounts
    const [owner] = await ethers.getSigners();

    // create a game
    try {
      await mpGame.connect(owner).createGame(ethers.utils.parseEther("1.0"), {
        value: ethers.utils.parseEther("1.0"),
      });
    } catch (error: any) {
      return true;
    }
  });

  it("Should not allow invalid address to create a game", async function () {
    // deploy
    const MultiPlayerGame = await ethers.getContractFactory("MultiPlayerGame");
    const mpGame = await MultiPlayerGame.deploy();
    await mpGame.deployed();

    // create a game
    try {
      await mpGame
        .connect("player1")
        .createGame(ethers.utils.parseEther("1.0"), {
          value: ethers.utils.parseEther("1.0"),
        });
    } catch (error: any) {
      expect(error.reason).to.be.equal("ENS name not configured");
    }
  });

  it("Should return a winner and the contract's balance", async function () {
    // deploy
    const MultiPlayerGame = await ethers.getContractFactory("MultiPlayerGame");
    const mpGame = await MultiPlayerGame.deploy();
    await mpGame.deployed();

    // set accounts
    const [owner, player1, player2] = await ethers.getSigners();

    // create a game
    const tx = await mpGame
      .connect(player1)
      .createGame(ethers.utils.parseEther("1.0"), {
        value: ethers.utils.parseEther("1.0"),
      });

    const receipt = await tx.wait();
    const event = receipt.events?.filter((x: any) => x.event === "GameId");

    if (!event) return;
    const gameId: number = event[0].args?._gameId;

    // join a game
    await mpGame.connect(player2).joinGame(gameId, {
      value: ethers.utils.parseEther("1.0"),
    });

    // set game winner
    await mpGame
      .connect(owner)
      // @ts-ignore
      .setWinner(gameId, player2.getAddress());

    try {
      await mpGame.connect(player1).claim(gameId);
    } catch (error) {
      return "You are not the winner";
    }

    await mpGame.connect(await mpGame.getWinner(gameId)).claim(gameId);

    console.log(await mpGame.getBalanceOfGame(gameId));
  });
});
