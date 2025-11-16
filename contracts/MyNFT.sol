pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage, Ownable{
    event Minted(address to, uint256 tokenId, string tokenURI);
    uint256 private _tokenIdCounter;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender){}
    function mint(address to, string memory tokenURI) public onlyOwner returns(uint256){
        _tokenIdCounter++;
        _mint(to, _tokenIdCounter);
        _setTokenURI(_tokenIdCounter, tokenURI);
        emit Minted(to, _tokenIdCounter, tokenURI);
        return _tokenIdCounter;
    }
}