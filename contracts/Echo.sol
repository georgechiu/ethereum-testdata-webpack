pragma solidity ^0.4.23;

import "./strings.sol";

contract Echo {
    using strings for *;

    event EchoEvent(string message);

    string[] words_history;
    mapping(address=>string) last_words;

    function echo(string _words) public {
        words_history.push(_words);
        last_words[msg.sender] = _words;
        emit EchoEvent("Hi, you say: ".toSlice().concat(_words.toSlice()));
    }

    function getLastWords() public view returns(string) {
        return last_words[msg.sender];
    }

    function getWordsCount() public view returns(uint) {
        return words_history.length;
    }

    function getWords(uint _id) public view returns(string) {
        return words_history[_id];
    }

    function say(string _greeting) public pure returns(string) {
        return "Hi, ".toSlice().concat(_greeting.toSlice());
    }
}