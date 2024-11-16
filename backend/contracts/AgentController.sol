// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @custom:security-contact gonza.otc@gmail.com
contract AgentController is ERC721URIStorage {
    constructor(
        string memory name,
        string memory symbol,
        string memory uri
    ) ERC721(name, symbol) {
        _safeMint(msg.sender, 0); // Mint token ID 0 to the deployer
        _setTokenURI(0, uri); // Set the metadata URI for token ID 0
    }
}
