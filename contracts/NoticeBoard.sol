// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract NoticeBoard {
    struct Entry {
        address author;
        string text;
        uint8 score;
        string summary;
        uint256 timestamp;
    }

    Entry[] private entries;

    event EntryAdded(uint256 indexed id, address indexed author, uint8 score);

    function addEntry(
        string calldata text,
        uint8 score,
        string calldata summary
    ) external {
        require(bytes(text).length > 0 && bytes(text).length <= 280, "Text must be 1-280 characters");
        require(bytes(summary).length <= 280, "Summary too long");
        require(score <= 10, "Score must be 0-10");

        entries.push(Entry(msg.sender, text, score, summary, block.timestamp));
        emit EntryAdded(entries.length - 1, msg.sender, score);
    }

    function getEntries() external view returns (Entry[] memory) {
        return entries;
    }

    function entryCount() external view returns (uint256) {
        return entries.length;
    }
}